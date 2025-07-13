import React from 'react';
import { MessageCircle, Phone, ExternalLink, HeadphonesIcon } from 'lucide-react';

export default function SupportSection() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-2 mb-4">
          <HeadphonesIcon className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-semibold">📞 Suporte</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Precisa de ajuda?
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Em caso de dúvidas, entre em contato com nossa equipe especializada
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Suporte via WhatsApp
            </h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para te ajudar com qualquer dúvida sobre o cadastro ou uso do sistema.
            </p>
          </div>
          
          <a
            href="https://wa.me/5551994093944"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-[1.02] shadow-lg group"
          >
            <MessageCircle className="w-6 h-6 mr-3 group-hover:animate-pulse" />
            👉 Falar com suporte
            <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
          </a>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Phone className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-blue-800">Horário de Atendimento</span>
          </div>
          <p className="text-blue-700 text-center">
            Segunda a Sexta: 8h às 18h<br />
            Sábado: 8h às 12h
          </p>
        </div>
      </div>
    </div>
  );
}