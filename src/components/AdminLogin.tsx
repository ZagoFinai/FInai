import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, Bot } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (credentials.username === 'administrativofinai' && credentials.password === 'adminfinai0209') {
      onLogin();
    } else {
      setError('Acesso negado. Verifique seu login e senha.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-slate-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-slate-600 to-blue-600 rounded-2xl text-white mb-4 sm:mb-6 shadow-lg">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Acesso Administrativo
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Sistema FinAí
              </p>
              <div className="inline-flex items-center bg-slate-100 rounded-full px-3 py-2 sm:px-4 sm:py-2 mt-3">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 mr-2" />
                <span className="text-slate-700 text-xs sm:text-sm font-medium">Área Restrita</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2 text-slate-600" />
                  Login
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 transition-all duration-300 bg-gray-50 focus:bg-white text-base"
                  placeholder="Digite seu login"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2 text-slate-600" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-100 transition-all duration-300 bg-gray-50 focus:bg-white pr-12 text-base"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 animate-fade-in">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white py-3 px-4 sm:py-4 sm:px-6 rounded-xl font-bold hover:from-slate-700 hover:to-blue-700 focus:ring-4 focus:ring-slate-200 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Verificando acesso...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-3" />
                    Entrar no Sistema
                  </div>
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 sm:px-4 sm:py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-blue-700 text-xs sm:text-sm">Sistema seguro e criptografado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-slate-300 text-xs sm:text-sm">
            FinAí © 2025 – Sistema administrativo interno
          </p>
        </div>
      </div>
    </div>
  );
}