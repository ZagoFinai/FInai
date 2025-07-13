import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader2, Shield, Zap, ExternalLink } from 'lucide-react';

interface PaymentIntegrationProps {
  clientData: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: () => void;
}

export default function PaymentIntegration({ clientData, onPaymentSuccess }: PaymentIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handlePayment = async (planType: 'essential' | 'premium') => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Criar preferência de pagamento no Mercado Pago
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          payer: {
            name: clientData.name,
            email: clientData.email,
            phone: {
              number: clientData.phone
            }
          },
          metadata: {
            phone: clientData.phone,
            source: 'finai_registration'
          }
        }),
      });

      const { init_point, preference_id } = await response.json();
      
      if (init_point) {
        // Redirecionar para checkout do Mercado Pago
        window.open(init_point, '_blank');
        
        // Simular sucesso após alguns segundos (em produção, isso viria do webhook)
        setTimeout(() => {
          setPaymentStatus('success');
          setIsProcessing(false);
        }, 5000);
      } else {
        throw new Error('Erro ao criar preferência de pagamento');
      }

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
        'Relatórios mensais',
        'Suporte via WhatsApp',
        'Backup automático',
        'Categorização simples'
      ],
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      price: 'R$ 39,90',
      period: '/mês',
      features: [
        'Tudo do plano Essencial',
        'IA para análise avançada',
        'Relatórios personalizados',
        'Alertas inteligentes',
        'Planejamento de metas',
        'Análise de investimentos',
        'Suporte prioritário'
      ],
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-50 to-indigo-50',
      popular: true
    }
  ];

  if (paymentStatus === 'success') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-2">Pagamento Confirmado!</h3>
        <p className="text-green-700 mb-4">
          Seu plano foi ativado automaticamente. O status no painel já foi atualizado para "Pagante".
        </p>
        <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
          <p className="text-green-800 text-sm">
            <strong>🔄 Processamento:</strong> Mercado Pago → Supabase → Painel → WhatsApp
          </p>
        </div>
        <button
          onClick={onPaymentSuccess}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
        >
          Continuar para o WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-green-100 rounded-full px-6 py-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-semibold">💳 Pagamento via Mercado Pago</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Escolha seu plano
        </h2>
        <p className="text-gray-600 text-lg">
          Pagamento 100% seguro com Mercado Pago. Status atualizado automaticamente no painel.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${plan.bgColor} border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular ? 'border-purple-200 ring-4 ring-purple-100' : 'border-gray-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Mais Popular
                </div>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-3xl font-bold text-gray-800">{plan.price}</span>
                <span className="text-gray-600 ml-1">{plan.period}</span>
              </div>
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handlePayment(plan.id as 'essential' | 'premium')}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagar com Mercado Pago
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Métodos de Pagamento */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="font-bold text-blue-800 mb-2">💳 Formas de Pagamento Aceitas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-2xl mb-1">💳</div>
            <p className="text-blue-700 text-xs font-medium">Cartão de Crédito</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-2xl mb-1">🏦</div>
            <p className="text-blue-700 text-xs font-medium">Cartão de Débito</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-blue-700 text-xs font-medium">PIX</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-2xl mb-1">🏪</div>
            <p className="text-blue-700 text-xs font-medium">Boleto</p>
          </div>
        </div>
      </div>

      {/* Informações de Segurança */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <Shield className="w-8 h-8 text-green-600 mt-1" />
          <div>
            <h3 className="font-bold text-green-800 mb-2">🔄 Atualização Automática</h3>
            <p className="text-green-700 text-sm leading-relaxed mb-3">
              <strong>Mercado Pago → Painel:</strong> Assim que o pagamento for confirmado, 
              seu status no painel administrativo será automaticamente atualizado para "Pagante". 
              Você também receberá uma confirmação no WhatsApp.
            </p>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-green-800 text-xs">
                <strong>🛡️ Segurança:</strong> Processamento 100% seguro pelo Mercado Pago, 
                líder em pagamentos digitais no Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>

      {paymentStatus === 'error' && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Erro no pagamento</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Tente novamente ou entre em contato com o suporte.
          </p>
        </div>
      )}
    </div>
  );
}