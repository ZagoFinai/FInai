// API do Mercado Pago para integração com pagamentos

export interface CreatePreferenceRequest {
  planType: 'essential' | 'premium';
  payer: {
    name: string;
    email: string;
    phone: {
      number: string;
    };
  };
  metadata?: Record<string, string>;
}

export interface CreatePreferenceResponse {
  init_point: string;
  preference_id: string;
}

export const createPreference = async (
  data: CreatePreferenceRequest
): Promise<CreatePreferenceResponse> => {
  // Em produção, isso seria uma chamada para sua API backend
  const response = await fetch('/api/mercadopago/create-preference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar preferência de pagamento');
  }

  return response.json();
};

// Configuração dos produtos no Mercado Pago
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

// Função para criar preferência de pagamento (exemplo para backend)
export const createMercadoPagoPreference = async (planType: 'essential' | 'premium', clientData: any) => {
  const product = MERCADOPAGO_PRODUCTS[planType];
  
  const preference = {
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
      phone: clientData.phone,
      source: 'finai_registration',
      plan_type: planType
    },
    notification_url: 'https://seu-projeto.supabase.co/functions/v1/mercadopago-webhook',
    back_urls: {
      success: 'https://cadastrofinai.netlify.app/?payment=success',
      failure: 'https://cadastrofinai.netlify.app/?payment=failure',
      pending: 'https://cadastrofinai.netlify.app/?payment=pending'
    },
    auto_return: 'approved',
    external_reference: `finai_${Date.now()}`,
  };

  return preference;
};