import React, { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { userPoints } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <header className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">
            Welcome back, {user?.name}!
          </h2>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 rounded-full border border-amber-500/30">
            <Gift className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-semibold">{userPoints} Points</span>
          </div>

          <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-slate-300 font-medium">{user?.name}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                <button className="flex items-center space-x-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white w-full text-left transition-colors">
                  <Settings size={16} />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white w-full text-left transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;