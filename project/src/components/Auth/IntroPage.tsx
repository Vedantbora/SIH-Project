import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Heart, Star, ArrowRight } from 'lucide-react';

const IntroPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Welcome to MindQuest",
      subtitle: "Your Personal MindQuest Companion",
      description: "A supportive space designed to help you thrive, grow, and maintain positive mental wellness.",
      icon: Brain,
      gradient: "from-purple-600 to-blue-600"
    },
    {
      title: "Talk & Express",
      subtitle: "AI-Powered Conversations",
      description: "Share your thoughts with our understanding AI companion who listens without judgment.",
      icon: Heart,
      gradient: "from-pink-600 to-purple-600"
    },
    {
      title: "Games & Growth",
      subtitle: "Interactive Wellness Activities",
      description: "Engage in fun activities designed to boost your mood and cognitive abilities.",
      icon: Star,
      gradient: "from-yellow-600 to-pink-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToTerms = () => {
    navigate('/terms');
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo/Brand */}
        <div className="mb-12 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} mb-4 animate-bounce`}>
            {React.createElement(slides[currentSlide].icon, { size: 40, className: "text-white" })}
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 animate-fade-in">
            {slides[currentSlide].title}
          </h1>
          <p className={`text-2xl bg-gradient-to-r ${slides[currentSlide].gradient} bg-clip-text text-transparent font-semibold animate-fade-in`}>
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-2xl text-center mb-12 animate-fade-in">
          <p className="text-xl text-slate-300 leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="flex space-x-2 mb-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-cyan-400 scale-125' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={goToTerms}
          className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 flex items-center space-x-2"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Footer */}
        <p className="text-slate-500 text-sm mt-8 animate-fade-in">
          A safe space for mental wellness and personal growth
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default IntroPage;