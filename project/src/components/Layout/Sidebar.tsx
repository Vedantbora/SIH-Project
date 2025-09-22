import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Gamepad2, 
  BarChart3, 
  Quote, 
  Gift, 
  Settings,
  HelpCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navigationItems = [
    { to: '/dashboard', icon: Home, label: 'Home', adminOnly: false },
    { to: '/talk', icon: MessageCircle, label: 'Talk With Me', adminOnly: false },
    { to: '/games', icon: Gamepad2, label: 'Games', adminOnly: false },
    { to: '/reports', icon: BarChart3, label: 'Daily Reports', adminOnly: false },
    { to: '/quotes', icon: Quote, label: 'Daily Quotes', adminOnly: false },
    { to: '/rewards', icon: Gift, label: 'Rewards & Earn', adminOnly: false },
    { to: '/settings', icon: Settings, label: 'Settings', adminOnly: false },
    { to: '/help', icon: HelpCircle, label: 'Help & Crisis', adminOnly: false },
    { to: '/admin', icon: Shield, label: 'Admin Panel', adminOnly: true },
  ];

  const visibleItems = navigationItems.filter(item => 
    !item.adminOnly || (item.adminOnly && user?.is_admin)
  );

  return (
    <div className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">MindQuest</h1>
        <p className="text-slate-400 text-sm">Your MindQuest Companion</p>
      </div>

      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )
              }
            >
              <Icon size={20} className="transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;