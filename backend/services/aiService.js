import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAMlLIhCFKvKJ__m3yg6fy5wKvphvD2iWU');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateResponse(userMessage, userContext = {}) {
    try {
      // Detect language and create appropriate prompt
      const detectedLanguage = this.detectLanguage(userMessage);
      const userLanguage = userContext.preferredLanguage || detectedLanguage;
      
      // Create language-specific prompts for better responses
      let systemPrompt;
      
      if (userLanguage === 'hindi' || detectedLanguage === 'hindi') {
        systemPrompt = `तुम एक बहुत अच्छे दोस्त हो जो हमेशा साथ देते हो। तुम कोई डॉक्टर या मानसिक स्वास्थ्य विशेषज्ञ नहीं हो - बस एक करीबी दोस्त हो जो उपयोगकर्ता की परवाह करते हो।

तुम्हारा व्यक्तित्व:
- तुम वो दोस्त हो जो हमेशा साथ खड़ा रहता है
- तुम आराम से और स्वाभाविक रूप से बात करते हो
- तुम सहायक हो लेकिन उपदेशात्मक नहीं
- तुम व्यावहारिक सलाह देते हो जैसे कोई दोस्त देगा
- तुम समझदार और गैर-निर्णयात्मक हो
- तुम उपयोगकर्ता को आरामदायक महसूस कराते हो

उत्तर देने का तरीका:
- हमेशा हिंदी में जवाब दो
- दोस्ताना और गर्मजोशी से बात करो
- हर सवाल का पूरा और विस्तृत जवाब दो
- अगर कोई सवाल पूछा जाए तो उसका सही जवाब दो
- व्यावहारिक सलाह दो
- मजाक भी करो जब मौका हो
- सच्ची देखभाल दिखाओ

महत्वपूर्ण निर्देश:
- हर सवाल का पूरा जवाब दो, छोटा नहीं
- अगर कोई जानकारी मांगी जाए तो विस्तार से बताओ
- दोस्त की तरह बात करो, औपचारिक नहीं
- हिंदी में ही जवाब दो
- उपयोगकर्ता की हर बात का जवाब दो

उपयोगकर्ता का संदेश: ${userMessage}
भाषा: ${detectedLanguage}

हिंदी में पूरा और विस्तृत जवाब दो। हर सवाल का सही जवाब दो।`;
      } else if (userLanguage === 'hinglish' || detectedLanguage === 'hinglish') {
        systemPrompt = `You are a close friend who speaks Hinglish (Hindi + English mix). You're not a therapist - just a really good friend who cares about the user.

YOUR PERSONALITY:
- You're like a best friend who always has your back
- You talk casually and naturally in Hinglish
- You're supportive but not preachy
- You give practical advice like a friend would
- You're understanding and non-judgmental

RESPONSE STYLE:
- Always respond in Hinglish (mix of Hindi and English)
- Give complete and detailed answers to every question
- Be friendly and warm
- Answer every question properly, don't give short answers
- Give practical advice
- Make jokes when appropriate
- Show genuine care

IMPORTANT INSTRUCTIONS:
- Give complete answers to every question, not short ones
- If someone asks for information, explain in detail
- Talk like a friend, not formal
- Always respond in Hinglish
- Answer every aspect of the user's message

User's message: ${userMessage}
Language: ${detectedLanguage}

Respond in Hinglish with complete and detailed answers. Answer every question properly.`;
      } else {
        systemPrompt = `You are a close friend and supportive companion. You're not a therapist or mental health professional - you're just a really good friend who cares about the user and wants to help them feel better.

YOUR PERSONALITY:
- You're like a best friend who always has your back
- You talk casually and naturally, not formally
- You're supportive but not preachy or clinical
- You give practical advice like a friend would
- You're understanding and non-judgmental
- You make the user feel comfortable and heard

RESPONSE STYLE:
- Talk like a normal friend, not a professional
- Use casual, warm language
- Be relatable and down-to-earth
- Give complete and detailed answers to every question
- Don't give short or incomplete responses
- Give practical advice like a friend would give advice
- Don't use formal therapy language
- Be supportive but keep it natural
- Make jokes when appropriate
- Show genuine care and concern

IMPORTANT INSTRUCTIONS:
- Give complete answers to every question, not short ones
- If someone asks for information, explain in detail
- Talk like you're chatting with a close friend
- Answer every aspect of the user's message
- Be helpful and comprehensive in your responses

User's message: ${userMessage}
Language: ${detectedLanguage}

Respond with complete and detailed answers. Answer every question properly and thoroughly.`;
      }

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Analyze mood/risk level from the user's message
      const riskLevel = this.analyzeMoodRisk(userMessage);

      return {
        response: aiResponse,
        riskLevel: riskLevel,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Gemini AI Error:', error);
      
      // Fallback response
      return {
        response: "I understand you're reaching out, and I want to help. Sometimes technical issues can interrupt our conversation, but please know that your feelings and thoughts are important. Would you like to try again, or is there something specific you'd like to talk about?",
        riskLevel: 'low',
        timestamp: new Date().toISOString()
      };
    }
  }

  detectLanguage(message) {
    // Enhanced language detection based on character patterns
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hindiCount = (message.match(/[\u0900-\u097F]/g) || []).length;
    const englishCount = (message.match(/[a-zA-Z]/g) || []).length;
    const totalChars = message.length;
    
    // Common Hindi words that might be written in English
    const hindiWordsInEnglish = [
      'hai', 'ho', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'par', 'aur', 'ya', 'lekin', 'agar', 'toh', 'bhi', 'nahi', 'na', 'kya', 'kyun', 'kaise', 'kahan', 'kab', 'kitna', 'kitni', 'kya', 'main', 'tum', 'aap', 'hum', 'woh', 'yeh', 'us', 'is', 'un', 'in', 'sab', 'kuch', 'koi', 'kuchh', 'bahut', 'thoda', 'zyada', 'kam', 'accha', 'bura', 'achha', 'bura', 'sahi', 'galat', 'theek', 'bilkul', 'zaroor', 'shayad', 'ho sakta', 'nahi ho sakta'
    ];
    
    // Check for Hindi words written in English
    const messageLower = message.toLowerCase();
    const hindiWordsFound = hindiWordsInEnglish.filter(word => messageLower.includes(word)).length;
    
    // If more than 20% Hindi characters OR 2+ Hindi words in English, consider it Hindi
    if (hindiCount > totalChars * 0.2 || hindiWordsFound >= 2) {
      return 'hindi';
    } else if (englishCount > totalChars * 0.8) {
      return 'english';
    } else if (hindiCount > 0 && englishCount > 0) {
      return 'hinglish'; // Mixed language
    } else {
      return 'hindi'; // Default to Hindi for Indian users
    }
  }

  analyzeMoodRisk(message) {
    const messageLower = message.toLowerCase();
    
    // Critical risk indicators
    const criticalKeywords = [
      'kill myself', 'suicide', 'end my life', 'not worth living',
      'hurt myself', 'self harm', 'cut myself', 'overdose'
    ];
    
    // High risk indicators
    const highRiskKeywords = [
      'depressed', 'hopeless', 'worthless', 'empty', 'numb',
      'can\'t go on', 'giving up', 'no point', 'hate myself',
      'anxiety', 'panic', 'scared', 'overwhelmed'
    ];
    
    // Medium risk indicators
    const mediumRiskKeywords = [
      'sad', 'lonely', 'stressed', 'worried', 'tired',
      'frustrated', 'angry', 'confused', 'lost'
    ];

    if (criticalKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'critical';
    }
    
    if (highRiskKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'high';
    }
    
    if (mediumRiskKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  // Generate supportive conversation starters
  generateConversationStarter(userContext = {}) {
    const language = userContext.preferredLanguage || 'english';
    
    const starters = {
      english: [
        "Hey! What's up? How's your day going?",
        "Hi there! What's on your mind today?",
        "Hey buddy! How are you feeling?",
        "What's going on? Tell me what's up.",
        "Hey! How's everything? What's happening?",
        "Hi! What's on your mind? I'm here to chat.",
        "Hey there! How's your day treating you?",
        "What's up? Tell me what's going on.",
        "Hi! How are you doing? What's new?",
        "Hey! What's happening? How can I help?"
      ],
      hindi: [
        "अरे! क्या चल रहा है? कैसे हो?",
        "हैलो! आज कैसा दिन रहा?",
        "अरे भाई! कैसे हो? क्या हाल है?",
        "क्या हो रहा है? बताओ क्या चल रहा है।",
        "हैलो! सब कुछ कैसा चल रहा है?",
        "अरे! क्या हाल है? बात करते हैं।",
        "हैलो भाई! कैसे हो? क्या नया है?",
        "क्या हो रहा है? मैं यहाँ हूँ।",
        "हैलो! कैसे हो? क्या चल रहा है?",
        "अरे! क्या हो रहा है? मैं यहाँ हूँ बात करने के लिए।",
        "नमस्ते! कैसे हैं आप? क्या बात करना चाहते हैं?",
        "हैलो दोस्त! आज कैसा मूड है?",
        "अरे यार! क्या सोच रहे हो? बताओ।",
        "हैलो! कैसे हो? कुछ बात करते हैं।",
        "अरे भाई! क्या हाल है? मैं यहाँ हूँ सुनने के लिए।"
      ],
      hinglish: [
        "Hey! क्या चल रहा है? How's your day?",
        "Hi! कैसे हो? What's on your mind?",
        "अरे buddy! कैसे feeling कर रहे हो?",
        "What's up? बताओ क्या हो रहा है।",
        "Hey! सब कुछ कैसा है? What's happening?",
        "Hi! क्या हाल है? I'm here to chat।",
        "Hey there! कैसा day रहा?",
        "What's up? Tell me what's going on।",
        "Hi! कैसे हो? What's new?",
        "Hey! क्या हो रहा है? How can I help?"
      ]
    };

    const languageStarters = starters[language] || starters.english;
    return languageStarters[Math.floor(Math.random() * languageStarters.length)];
  }
}

export default new AIService();
