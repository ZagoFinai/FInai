import React, { useState } from 'react';
import { TrendingUp, DollarSign, Bell, MessageCircle, CheckCircle, BarChart3, PieChart, Calendar, Shield } from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Controle Completo de Finanças',
    description: 'Organize despesas, receitas e investimentos em um só lugar',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50'
  },
  {
    icon: TrendingUp,
    title: 'Análise em Tempo Real',
    description: 'Gráficos e relatórios para acompanhar sua evolução financeira',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50'
  },
  {
    icon: Bell,
    title: 'Alertas Inteligentes',
    description: 'Notificações sobre vencimentos, metas e oportunidades',
    color: 'from-orange-500 to-red-600',
    bgColor: 'from-orange-50 to-red-50'
  },
  {
    icon: MessageCircle,
    title: 'Integração WhatsApp',
    description: 'Acesse tudo direto pelo seu app de mensagens favorito',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'from-purple-50 to-indigo-50'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description: 'Análises profundas para tomada de decisões inteligentes',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'from-indigo-50 to-purple-50'
  },
  {
    icon: PieChart,
    title: 'Categorização Automática',
    description: 'IA que aprende seus padrões e organiza automaticamente',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'from-pink-50 to-rose-50'
  },
  {
    icon: Calendar,
    title: 'Planejamento Financeiro',
    description: 'Defina metas e acompanhe seu progresso mensalmente',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'from-teal-50 to-cyan-50'
  },
  {
    icon: Shield,
    title: 'Segurança Garantida',
    description: 'Seus dados protegidos com criptografia de ponta',
    color: 'from-slate-500 to-gray-600',
    bgColor: 'from-slate-50 to-gray-50'
  }
];

export default function ServiceFeatures() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-20 -translate-x-20 opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-100 to-blue-100 rounded-full translate-y-16 translate-x-16 opacity-30"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-semibold">Recursos Premium</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            O que o FinAí faz por você
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra como nossa inteligência artificial pode revolucionar sua gestão financeira
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.bgColor} border border-gray-100 transition-all duration-500 hover:shadow-xl hover:scale-105 cursor-pointer group`}
            >
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {hoveredFeature === index && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl animate-pulse"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-orange-800 mb-2">Compromisso com sua Privacidade</h3>
              <p className="text-orange-700 text-sm leading-relaxed">
                <span className="font-semibold">🔒 PROTEÇÃO TOTAL:</span> Utilizamos seus dados exclusivamente para controle financeiro dentro do FinAí. 
                Jamais compartilhamos suas informações pessoais com terceiros. Sua privacidade é nossa prioridade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}