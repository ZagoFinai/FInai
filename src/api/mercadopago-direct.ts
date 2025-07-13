// API direta do Mercado Pago sem Supabase

export interface MercadoPagoPreference {
  items: Array<{
    title: string;
    description: string;
    unit_price: number;
    quantity: number;
    currency_id: string;
  }>;
  payer: {
    name: string;
    email: string;
    phone: {
      number: string;
    };
  };
  metadata: {
    client_id: string;
    phone: string;
    source: string;
    plan_type: string;
  };
  notification_url: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  external_reference: string;
}

export interface PaymentNotification {
  type: string;
  client: any;
  payment: any;
  message: string;
}

// Configuração dos produtos
export const MERCADOPAGO_PRODUCTS = {
  essential: {
    title: 'FinAí - Plano Essencial',
    description: 'Controle financeiro básico com IA',
    unit_price: 19.90,
    currency_id: 'BRL',
  },
  premium: {
    title: 'FinAí - Plano Premium', 
    description: 'Controle financeiro avançado com IA e relatórios',
    unit_price: 39.90,
    currency_id: 'BRL',
  },
};

// Função para criar preferência de pagamento
export const createMercadoPagoPreference = async (
  planType: 'essential' | 'premium',
  clientData: { id: string; name: string; email: string; phone: string }
): Promise<{ init_point: string; preference_id: string }> => {
  
  const product = MERCADOPAGO_PRODUCTS[planType];
  const n8nWebhookUrl = 'https://seu-n8n.com/webhook/payment-webhook'; // Substitua pela sua URL
  
  const preference: MercadoPagoPreference = {
    items: [
      {
        title: product.title,
        description: product.description,
        unit_price: product.unit_price,
        quantity: 1,
        currency_id: product.currency_id,
      }
    ],
    payer: {
      name: clientData.name,
      email: clientData.email,
      phone: {
        number: clientData.phone
      }
    },
    metadata: {
      client_id: clientData.id,
      phone: clientData.phone,
      source: 'finai_registration',
      plan_type: planType
    },
    notification_url: n8nWebhookUrl,
    back_urls: {
      success: `${window.location.origin}/?payment=success&client=${clientData.id}`,
      failure: `${window.location.origin}/?payment=failure`,
      pending: `${window.location.origin}/?payment=pending&client=${clientData.id}`
    },
    auto_return: 'approved',
    external_reference: `finai_${clientData.id}_${Date.now()}`,
  };

  // Em produção, isso seria uma chamada para seu backend que faz a requisição para o MP
  // Por enquanto, vamos simular a resposta
  const mockResponse = {
    init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${Date.now()}`,
    preference_id: `mock_${Date.now()}`
  };

  // Salvar dados do pagamento pendente no localStorage
  const pendingPayments = JSON.parse(localStorage.getItem('finai_pending_payments') || '[]');
  pendingPayments.push({
    client_id: clientData.id,
    preference_id: mockResponse.preference_id,
    plan_type: planType,
    amount: product.unit_price,
    created_at: new Date().toISOString(),
    status: 'pending'
  });
  localStorage.setItem('finai_pending_payments', JSON.stringify(pendingPayments));

  return mockResponse;
};

// Função para processar confirmação de pagamento (chamada quando volta do MP)
export const processPaymentConfirmation = (clientId: string, status: 'success' | 'failure' | 'pending') => {
  if (status === 'success') {
    // Atualizar status do cliente para "Pagante"
    const clients = JSON.parse(localStorage.getItem('finai_clients') || '[]');
    const updatedClients = clients.map((client: any) => 
      client.id === clientId 
        ? { 
            ...client, 
            status: 'Pagante',
            lastActivity: new Date().toLocaleDateString('pt-BR'),
            paymentDate: new Date().toLocaleDateString('pt-BR')
          }
        : client
    );
    localStorage.setItem('finai_clients', JSON.stringify(updatedClients));

    // Atualizar pagamento pendente
    const pendingPayments = JSON.parse(localStorage.getItem('finai_pending_payments') || '[]');
    const updatedPayments = pendingPayments.map((payment: any) =>
      payment.client_id === clientId
        ? { ...payment, status: 'approved', updated_at: new Date().toISOString() }
        : payment
    );
    localStorage.setItem('finai_pending_payments', JSON.stringify(updatedPayments));

    // Enviar notificação para N8N (opcional)
    const client = updatedClients.find((c: any) => c.id === clientId);
    if (client) {
      sendPaymentNotificationToN8N({
        type: 'payment_success',
        client: client,
        payment: {
          status: 'approved',
          amount: MERCADOPAGO_PRODUCTS.essential.unit_price, // ou premium
          method: 'mercadopago'
        },
        message: `🎉 *Pagamento Confirmado!*\n\n✅ Seu plano FinAí está ativo!\n💰 Valor: R$ ${MERCADOPAGO_PRODUCTS.essential.unit_price.toFixed(2)}\n\n🚀 Aproveite todos os recursos premium!\n\nDigite qualquer mensagem para começar a usar o FinAí.`
      });
    }

    return true;
  }
  
  return false;
};

// Função para enviar notificação para N8N
export const sendPaymentNotificationToN8N = async (notification: PaymentNotification) => {
  const n8nWebhookUrl = 'https://seu-n8n.com/webhook/payment-webhook'; // Substitua pela sua URL
  
  try {
    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification)
    });
    console.log('✅ Notificação enviada para N8N');
  } catch (error) {
    console.error('❌ Erro ao enviar notificação para N8N:', error);
  }
};

// Função para verificar status de pagamentos pendentes (polling)
export const checkPendingPayments = () => {
  const pendingPayments = JSON.parse(localStorage.getItem('finai_pending_payments') || '[]');
  const clients = JSON.parse(localStorage.getItem('finai_clients') || '[]');
  
  // Simular alguns pagamentos aprovados após 30 segundos (para demonstração)
  const now = new Date();
  const updatedPayments = pendingPayments.map((payment: any) => {
    const createdAt = new Date(payment.created_at);
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    // Simular aprovação após 0.5 minutos (30 segundos)
    if (payment.status === 'pending' && diffMinutes > 0.5) {
      // Atualizar cliente
      const updatedClients = clients.map((client: any) =>
        client.id === payment.client_id
          ? { 
              ...client, 
              status: 'Pagante',
              lastActivity: new Date().toLocaleDateString('pt-BR'),
              paymentDate: new Date().toLocaleDateString('pt-BR')
            }
          : client
      );
      localStorage.setItem('finai_clients', JSON.stringify(updatedClients));
      
      // Enviar notificação
      const client = updatedClients.find((c: any) => c.id === payment.client_id);
      if (client) {
        sendPaymentNotificationToN8N({
          type: 'payment_success',
          client: client,
          payment: {
            status: 'approved',
            amount: payment.amount,
            method: 'mercadopago'
          },
          message: `🎉 *Pagamento Confirmado!*\n\n✅ Seu plano FinAí está ativo!\n💰 Valor: R$ ${payment.amount.toFixed(2)}\n\n🚀 Aproveite todos os recursos premium!\n\nDigite qualquer mensagem para começar a usar o FinAí.`
        });
      }
      
      return { ...payment, status: 'approved', updated_at: new Date().toISOString() };
    }
    
    return payment;
  });
  
  localStorage.setItem('finai_pending_payments', JSON.stringify(updatedPayments));
};