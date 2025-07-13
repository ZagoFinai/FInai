// Simulação da API do Stripe para demonstração
// Em produção, isso seria implementado no backend

export interface CreateCheckoutSessionRequest {
  planType: 'essential' | 'premium';
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export const createCheckoutSession = async (
  data: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> => {
  // Em produção, isso seria uma chamada real para sua API
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar sessão de checkout');
  }

  return response.json();
};

// Configuração dos produtos no Stripe
export const STRIPE_PRODUCTS = {
  essential: {
    priceId: 'price_essential_monthly', // ID do preço no Stripe
    amount: 1990, // R$ 19,90 em centavos
  },
  premium: {
    priceId: 'price_premium_monthly', // ID do preço no Stripe
    amount: 3990, // R$ 39,90 em centavos
  },
};