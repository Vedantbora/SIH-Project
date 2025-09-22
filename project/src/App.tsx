import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout/Layout';

// Auth Components
import IntroPage from './components/Auth/IntroPage';
import TermsPage from './components/Auth/TermsPage';
import AuthPage from './components/Auth/AuthPage';
import AvatarCreatorPage from './components/Avatar/AvatarCreatorPage';
import ReadyPlayerMeCreator from './components/Auth/ReadyPlayerMeCreator';

// Main Components
import Dashboard from './components/Dashboard/Dashboard';
import TalkPage from './components/Talk/TalkPage';
import GamesPage from './components/Games/GamesPage';
import DailyReportsPage from './components/Reports/DailyReportsPage';
import DailyQuotesPage from './components/Quotes/DailyQuotesPage';
import RewardsPage from './components/Rewards/RewardsPage';
import SettingsPage from './components/Settings/SettingsPage';
import HelpPage from './components/Help/HelpPage';

// Placeholder components for other routes
const AdminPage = () => <div className="text-white">Admin Panel - Coming Soon</div>;

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><IntroPage /></Layout>} />
            <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
            <Route path="/auth" element={<Layout><AuthPage /></Layout>} />
            <Route path="/avatar-creator" element={<Layout requireAuth><ReadyPlayerMeCreator /></Layout>} />
            <Route path="/avatar-creator-advanced" element={<AvatarCreatorPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<Layout requireAuth><Dashboard /></Layout>} />
            <Route path="/talk" element={<Layout requireAuth><TalkPage /></Layout>} />
            <Route path="/games" element={<Layout requireAuth><GamesPage /></Layout>} />
            <Route path="/reports" element={<Layout requireAuth><DailyReportsPage /></Layout>} />
            <Route path="/quotes" element={<Layout requireAuth><DailyQuotesPage /></Layout>} />
            <Route path="/rewards" element={<Layout requireAuth><RewardsPage /></Layout>} />
            <Route path="/settings" element={<Layout requireAuth><SettingsPage /></Layout>} />
            <Route path="/help" element={<Layout requireAuth><HelpPage /></Layout>} />
            <Route path="/admin" element={<Layout requireAuth><AdminPage /></Layout>} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;