import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 -left-8 w-16 h-16 bg-white/5 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-4 right-1/4 w-20 h-20 bg-white/5 rounded-full animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <Bot className="w-16 h-16 text-blue-200 animate-pulse" />
              <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              FinAí
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-100">
              👋 Cadastro de Cliente
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Seja bem-vindo(a) ao FinAí, seu assistente financeiro pessoal direto no WhatsApp
            </p>
          </div>
          
          <div className="mt-8 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 text-lg font-medium">
            <Sparkles className="w-5 h-5 mr-3 text-yellow-300" />
            Preencha o formulário abaixo para ativar sua conta
          </div>
        </div>
      </div>
    </header>
  );
}