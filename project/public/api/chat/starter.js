// Simple chat starter endpoint
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { language } = req.query;

  const starters = {
    hindi: [
      "अरे! क्या चल रहा है? कैसे हो?",
      "हैलो! आज कैसा दिन रहा?",
      "अरे भाई! कैसे हो? क्या हाल है?",
      "क्या हो रहा है? बताओ क्या चल रहा है।",
      "हैलो! सब कुछ कैसा चल रहा है?"
    ],
    english: [
      "Hey! What's up? How's your day going?",
      "Hi there! What's on your mind today?",
      "Hey buddy! How are you feeling?",
      "What's going on? Tell me what's up.",
      "Hey! How's everything? What's happening?"
    ],
    hinglish: [
      "Hey! क्या चल रहा है? How's your day?",
      "Hi! कैसे हो? What's on your mind?",
      "अरे buddy! कैसे feeling कर रहे हो?",
      "What's up? बताओ क्या हो रहा है।",
      "Hey! सब कुछ कैसा है? What's happening?"
    ]
  };

  const selectedLanguage = language || 'hindi';
  const languageStarters = starters[selectedLanguage] || starters.hindi;
  const randomStarter = languageStarters[Math.floor(Math.random() * languageStarters.length)];

  return res.status(200).json({
    success: true,
    message: 'Welcome message generated',
    data: { message: randomStarter }
  });
}
