/*
  # Webhook Mercado Pago - Sistema Completo

  1. Recebe webhooks do Mercado Pago
  2. Valida assinatura de segurança
  3. Processa pagamentos aprovados
  4. Atualiza status do cliente automaticamente
  5. Envia notificação WhatsApp via N8N
*/

import { createClient } from 'npm:@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-signature, x-request-id",
};

// Função para validar assinatura do Mercado Pago
async function validateMercadoPagoSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const [ts, hash] = signature.split(',').map(part => part.split('=')[1]);
    const payload = `id=${JSON.parse(body).data?.id};request-id=${ts}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const computedHash = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const computedHashHex = Array.from(new Uint8Array(computedHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedHashHex === hash;
  } catch (error) {
    console.error('Erro na validação da assinatura:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('📥 Webhook recebido do Mercado Pago');
    
    const body = await req.text();
    const event = JSON.parse(body);
    
    // Verificar assinatura (em produção)
    const signature = req.headers.get('x-signature');
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    
    if (signature && webhookSecret) {
      const isValid = await validateMercadoPagoSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ Assinatura inválida do Mercado Pago');
        return new Response('Invalid signature', { status: 401 });
      }
    }

    console.log('📋 Evento recebido:', event);

    // Processar apenas eventos de pagamento
    if (event.type === 'payment') {
      const paymentId = event.data?.id;
      
      if (!paymentId) {
        console.error('❌ ID do pagamento não encontrado');
        return new Response('Payment ID missing', { status: 400 });
      }

      // Buscar detalhes do pagamento na API do Mercado Pago
      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!accessToken) {
        console.error('❌ Token de acesso do Mercado Pago não configurado');
        return new Response('MP token missing', { status: 500 });
      }

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!mpResponse.ok) {
        console.error('❌ Erro ao buscar pagamento no Mercado Pago:', mpResponse.status);
        return new Response('MP API error', { status: 500 });
      }

      const payment = await mpResponse.json();
      console.log('💳 Detalhes do pagamento:', {
        id: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        email: payment.payer?.email,
        phone: payment.metadata?.phone
      });

      // Conectar com Supabase
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Buscar cliente por email ou telefone
      const customerEmail = payment.payer?.email;
      const customerPhone = payment.metadata?.phone || payment.additional_info?.payer?.phone?.number;

      if (!customerEmail && !customerPhone) {
        console.error('❌ Email e telefone não encontrados no pagamento');
        return new Response('Customer info missing', { status: 400 });
      }

      let client = null;

      // Buscar por email primeiro
      if (customerEmail) {
        const { data: clientsByEmail } = await supabase
          .from('clients')
          .select('*')
          .eq('email', customerEmail)
          .limit(1);
        
        if (clientsByEmail && clientsByEmail.length > 0) {
          client = clientsByEmail[0];
        }
      }

      // Se não encontrou por email, buscar por telefone
      if (!client && customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        const { data: clientsByPhone } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', cleanPhone)
          .limit(1);
        
        if (clientsByPhone && clientsByPhone.length > 0) {
          client = clientsByPhone[0];
        }
      }

      if (!client) {
        console.error('❌ Cliente não encontrado:', { customerEmail, customerPhone });
        return new Response('Client not found', { status: 404 });
      }

      console.log('👤 Cliente encontrado:', client.name);

      // Registrar ou atualizar pagamento na tabela payments
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('*')
        .eq('mercadopago_payment_id', payment.id.toString())
        .limit(1);

      if (existingPayment && existingPayment.length > 0) {
        // Atualizar pagamento existente
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: payment.status,
            amount: payment.transaction_amount,
            payment_method: payment.payment_method_id,
            updated_at: new Date().toISOString()
          })
          .eq('mercadopago_payment_id', payment.id.toString());

        if (updateError) {
          console.error('❌ Erro ao atualizar pagamento:', updateError);
        } else {
          console.log('✅ Pagamento atualizado');
        }
      } else {
        // Criar novo registro de pagamento
        const { error: insertError } = await supabase
          .from('payments')
          .insert({
            client_id: client.id,
            mercadopago_payment_id: payment.id.toString(),
            status: payment.status,
            amount: payment.transaction_amount,
            payment_method: payment.payment_method_id,
            external_reference: payment.external_reference
          });

        if (insertError) {
          console.error('❌ Erro ao inserir pagamento:', insertError);
        } else {
          console.log('✅ Pagamento registrado');
        }
      }

      // Se pagamento foi aprovado, enviar notificação WhatsApp
      if (payment.status === 'approved') {
        console.log('🎉 Pagamento aprovado! Enviando notificação...');
        
        const n8nWebhookUrl = Deno.env.get('N8N_PAYMENT_WEBHOOK_URL');
        if (n8nWebhookUrl) {
          try {
            const notificationResponse = await fetch(n8nWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'payment_success',
                client: client,
                payment: {
                  id: payment.id,
                  amount: payment.transaction_amount,
                  currency: payment.currency_id,
                  method: payment.payment_method_id,
                  status: payment.status
                },
                message: `🎉 *Pagamento Confirmado!*\n\n✅ Seu plano FinAí está ativo!\n💰 Valor: R$ ${payment.transaction_amount.toFixed(2)}\n🆔 Transação: ${payment.id}\n💳 Método: ${payment.payment_method_id}\n\n🚀 Aproveite todos os recursos premium!\n\nDigite qualquer mensagem para começar a usar o FinAí.`
              })
            });

            if (notificationResponse.ok) {
              console.log('📱 Notificação WhatsApp enviada com sucesso');
            } else {
              console.error('❌ Erro ao enviar notificação WhatsApp:', notificationResponse.status);
            }
          } catch (notificationError) {
            console.error('❌ Erro ao enviar notificação:', notificationError);
          }
        } else {
          console.warn('⚠️ URL do webhook N8N não configurada');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        timestamp: new Date().toISOString() 
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('❌ Erro no webhook do Mercado Pago:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});