import React, { useEffect, useState } from 'react';
import { Sparkles, Users, Zap, Camera } from 'lucide-react';
import AvatarRenderer from './AvatarRenderer';
import ControlsPanel from './ControlsPanel';
import useAvatarStore from '../../stores/avatarStore';

const AvatarCreator: React.FC = () => {
  const { config, isAnimating, animationProgress, setAnimation } = useAvatarStore();
  const [currentAnimationProgress, setCurrentAnimationProgress] = useState(0);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) {
      setCurrentAnimationProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentAnimationProgress((prev) => {
        const newProgress = prev + 0.02;
        if (newProgress >= 1) {
          setAnimation('idle');
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, setAnimation]);

  const handleScreenshot = () => {
    // TODO: Implement screenshot functionality
    console.log('Screenshot functionality to be implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">3D Avatar Creator</h1>
                <p className="text-slate-300">Create your unique Bitmoji-style avatar with advanced customization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <Users className="w-5 h-5" />
                <span className="text-sm">Real-time 3D Preview</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Advanced Animations</span>
              </div>
              <button
                onClick={handleScreenshot}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Screenshot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* 3D Avatar Preview */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-full">
              <div className="h-full relative">
                <AvatarRenderer
                  config={config}
                  isAnimating={isAnimating}
                  animationProgress={currentAnimationProgress}
                  className="h-full"
                />
                
                {/* Animation Progress Bar */}
                {isAnimating && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-100 ease-linear"
                        style={{ width: `${currentAnimationProgress * 100}%` }}
                      />
                    </div>
                    <p className="text-slate-300 text-sm mt-2 text-center">
                      Playing: {config.currentAnimation.charAt(0).toUpperCase() + config.currentAnimation.slice(1)} Animation
                    </p>
                  </div>
                )}
                
                {/* Avatar Info */}
                <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white text-sm">
                    <div className="font-semibold">Avatar Stats</div>
                    <div className="text-slate-300 text-xs mt-1">
                      <div>Face: {config.faceShape}</div>
                      <div>Hair: {config.hairStyle}</div>
                      <div>Style: {config.clothingStyle}</div>
                      <div>Height: {Math.round(config.height * 100)}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Controls Info */}
                <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white text-sm">
                    <div className="font-semibold">Controls</div>
                    <div className="text-slate-300 text-xs mt-1">
                      <div>🖱️ Drag to rotate</div>
                      <div>🔍 Scroll to zoom</div>
                      <div>📱 Touch friendly</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="h-full">
            <ControlsPanel className="h-full" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Advanced Customization</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Fine-tune every aspect of your avatar with parametric controls for face shape, 
              eye size, nose shape, and more.
            </p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Real-time Animations</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Watch your avatar come to life with smooth animations including idle breathing, 
              waving, smiling, and dancing.
            </p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Export & Share</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Save your creations locally, export as JSON, and take screenshots to share 
              your unique avatar with friends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCreator;
