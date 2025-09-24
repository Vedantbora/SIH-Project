import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, AlertTriangle, Heart, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RiskLevel } from '../../types';
import { API_BASE_URL, buildApiUrl, getAuthHeaders } from '../../config/api';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  riskLevel?: RiskLevel;
}

const TalkPage: React.FC = () => {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [riskAlert, setRiskAlert] = useState<RiskLevel | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const languageOptions = [
    { value: 'hindi', label: 'हिंदी', flag: '🇮🇳' },
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'hinglish', label: 'Hinglish', flag: '🔄' },
    { value: 'auto', label: 'Auto Detect', flag: '🌍' }
  ];

  // Get Indian voice for speech synthesis
  const getIndianVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Look for Indian voices first
    const indianVoices = voices.filter(voice => 
      voice.lang.includes('hi') || 
      voice.lang.includes('IN') || 
      voice.name.toLowerCase().includes('india') ||
      voice.name.toLowerCase().includes('hindi')
    );
    
    if (indianVoices.length > 0) {
      return indianVoices[0];
    }
    
    // Fallback to any Hindi voice
    const hindiVoices = voices.filter(voice => voice.lang.startsWith('hi'));
    if (hindiVoices.length > 0) {
      return hindiVoices[0];
    }
    
    // Fallback to default voice
    return voices.find(voice => voice.default) || voices[0];
  };

  // Speak text with Indian voice
  const speakText = (text: string) => {
    if (!voiceEnabled || !text) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getIndianVoice();
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = Math.min(speechVolume * 1.2, 1.0); // Boost volume by 20% but cap at 1.0
    
    // Set language based on selected language
    if (selectedLanguage === 'hindi') {
      utterance.lang = 'hi-IN';
    } else if (selectedLanguage === 'english') {
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'hi-IN'; // Default to Hindi for Indian accent
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(scrollToBottom, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const getWelcomeMessage = async () => {
      try {
        const response = await fetch(buildApiUrl(`/chat/starter?language=${selectedLanguage}`), {
          method: 'GET',
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to get welcome message');
        const data = await response.json();
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: data.data.message || data.data.starter || data.message || 'Hello!',
          isUser: false,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        // Fallback welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `Hi ${user?.avatar_name || user?.name}! I'm here to listen and support you. How are you feeling today? You can speak to me by clicking the microphone button below.`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    };

    if (user) {
      getWelcomeMessage();
    }
  }, [user]);

  const simulateSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
      setCurrentTranscript('');
      if (window.speechRecognition) {
        window.speechRecognition.stop();
      }
      return;
    }

    setIsListening(true);
    setCurrentTranscript('Listening...');

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setCurrentTranscript('Speech recognition not supported in this browser');
      setIsListening(false);
      return;
    }

    // Implement real speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language based on selection
    switch(selectedLanguage) {
      case 'hindi':
        recognition.lang = 'hi-IN';
        break;
      case 'english':
        recognition.lang = 'en-IN';
        break;
      case 'hinglish':
        recognition.lang = 'en-IN'; // Use English India for Hinglish
        break;
      default:
        recognition.lang = 'en-IN'; // Default to English India
    }

    recognition.onstart = () => {
      setCurrentTranscript('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentTranscript(transcript);
      handleSendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setCurrentTranscript('Error: Could not recognize speech');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendMessage = async (text: string) => {
    setIsListening(false);
    setCurrentTranscript('');

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Real AI processing with MANAS AI
    try {
      const response = await fetch(buildApiUrl('/chat/message'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: text,
          preferredLanguage: selectedLanguage !== 'auto' ? selectedLanguage : undefined
        })
      });
      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.data.response,
        isUser: false,
        timestamp: new Date(),
        riskLevel: data.data.riskLevel
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Handle risk alerts
      if (data.data.riskLevel === 'high' || data.data.riskLevel === 'critical') {
        setRiskAlert(data.data.riskLevel);
      }
      
      // Implement text-to-speech with Indian voice
      speakText(data.data.response);
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please try again, and know that I'm here to support you.",
        isUser: false,
        timestamp: new Date(),
        riskLevel: 'low'
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  // AI response generation will be handled by the API


  const toggleMute = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      // If there's a last AI message, speak it
      const lastAIMessage = messages.filter(m => !m.isUser).pop();
      if (lastAIMessage) {
        speakText(lastAIMessage.text);
      }
    }
  };

  const dismissRiskAlert = () => {
    setRiskAlert(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Risk Alert Modal */}
      {riskAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold text-lg">
                  {riskAlert === 'critical' ? 'Crisis Alert' : 'Mental Health Support'}
                </h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-300">
                {riskAlert === 'critical' 
                  ? 'We detected concerning content in your message. Your safety is our priority.'
                  : 'We noticed you might be going through a difficult time. Additional support is available.'
                }
              </p>
              
              <div className="space-y-2">
                <p className="text-white font-medium">Crisis Resources:</p>
                <div className="text-cyan-300 space-y-1">
                  <p>🆘 Emergency: 911</p>
                  <p>📞 Crisis Hotline: 988</p>
                  <p>💬 Crisis Text: Text HOME to 741741</p>
                </div>
              </div>
              
              <button
                onClick={dismissRiskAlert}
                className="w-full bg-red-500 hover:bg-red-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="AI Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Heart className="w-6 h-6 text-white" />
              )}
            </div>
            {isSpeaking && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MANAS</h1>
            <p className="text-slate-300">
              {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to chat'}
            </p>
          </div>
          <div className="flex-1" />
          
          {/* Language Selector */}
          <div className="relative mr-4">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-2 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm">
                {languageOptions.find(opt => opt.value === selectedLanguage)?.flag} 
                {languageOptions.find(opt => opt.value === selectedLanguage)?.label}
              </span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[150px]">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedLanguage(option.value);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center space-x-3 ${
                      selectedLanguage === option.value ? 'bg-slate-700 text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    <span>{option.flag}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Voice Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled 
                  ? 'text-cyan-400 bg-cyan-400/10' 
                  : 'text-slate-400 hover:text-white'
              }`}
              title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title={isSpeaking ? 'Stop speaking' : 'Repeat last message'}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setSpeechVolume(Math.min(speechVolume + 0.2, 1.0))}
              className="p-2 text-green-400 hover:text-green-300 transition-colors"
              title="Increase volume"
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-2xl ${message.isUser ? 'order-2' : ''}`}>
              {!message.isUser && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"></div>
                  <span className="text-slate-400 text-sm">MANAS</span>
                </div>
              )}
              
              <div
                className={`p-4 rounded-2xl ${
                  message.isUser
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
                
                {message.riskLevel && message.riskLevel !== 'low' && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full ${
                    message.riskLevel === 'critical' ? 'bg-red-500/20 text-red-300' :
                    message.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    Mood detected: {message.riskLevel}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-slate-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Settings */}
      {voiceEnabled && (
        <div className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50 p-4">
          <div className="text-center mb-3">
            <h3 className="text-cyan-400 font-medium text-sm">🔊 Voice Settings</h3>
          </div>
          <div className="flex items-center justify-between max-w-2xl mx-auto space-x-6">
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 text-sm">Rate:</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-16"
              />
              <span className="text-slate-400 text-xs w-6">{speechRate.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 text-sm">Pitch:</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-16"
              />
              <span className="text-slate-400 text-xs w-6">{speechPitch.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-slate-300 text-sm font-medium">🔊 Volume:</label>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.1"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                className="w-20 accent-cyan-400"
              />
              <span className="text-cyan-400 text-sm font-medium w-8">{Math.round(speechVolume * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50 p-6">
        {currentTranscript && (
          <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-slate-300">{currentTranscript}</p>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <button
            onClick={simulateSpeechRecognition}
            className={`flex-shrink-0 w-14 h-14 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 border-red-400 hover:bg-red-400 animate-pulse'
                : 'bg-gradient-to-br from-cyan-500 to-blue-500 border-cyan-400 hover:from-cyan-400 hover:to-blue-400 hover:scale-110'
            }`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>
          
          <p className="text-slate-300 flex-1">
            {isListening
              ? 'Listening... Click the microphone to stop'
              : 'Click the microphone to start speaking'
            }
          </p>

          {currentTranscript && currentTranscript !== 'Listening...' && (
            <button
              onClick={() => handleSendMessage(currentTranscript)}
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-slate-500 text-sm">
            Powered by Gemini AI • Hindi & English Support • Indian Voice • Your friendly MANAS
          </p>
        </div>
      </div>
    </div>
  );
};

export default TalkPage;