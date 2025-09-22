import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AvatarCreator from './AvatarCreator';

const AvatarCreatorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">3D Avatar Creator</h1>
            <p className="text-slate-300 text-sm">Create your unique Bitmoji-style avatar</p>
          </div>
        </div>
      </div>

      {/* Avatar Creator Component */}
      <AvatarCreator />
    </div>
  );
};

export default AvatarCreatorPage;
