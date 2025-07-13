import React, { useState } from 'react';
import { Lock, Shield, Eye, Users, Settings, ExternalLink } from 'lucide-react';

export default function AdminSection() {
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleAdminAccess = () => {
    // Open admin access in a new tab/window
    window.open('/admin', '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl shadow-2xl p-8 border border-gray-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-gradient-to-r from-gray-100 to-slate-100 rounded-full px-6 py-2 mb-4">
          <Lock className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-gray-800 font-semibold">🔒 Área Exclusiva – Responsáveis FinAí</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Acesso Administrativo
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Esta página é protegida para garantir a privacidade dos nossos clientes.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <Shield className="w-8 h-8 text-blue-600 mt-1" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Funcionalidades Administrativas</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Os responsáveis pelo sistema podem acessar os cadastros, visualizar os status 
                (teste, ativo ou expirado) e gerenciar os dados.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-green-600" />
                  <span>Gerenciar clientes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Visualizar status</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span>Controlar dados</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleAdminAccess}
            className="inline-flex items-center bg-gradient-to-r from-gray-600 to-slate-600 text-white px-8 py-4 rounded-xl font-bold hover:from-gray-700 hover:to-slate-700 transition-all duration-300 hover:scale-[1.02] shadow-lg group"
          >
            <Lock className="w-5 h-5 mr-3" />
            Acessar Área Administrativa
            <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
          </button>

          <div className="mt-4 text-sm text-gray-500">
            Abre em uma nova aba para maior segurança
          </div>
        </div>
      </div>
    </div>
  );
}