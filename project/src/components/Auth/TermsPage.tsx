import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Shield, Heart, Users, Globe, ArrowRight, ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const terms = [
    {
      icon: Heart,
      title: "Supportive Nature",
      description: "This application is designed to provide mental health support and wellness resources. It is NOT a substitute for professional medical treatment or suicide prevention services."
    },
    {
      icon: Users,
      title: "Community Guidelines",
      description: "We foster a safe, respectful environment where users can share experiences and support each other in their wellness journey."
    },
    {
      icon: Shield,
      title: "Privacy Protection",
      description: "Your conversations and personal data are encrypted and protected. We never share your information without explicit consent."
    },
    {
      icon: AlertTriangle,
      title: "Crisis Situations",
      description: "If you're experiencing a mental health crisis, please contact emergency services (911) or a crisis hotline immediately. Our AI can detect concerning patterns and will guide you to appropriate resources."
    },
    {
      icon: Globe,
      title: "Data Usage",
      description: "We use your interaction data to improve our AI responses and provide better support. All data is anonymized and used solely for service improvement."
    },
    {
      icon: CheckCircle,
      title: "Age Requirements",
      description: "Users must be 13 years or older to use this service. Users under 18 should have parental guidance when using mental health resources."
    }
  ];

  const handleContinue = () => {
    if (accepted) {
      navigate('/auth');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Terms & Conditions</h1>
          <p className="text-xl text-slate-300">
            Please read and accept our terms to continue
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Important Notice</h3>
              <p className="text-amber-100 leading-relaxed">
                <strong>This app is supportive in nature and is NOT designed for suicide prevention.</strong> If you or someone you know is in immediate danger or having thoughts of self-harm, please contact emergency services (911) or the National Suicide Prevention Lifeline at 988 immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {terms.map((term, index) => {
            const Icon = term.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{term.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{term.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acceptance Checkbox */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <label className="flex items-start space-x-4 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-white font-medium">
                I have read and accept the terms and conditions
              </span>
              <p className="text-slate-400 text-sm mt-1">
                By checking this box, you acknowledge that you understand this service is supportive in nature and agree to use it responsibly.
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Intro</span>
          </button>

          <button
            onClick={handleContinue}
            disabled={!accepted}
            className={`group flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform ${
              accepted
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white hover:scale-105 shadow-lg hover:shadow-cyan-500/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Continue to App</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-700/50">
          <p className="text-slate-500">
            Questions about our terms? Contact us at{' '}
            <a href="mailto:support@mindcare.app" className="text-cyan-400 hover:text-cyan-300">
              support@mindcare.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;