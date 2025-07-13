import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader2, Shield, Zap, ExternalLink, DollarSign } from 'lucide-react';

interface PaymentSectionProps {
  clientData: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: () => void;
}

export default function PaymentSection({ clientData, onPaymentSuccess }: PaymentSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [selectedPlan, setSelectedPlan] = useState<'essential' | 'premium' | null>(null);

  const handlePayment = async (planType: 'essential' | 'premium') => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setSelectedPlan(planType);

    try {
      // Simular criação de preferência do Mercado Pago
      // Em produção, isso seria uma chamada real para sua API
      const preferenceData = {
        items: [
          {
            title: planType === 'essential' ? 'FinAí - Plano Essencial' : 'FinAí - Plano Premium',
            description: planType === 'essential' ? 'Controle financeiro básico' : 'Controle financeiro avançado',
            unit_price: planType === 'essential' ? 19.90 : 39.90,
            quantity: 1,
            currency_id: 'BRL'
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
        notification_url: `${window.location.origin}/api/mercadopago/webhook`,
        back_urls: {
          success: `${window.location.origin}/?payment=success`,
          failure: `${window.location.origin}/?payment=failure`,
          pending: `${window.location.origin}/?payment=pending`
        },
        auto_return: 'approved'
      };

      // Simular resposta do Mercado Pago
      const mockResponse = {
        init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${Date.now()}`,
        preference_id: `mock_${Date.now()}`
      };

      // Abrir checkout do Mercado Pago em nova aba
      window.open(mockResponse.init_point, '_blank');
      
      // Simular confirmação de pagamento após alguns segundos
      setTimeout(() => {
        setPaymentStatus('success');
        setIsProcessing(false);
        onPaymentSuccess();
      }, 8000);

    } catch (error) {
      console.error('Erro no pagamento:', error);
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'essential',
      name: 'Plano Essencial',
      price: 'R$ 19,90',
      period: '/mês',
      features: [
        'Controle básico de receitas e despesas',
        'Relatórios mensais simples',
        'Suporte via WhatsApp',
        'Backup automático na nuvem',
        'Categorização automática'
      ],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      price: 'R$ 39,90',
      period: '/mês',
      features: [
        'Tudo do plano Essencial',
        'IA avançada para análise financeira',
        'Relatórios personalizados e detalhados',
        'Alertas inteligentes e previsões',
        'Planejamento de metas financeiras',
        'Análise de investimentos',
        'Suporte prioritário 24/7'
      ],
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
      popular: true
    }
  ];

  if (paymentStatus === 'success') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-pulse" />
        <h3 className="text-3xl font-bold text-green-800 mb-4">🎉 Pagamento Confirmado!</h3>
        <p className="text-green-700 mb-6 text-lg">
          Seu plano <strong>{selectedPlan === 'essential' ? 'Essencial' : 'Premium'}</strong> foi ativado automaticamente!
        </p>
        
        <div className="bg-white rounded-xl p-6 border border-green-200 mb-6">
          <h4 className="font-bold text-green-800 mb-3">🔄 Processamento Automático Concluído</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700">Mercado Pago ✅</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700">Painel Atualizado ✅</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700">WhatsApp Notificado ✅</span>
            </div>
          </div>
        </div>

        <button
          onClick={onPaymentSuccess}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] shadow-lg"
        >
          <ExternalLink className="w-5 h-5 mr-2 inline" />
          Continuar para o WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-green-100 rounded-full px-6 py-3 mb-6">
          <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
          <span className="text-blue-800 font-bold text-lg">💳 Pagamento Mercado Pago</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Escolha seu plano FinAí
        </h2>
        <p className="text-gray-600 text-xl leading-relaxed">
          Pagamento 100% seguro. Status atualizado automaticamente no painel administrativo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-3xl bg-gradient-to-br ${plan.bgColor} border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
              plan.popular ? `${plan.borderColor} ring-4 ring-purple-100` : `${plan.borderColor}`
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Mais Popular
                </div>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} text-white mb-4`}>
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{plan.name}</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-bold text-gray-800">{plan.price}</span>
                <span className="text-gray-600 ml-2 text-lg">{plan.period}</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handlePayment(plan.id as 'essential' | 'premium')}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg hover:shadow-xl`}
            >
              {isProcessing && selectedPlan === plan.id ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Redirecionando para Mercado Pago...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-3" />
                  Pagar com Mercado Pago
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Métodos de Pagamento */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-8 mb-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-blue-800 mb-3">💳 Formas de Pagamento Aceitas</h3>
          <p className="text-blue-700">Escolha a forma que preferir no checkout do Mercado Pago</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-blue-200 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📱</div>
            <p className="text-blue-700 font-bold">PIX</p>
            <p className="text-blue-600 text-sm">Instantâneo</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-blue-200 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-blue-700 font-bold">Cartão de Crédito</p>
            <p className="text-blue-600 text-sm">Todas as bandeiras</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-blue-200 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🏦</div>
            <p className="text-blue-700 font-bold">Cartão de Débito</p>
            <p className="text-blue-600 text-sm">Débito online</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-blue-200 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🏪</div>
            <p className="text-blue-700 font-bold">Boleto</p>
            <p className="text-blue-600 text-sm">Vence em 3 dias</p>
          </div>
        </div>
      </div>

      {/* Informações de Segurança e Automação */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
        <div className="flex items-start space-x-6">
          <Shield className="w-12 h-12 text-green-600 mt-2" />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-800 mb-4">🔄 Sistema Totalmente Automático</h3>
            <p className="text-green-700 text-lg leading-relaxed mb-6">
              Assim que seu pagamento for confirmado pelo Mercado Pago, nosso sistema fará tudo automaticamente:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-green-800">Atualização Instantânea</span>
                </div>
                <p className="text-green-700 text-sm">
                  Seu status no painel administrativo muda automaticamente para "Pagante"
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-3">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                  <span className="font-bold text-green-800">Notificação WhatsApp</span>
                </div>
                <p className="text-green-700 text-sm">
                  Você recebe confirmação automática no WhatsApp com todos os detalhes
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-green-200">
              <p className="text-green-800 font-mono text-sm">
                <strong>🔄 Fluxo:</strong> Mercado Pago → Webhook → Supabase → Painel → WhatsApp (100% automático)
              </p>
            </div>
          </div>
        </div>
      </div>

      {paymentStatus === 'error' && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-red-800 font-bold text-lg">Erro no pagamento</span>
          </div>
          <p className="text-red-700">
            Houve um problema ao processar seu pagamento. Tente novamente ou entre em contato com o suporte.
          </p>
        </div>
      )}
    </div>
  );
}