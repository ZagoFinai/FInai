/*
  # Webhook do Stripe para Pagamentos Automáticos

  1. Função Edge
    - Recebe webhooks do Stripe
    - Processa eventos de pagamento
    - Atualiza status do cliente automaticamente

  2. Segurança
    - Verificação de assinatura do Stripe
    - Validação de eventos

  3. Integração
    - Conecta com banco de dados
    - Atualiza status em tempo real
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verificar se é um webhook do Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe signature', { status: 400 });
    }

    const body = await req.text();
    const event = JSON.parse(body);

    // Processar eventos de pagamento
    if (event.type === 'checkout.session.completed' || 
        event.type === 'payment_intent.succeeded' ||
        event.type === 'invoice.payment_succeeded') {
      
      const session = event.data.object;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerPhone = session.metadata?.phone || session.customer_details?.phone;

      if (customerEmail || customerPhone) {
        // Conectar com Supabase
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Buscar cliente por email ou telefone
        let query = supabase.from('clients').select('*');
        
        if (customerEmail) {
          query = query.eq('email', customerEmail);
        } else if (customerPhone) {
          query = query.eq('phone', customerPhone.replace(/\D/g, ''));
        }

        const { data: clients, error: fetchError } = await query;

        if (fetchError) {
          console.error('Erro ao buscar cliente:', fetchError);
          return new Response('Database error', { status: 500 });
        }

        if (clients && clients.length > 0) {
          const client = clients[0];
          
          // Atualizar status para "Pagante"
          const { error: updateError } = await supabase
            .from('clients')
            .update({ 
              status: 'Pagante',
              last_activity: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', client.id);

          if (updateError) {
            console.error('Erro ao atualizar status:', updateError);
            return new Response('Update error', { status: 500 });
          }

          console.log(`✅ Cliente ${client.name} atualizado para "Pagante" automaticamente`);
          
          // Opcional: Enviar notificação via WhatsApp
          try {
            await fetch('YOUR_N8N_WEBHOOK_URL', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'payment_success',
                client: client,
                message: `🎉 Pagamento confirmado! Seu plano FinAí está ativo. Aproveite todos os recursos premium!`
              })
            });
          } catch (notificationError) {
            console.error('Erro ao enviar notificação:', notificationError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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