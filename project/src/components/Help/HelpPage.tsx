import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle,
  Phone,
  MessageCircle,
  Heart,
  Shield,
  AlertTriangle,
  Info,
  BookOpen,
  Users,
  Clock,
  Globe,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crisis' | 'faq' | 'resources' | 'contact'>('crisis');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const crisisResources = [
    {
      country: 'United States',
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support and suicide prevention',
      available: '24/7',
      type: 'crisis'
    },
    {
      country: 'United States',
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free, 24/7 crisis support via text',
      available: '24/7',
      type: 'text'
    },
    {
      country: 'United States',
      name: 'SAMHSA National Helpline',
      number: '1-800-662-4357',
      description: 'Mental health and substance abuse treatment referral',
      available: '24/7',
      type: 'helpline'
    },
    {
      country: 'United Kingdom',
      name: 'Samaritans',
      number: '116 123',
      description: 'Free emotional support for anyone in distress',
      available: '24/7',
      type: 'crisis'
    },
    {
      country: 'Canada',
      name: 'Crisis Services Canada',
      number: '1-833-456-4566',
      description: 'National suicide prevention service',
      available: '24/7',
      type: 'crisis'
    },
    {
      country: 'Australia',
      name: 'Lifeline Australia',
      number: '13 11 14',
      description: '24/7 crisis support and suicide prevention',
      available: '24/7',
      type: 'crisis'
    },
    {
      country: 'India',
      name: 'KIRAN Mental Health Helpline',
      number: '1800-599-0019',
      description: '24/7 mental health support',
      available: '24/7',
      type: 'helpline'
    }
  ];

  const faqData = [
    {
      question: 'How do I get started with MindQuest?',
      answer: 'Getting started is easy! Simply create an account, complete your profile, and begin with the daily mood check-in. You can then explore games, chat with our AI companion, and track your mental wellness journey.'
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Yes, we take your privacy seriously. All your data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent. You can control your privacy settings in the Settings page.'
    },
    {
      question: 'How do the games help with mental health?',
      answer: 'Our games are designed to improve cognitive function, reduce stress, and provide a positive distraction. They help with focus, memory, reaction time, and mindfulness - all important aspects of mental wellness.'
    },
    {
      question: 'Can I use MindQuest if I\'m in crisis?',
      answer: 'MindQuest is designed for mental wellness support, but if you\'re experiencing a mental health crisis, please contact emergency services or a crisis hotline immediately. We provide crisis resources on this page for immediate help.'
    },
    {
      question: 'How often should I use MindQuest?',
      answer: 'We recommend daily check-ins for the best results, but you can use MindQuest as often as you need. Even a few minutes a day can make a difference in your mental wellness journey.'
    },
    {
      question: 'What if I don\'t like the AI responses?',
      answer: 'Our AI is designed to be supportive and helpful, but if you\'re not satisfied with responses, you can always reach out to human support through our contact options. The AI learns and improves over time.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data including mood reports, game history, and conversations. Go to Settings > Account > Export Data to download your information.'
    },
    {
      question: 'Is MindQuest free to use?',
      answer: 'MindQuest offers both free and premium features. Basic mood tracking, games, and AI chat are free. Premium features include advanced analytics, personalized insights, and additional games.'
    }
  ];

  const mentalHealthResources = [
    {
      title: 'Understanding Mental Health',
      description: 'Learn about mental health conditions, symptoms, and treatment options',
      type: 'education',
      links: [
        { name: 'Mental Health America', url: 'https://www.mhanational.org' },
        { name: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov' },
        { name: 'World Health Organization - Mental Health', url: 'https://www.who.int/mental_health' }
      ]
    },
    {
      title: 'Self-Care and Wellness',
      description: 'Resources for building healthy habits and self-care routines',
      type: 'wellness',
      links: [
        { name: 'Headspace', url: 'https://www.headspace.com' },
        { name: 'Calm', url: 'https://www.calm.com' },
        { name: 'Mindful.org', url: 'https://www.mindful.org' }
      ]
    },
    {
      title: 'Professional Help',
      description: 'Find mental health professionals and treatment options',
      type: 'professional',
      links: [
        { name: 'Psychology Today Therapist Finder', url: 'https://www.psychologytoday.com' },
        { name: 'BetterHelp Online Therapy', url: 'https://www.betterhelp.com' },
        { name: 'Talkspace', url: 'https://www.talkspace.com' }
      ]
    },
    {
      title: 'Support Groups',
      description: 'Connect with others who understand your experiences',
      type: 'community',
      links: [
        { name: '7 Cups', url: 'https://www.7cups.com' },
        { name: 'Support Groups Central', url: 'https://www.supportgroupscentral.com' },
        { name: 'Mental Health America Support Groups', url: 'https://www.mhanational.org/find-support-groups' }
      ]
    }
  ];

  const filteredFaq = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'crisis': return AlertTriangle;
      case 'text': return MessageCircle;
      case 'helpline': return Phone;
      default: return Heart;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'crisis': return 'from-red-500 to-pink-500';
      case 'text': return 'from-blue-500 to-cyan-500';
      case 'helpline': return 'from-green-500 to-emerald-500';
      default: return 'from-purple-500 to-indigo-500';
    }
  };

  const tabs = [
    { id: 'crisis', label: 'Crisis Support', icon: AlertTriangle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'contact', label: 'Contact Us', icon: Mail }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="text-cyan-400" size={40} />
          Help & Crisis Support
        </h1>
        <p className="text-slate-400 text-lg">We're here to help you on your mental wellness journey</p>
      </motion.div>

      {/* Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">In Crisis?</h3>
            <p className="text-slate-300">If you're having thoughts of self-harm, please reach out for help immediately.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="tel:988"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Phone size={16} />
            Call 988 (US)
          </a>
          <a
            href="sms:741741&body=HOME"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Text HOME to 741741
          </a>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-800/50 rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Crisis Support Tab */}
        {activeTab === 'crisis' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-red-400" />
              Crisis Support Resources
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crisisResources.map((resource, index) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getResourceColor(resource.type)} flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wide">{resource.country}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{resource.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{resource.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="text-cyan-400" size={16} />
                        <span className="text-white font-semibold">{resource.number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-green-400" size={16} />
                        <span className="text-slate-400 text-sm">{resource.available}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-cyan-400" />
                Frequently Asked Questions
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFaq.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="text-cyan-400" size={20} />
                    ) : (
                      <ChevronDown className="text-slate-400" size={20} />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="text-cyan-400" />
              Mental Health Resources
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mentalHealthResources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-3">{resource.title}</h3>
                  <p className="text-slate-400 mb-4">{resource.description}</p>
                  
                  <div className="space-y-3">
                    {resource.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
                      >
                        <ExternalLink className="text-cyan-400 group-hover:text-cyan-300" size={16} />
                        <span className="text-white group-hover:text-cyan-300">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="text-cyan-400" />
              Contact Us
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Mail className="text-cyan-400" />
                  General Support
                </h3>
                <p className="text-slate-400 mb-4">
                  Have questions about using MindQuest? Need technical support? We're here to help.
                </p>
                <div className="space-y-2">
                  <p className="text-white">Email: support@mindquest.app</p>
                  <p className="text-white">Response time: 24-48 hours</p>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-cyan-400" />
                  Feedback & Suggestions
                </h3>
                <p className="text-slate-400 mb-4">
                  Help us improve MindQuest by sharing your feedback and suggestions.
                </p>
                <div className="space-y-2">
                  <p className="text-white">Email: feedback@mindquest.app</p>
                  <p className="text-white">We read every message!</p>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="text-cyan-400" />
                  Privacy & Security
                </h3>
                <p className="text-slate-400 mb-4">
                  Questions about your privacy or data security? Contact our privacy team.
                </p>
                <div className="space-y-2">
                  <p className="text-white">Email: privacy@mindquest.app</p>
                  <p className="text-white">Response time: 48-72 hours</p>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="text-cyan-400" />
                  Business Inquiries
                </h3>
                <p className="text-slate-400 mb-4">
                  Interested in partnerships or business opportunities? Let's talk.
                </p>
                <div className="space-y-2">
                  <p className="text-white">Email: business@mindquest.app</p>
                  <p className="text-white">Response time: 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HelpPage;
