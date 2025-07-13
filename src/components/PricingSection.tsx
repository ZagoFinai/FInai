import React from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';

const plans = [
  {
    name: 'Plano Essencial',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Perfeito para começar sua organização financeira',
    features: [
      'Controle básico de receitas e despesas',
      'Relatórios mensais',
      'Suporte via WhatsApp',
      'Backup automático',
      'Categorização simples'
    ],
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50',
    icon: Zap
  },
  {
    name: 'Plano Premium',
    price: 'R$ 39,90',
    period: '/mês',
    description: 'Para quem quer máximo controle financeiro',
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
    icon: Crown,
    popular: true
  }
];

export default function PricingSection() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-30"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-2 mb-4">
            <Star className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-800 font-semibold">Planos e Preços</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Escolha seu plano ideal
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comece com 3 dias grátis e descubra como o FinAí pode transformar suas finanças
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl bg-gradient-to-br ${plan.bgColor} border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                plan.popular ? 'border-purple-200 ring-4 ring-purple-100' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Mais Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} text-white mb-4`}>
                  <plan.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all duration-200 hover:scale-[1.02]`}>
                Escolher {plan.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl px-8 py-4">
            <div className="text-3xl mr-3">🎁</div>
            <div>
              <p className="font-bold text-green-800 text-lg">3 dias de teste grátis</p>
              <p className="text-green-700 text-sm">Experimente todos os recursos premium sem compromisso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}