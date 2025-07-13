import React from 'react';
import { Bot, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinAí
            </span>
          </div>
          
          <p className="text-xl text-gray-300 mb-8">
            ✨ Obrigado por confiar no FinAí
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <Shield className="w-8 h-8 text-blue-400 mx-auto" />
              <h4 className="font-semibold text-lg">Segurança Total</h4>
              <p className="text-gray-300 text-sm">
                Seus dados protegidos com criptografia de última geração
              </p>
            </div>
            
            <div className="space-y-3">
              <Heart className="w-8 h-8 text-red-400 mx-auto" />
              <h4 className="font-semibold text-lg">Suporte Humano</h4>
              <p className="text-gray-300 text-sm">
                Atendimento personalizado quando você precisar
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm">
              © 2024 FinAí. Todos os direitos reservados. Desenvolvido com tecnologia brasileira.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}