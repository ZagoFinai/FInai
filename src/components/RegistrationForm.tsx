import React, { useState } from 'react';
import { Send, CheckCircle, Phone, Mail, User, MessageCircle, FileText } from 'lucide-react';
import { addClient } from '../data/clientStorage';
import PaymentSectionDirect from './PaymentSectionDirect';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [clientData, setClientData] = useState<any>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Adicionar cliente ao sistema
    try {
      const newClient = await addClient({
        name: formData.fullName,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email
      });
      
      if (newClient) {
        setClientData(newClient);
        setIsSubmitting(false);
        setShowPayment(true);
      } else {
        throw new Error('Falha ao cadastrar cliente');
      }
      
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      setIsSubmitting(false);
      setErrors({ fullName: 'Erro ao cadastrar. Tente novamente.' });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    
    // Redirecionar para WhatsApp após 3 segundos
    setTimeout(() => {
      const message = 'Cadastro concluído';
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5551994093944?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50"></div>
        <div className="absolute top-4 left-4 w-3 h-3 bg-green-300 rounded-full animate-ping"></div>
        <div className="absolute top-8 right-8 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 left-8 w-4 h-4 bg-green-200 rounded-full animate-bounce"></div>
        
        <div className="relative z-10">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 sm:mb-6 animate-pulse" />
          
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Tudo Pronto!</h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Seu cadastro foi realizado e o pagamento confirmado! 
            Em instantes você será redirecionado para o WhatsApp para começar a usar o FinAí.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-xl sm:text-2xl">🎉</div>
              <span className="text-blue-800 font-bold text-base sm:text-lg">Plano Ativado com Sucesso!</span>
            </div>
            <p className="text-blue-700 text-sm">
              Seu status já foi atualizado automaticamente no sistema
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 animate-bounce" />
              <span className="text-green-800 font-bold text-base sm:text-lg">Redirecionando para WhatsApp...</span>
            </div>
            <p className="text-green-700 text-sm mb-4">
              Você será redirecionado automaticamente em alguns segundos para ativar sua conta
            </p>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-green-800 font-mono text-xs sm:text-sm">
                📱 Mensagem: <strong>"Cadastro concluído"</strong>
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <a
              href={`https://wa.me/5551994093944?text=${encodeURIComponent('Cadastro concluído')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg text-sm sm:text-base"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ou clique aqui para ir ao WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (showPayment && clientData) {
    return (
      <PaymentSectionDirect 
        clientData={clientData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
      
      <div className="relative z-10 p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 sm:px-6 sm:py-2 mb-4">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-semibold text-sm sm:text-base">📝 Formulário de Cadastro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Cadastre-se no FinAí
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-4">
            Preencha seus dados para escolher seu plano
          </p>
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl px-4 py-3 sm:px-6 sm:py-3">
            <div className="text-xl sm:text-2xl mr-3">🎁</div>
            <div>
              <p className="font-bold text-green-800 text-sm sm:text-base">3 dias de teste grátis</p>
              <p className="text-green-700 text-xs sm:text-sm">Experimente antes de pagar</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-md mx-auto">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2 text-blue-600" />
                Nome completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-3 py-3 sm:px-4 sm:py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-base ${
                    errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 
                    focusedField === 'fullName' ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="Digite seu nome completo"
                  autoComplete="name"
                  required
                />
                {focusedField === 'fullName' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2 animate-fade-in">{errors.fullName}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2 text-green-600" />
                Telefone com DDD (WhatsApp) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-3 py-3 sm:px-4 sm:py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-gray-50 focus:bg-white text-base ${
                    errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 
                    focusedField === 'phone' ? 'border-green-500 shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="(51) 99999-9999"
                  autoComplete="tel"
                  required
                />
                {focusedField === 'phone' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <MessageCircle className="w-5 h-5 text-green-500 animate-bounce" />
                  </div>
                )}
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2 animate-fade-in">{errors.phone}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2 text-purple-600" />
                E-mail *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-3 py-3 sm:px-4 sm:py-4 border-2 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-gray-50 focus:bg-white text-base ${
                    errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 
                    focusedField === 'email' ? 'border-purple-500 shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="seu.email@example.com"
                  autoComplete="email"
                  required
                />
                {focusedField === 'email' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 animate-fade-in">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-xl sm:text-2xl">⚡</div>
              <div>
                <p className="font-bold text-yellow-800 text-sm">Próximo Passo: Escolher Plano</p>
                <p className="text-yellow-700 text-xs">
                  Após o cadastro, você escolherá seu plano e forma de pagamento
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 px-6 sm:py-4 sm:px-8 rounded-2xl font-bold text-base sm:text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-3"></div>
                <span>Processando cadastro...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="w-5 h-5 sm:w-6 sm:h-6 mr-3 group-hover:translate-x-1 transition-transform" />
                <span>Continuar para Escolha do Plano</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}