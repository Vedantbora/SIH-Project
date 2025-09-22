import React, { createContext, useContext, useState } from 'react';
import { Game, DailyQuote, Reward, MoodEntry } from '../types';

interface AppContextType {
  games: Game[];
  dailyQuotes: DailyQuote[];
  rewards: Reward[];
  moodEntries: MoodEntry[];
  userPoints: number;
  addPoints: (points: number) => void;
  updateMood: (score: number, notes?: string) => void;
  likeQuote: (quoteId: string) => void;
  redeemReward: (rewardId: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Games will be loaded from API

// Daily quotes will be loaded from API

// Rewards will be loaded from API

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [dailyQuotes, setDailyQuotes] = useState<DailyQuote[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  const addPoints = (points: number) => {
    setUserPoints(prev => prev + points);
  };

  const updateMood = (score: number, notes?: string) => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      user_id: '1',
      mood_score: score,
      date: new Date().toISOString(),
      notes
    };
    setMoodEntries(prev => [newEntry, ...prev]);
  };

  const likeQuote = (quoteId: string) => {
    setDailyQuotes(prev =>
      prev.map(quote =>
        quote.id === quoteId
          ? {
              ...quote,
              likes: quote.user_liked ? quote.likes - 1 : quote.likes + 1,
              user_liked: !quote.user_liked
            }
          : quote
      )
    );
  };

  const redeemReward = async (rewardId: string): Promise<string> => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error('Reward not found');
    
    if (userPoints < reward.points_required) {
      throw new Error('Insufficient points');
    }

    // TODO: Implement real API call to redeem reward
    // const response = await fetch('/api/rewards/redeem', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ rewardId })
    // });
    // const data = await response.json();
    
    setUserPoints(prev => prev - reward.points_required);
    
    // TODO: Return real voucher code from API
    throw new Error('Reward redemption not implemented yet');
  };

  return (
    <AppContext.Provider value={{
      games,
      dailyQuotes,
      rewards,
      moodEntries,
      userPoints,
      addPoints,
      updateMood,
      likeQuote,
      redeemReward
    }}>
      {children}
    </AppContext.Provider>
  );
};