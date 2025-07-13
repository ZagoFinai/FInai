import React, { useState, useEffect } from 'react';
import { Star, Quote, User } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Empresária',
    content: 'O FinAí revolucionou minha forma de controlar as finanças. Agora consigo ver exatamente onde meu dinheiro está indo e economizar mais!',
    rating: 5,
    avatar: '👩‍💼'
  },
  {
    name: 'João Santos',
    role: 'Freelancer',
    content: 'Como freelancer, sempre tive dificuldade para organizar meus ganhos. O FinAí me deu o controle que precisava direto no WhatsApp.',
    rating: 5,
    avatar: '👨‍💻'
  },
  {
    name: 'Ana Costa',
    role: 'Estudante',
    content: 'Simples, rápido e eficiente! Consegui organizar meu orçamento de estudante e ainda sobra dinheiro no final do mês.',
    rating: 5,
    avatar: '👩‍🎓'
  },
  {
    name: 'Carlos Oliveira',
    role: 'Aposentado',
    content: 'Nunca imaginei que seria tão fácil controlar minhas finanças. O FinAí é intuitivo e me ajuda a planejar melhor minha aposentadoria.',
    rating: 5,
    avatar: '👴'
  }
];

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full -translate-y-16 -translate-x-16 opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-pink-200 to-purple-200 rounded-full translate-y-20 translate-x-20 opacity-30"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-2 mb-4">
            <Star className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-semibold">Depoimentos</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Milhares de pessoas já transformaram suas finanças com o FinAí
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl p-8 mb-8">
            <Quote className="w-12 h-12 text-indigo-200 mb-6" />
            
            <div className="transition-all duration-500 ease-in-out">
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{testimonials[currentTestimonial].content}"
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600 text-sm">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
                
                <div className="flex">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-indigo-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-2">10k+</div>
              <p className="text-gray-600">Usuários Ativos</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <p className="text-gray-600">Satisfação</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">R$ 2M+</div>
              <p className="text-gray-600">Economizados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}