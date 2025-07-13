import React from 'react';
import { Lightbulb, CheckCircle, Bot, Zap, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'Cadastro fácil',
    description: 'Processo simples e rápido para começar',
    color: 'text-green-600'
  },
  {
    icon: Bot,
    title: 'Atendimento automático',
    description: 'IA inteligente para suas necessidades',
    color: 'text-blue-600'
  },
  {
    icon: Zap,
    title: 'Controle do plano',
    description: 'Mensagens inteligentes e gestão completa',
    color: 'text-purple-600'
  }
];

export default function AboutSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-6 py-2 mb-4">
          <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-semibold">💡 Sobre o FinAí</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Seu assistente financeiro inteligente
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          FinAí é um assistente financeiro inteligente que funciona direto no seu WhatsApp. Cadastre-se e comece a usar imediatamente!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
              Cadastro instantâneo
            </h3>
            
            <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors leading-relaxed">
              Cadastre-se e vá direto para o WhatsApp
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <MessageCircle className="w-8 h-8 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">Integração WhatsApp</h3>
        </div>
        <p className="text-gray-600 text-center leading-relaxed">
          Após o cadastro, você será direcionado automaticamente para o WhatsApp 
          onde poderá começar a usar o FinAí imediatamente.
        </p>
      </div>
    </div>
  );
}