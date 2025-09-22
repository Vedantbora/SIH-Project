import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Heart, MessageCircle, Plus, Star, Calendar, User, ThumbsUp, Edit3, CheckCircle, Clock } from 'lucide-react';
import { quotesService } from '../../services/quotesService';
import { Quote as QuoteType, UserQuote } from '../../types/quote';

const DailyQuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [userQuotes, setUserQuotes] = useState<UserQuote[]>([]);
  const [todaysQuote, setTodaysQuote] = useState<QuoteType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'user' | 'submit'>('daily');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submittedQuotes, setSubmittedQuotes] = useState<UserQuote[]>([]);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    content: '',
    author: ''
  });

  useEffect(() => {
    loadQuotes();
    loadUserQuotes();
    loadTodaysQuote();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await quotesService.getQuotes();
      setQuotes(data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
  };

  const loadUserQuotes = async () => {
    try {
      const data = await quotesService.getUserQuotes();
      setUserQuotes(data);
    } catch (error) {
      console.error('Failed to load user quotes:', error);
    }
  };

  const loadTodaysQuote = async () => {
    try {
      const data = await quotesService.getTodaysQuote();
      setTodaysQuote(data);
    } catch (error) {
      console.error('Failed to load today\'s quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (quoteId: number, quoteType: 'daily' | 'user' = 'daily') => {
    try {
      if (likedQuotes.has(quoteId)) {
        await quotesService.unlikeQuote(quoteId, quoteType);
        setLikedQuotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(quoteId);
          return newSet;
        });
      } else {
        await quotesService.likeQuote(quoteId, quoteType);
        setLikedQuotes(prev => new Set(prev).add(quoteId));
      }
      
      // Reload quotes to update like counts
      loadQuotes();
      loadUserQuotes();
    } catch (error) {
      console.error('Failed to like/unlike quote:', error);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.content.trim().length < 10) {
      alert('Quote must be at least 10 characters long');
      return;
    }

    try {
      await quotesService.submitQuote({
        content: formData.content.trim(),
        author: formData.author.trim() || undefined
      });

      // Reset form
      setFormData({ content: '', author: '' });
      setShowSubmitForm(false);
      setActiveTab('user');
      
      // Reload user quotes
      loadUserQuotes();
      
      alert('Quote submitted successfully! It will be reviewed before being published.');
    } catch (error) {
      console.error('Failed to submit quote:', error);
      alert('Failed to submit quote. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getApprovalStatus = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Approved</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-yellow-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Pending Review</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading quotes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Quote className="w-10 h-10 text-purple-400" />
            Daily Quotes
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find inspiration, share wisdom, and connect through powerful words.
          </p>
        </motion.div>

        {/* Today's Quote */}
        {todaysQuote && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8 mb-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Quote of the Day</span>
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-4 leading-relaxed">
                "{todaysQuote.content}"
              </blockquote>
              <cite className="text-lg text-purple-300">— {todaysQuote.author}</cite>
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => handleLike(todaysQuote.id, 'daily')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    likedQuotes.has(todaysQuote.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedQuotes.has(todaysQuote.id) ? 'fill-current' : ''}`} />
                  <span>{todaysQuote.likes}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {[
            { id: 'daily', label: 'All Quotes', icon: Quote },
            { id: 'user', label: 'My Quotes', icon: User },
            { id: 'submit', label: 'Submit Quote', icon: Plus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'submit') {
                  setShowSubmitForm(true);
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quotes.map((quote, index) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
                  >
                    <blockquote className="text-white mb-4 leading-relaxed">
                      "{quote.content}"
                    </blockquote>
                    <cite className="text-purple-300 text-sm block mb-4">— {quote.author}</cite>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(quote.date)}</span>
                      </div>
                      <button
                        onClick={() => handleLike(quote.id, 'daily')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                          likedQuotes.has(quote.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedQuotes.has(quote.id) ? 'fill-current' : ''}`} />
                        <span>{quote.likes}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'user' && (
            <motion.div
              key="user"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {userQuotes.length > 0 ? (
                <div className="space-y-6">
                  {userQuotes.map((quote, index) => (
                    <motion.div
                      key={quote.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
                    >
                      <blockquote className="text-white mb-4 leading-relaxed">
                        "{quote.content}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <cite className="text-purple-300 text-sm">— {quote.author}</cite>
                          {getApprovalStatus(quote.is_approved)}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(quote.created_at)}</span>
                          </div>
                          <button
                            onClick={() => handleLike(quote.id, 'user')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                              likedQuotes.has(quote.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedQuotes.has(quote.id) ? 'fill-current' : ''}`} />
                            <span>{quote.likes}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Quotes Yet</h3>
                  <p className="text-gray-300 mb-6">Start sharing your wisdom with the community!</p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Submit Your First Quote
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Share Your Wisdom</h3>
                  
                  <form onSubmit={handleSubmitQuote} className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Your Quote</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Share an inspiring quote, life lesson, or motivational thought..."
                        className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
                        rows={4}
                        required
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        Minimum 10 characters. Current: {formData.content.length}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Author (Optional)</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Your name or leave blank for 'Anonymous'"
                        className="w-full bg-white/10 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors font-medium"
                      >
                        Submit Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('daily')}
                        className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-6 p-4 bg-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-blue-300 text-sm">
                        <p className="font-medium mb-1">Submission Guidelines:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Quotes should be original or properly attributed</li>
                          <li>• Content must be positive and inspiring</li>
                          <li>• All submissions are reviewed before publishing</li>
                          <li>• Keep quotes respectful and appropriate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyQuotesPage;
