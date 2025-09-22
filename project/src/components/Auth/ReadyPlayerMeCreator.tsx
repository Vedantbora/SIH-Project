import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ReadyPlayerMeCreator: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [manualAvatarUrl, setManualAvatarUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ready Player Me API Key
  const RPM_API_KEY = 'sk_live_L4D4pqIsHWJjlg3gkEw8uQmzi6EfTeGGviSK';

  useEffect(() => {
    // Listen for messages from Ready Player Me iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://readyplayer.me') return;

      if (event.data.type === 'v1.avatar.exported') {
        const { url } = event.data;
        setAvatarUrl(url);
        console.log('Avatar created:', url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSaveAvatar = async () => {
    const finalAvatarUrl = avatarUrl || manualAvatarUrl;
    
    if (!finalAvatarUrl) {
      alert('Please create an avatar or paste the Ready Player Me link!');
      return;
    }

    setLoading(true);
    setIsProcessing(true);
    
    // Simulate 1 minute processing time
    setTimeout(async () => {
      try {
      // Save avatar to backend
      const response = await fetch('http://localhost:5000/api/auth/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          avatar_url: finalAvatarUrl,
          avatar_name: user?.name || 'My Avatar'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar');
      }

      const data = await response.json();
      
      // Update user context with new avatar
      updateUser({
        avatar_url: finalAvatarUrl,
        avatar_name: data.avatar_name
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving avatar:', error);
      alert('Failed to save avatar. Please try again.');
      } finally {
        setLoading(false);
        setIsProcessing(false);
      }
    }, 10000); // 10 seconds delay (change to 60000 for 1 minute)
  };

  const handleSkip = () => {
    // Navigate to dashboard without avatar
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Your Avatar</h1>
              <p className="text-slate-300">Design your unique MindQuest companion with Ready Player Me</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSaveAvatar}
              disabled={(!avatarUrl && !manualAvatarUrl) || loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                (avatarUrl || manualAvatarUrl) && !loading
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white hover:scale-105'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isProcessing ? 'Processing...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Avatar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Creator Container */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ready Player Me Iframe */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-[600px]">
              <div className="h-full">
                <iframe
                  ref={iframeRef}
                  src={`https://readyplayer.me/avatar?frameApi&apiKey=${RPM_API_KEY}&bodyType=fullbody&gender=male&ui=modern&quickStart=true`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="camera; microphone"
                  className="rounded-lg"
                />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-slate-400 text-sm">
                  Create your avatar using Ready Player Me • Camera access required for face scanning
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Welcome, {user?.name}!</h3>
                  <p className="text-purple-200 text-sm">Let's create your avatar</p>
                </div>
              </div>
              <p className="text-purple-100 text-sm leading-relaxed">
                Use Ready Player Me to create a personalized 3D avatar that will represent you in our wellness community.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">How to create your avatar:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-slate-300 text-sm">Allow camera access when prompted</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-slate-300 text-sm">Take a selfie or upload a photo</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-slate-300 text-sm">Customize your avatar's appearance</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p className="text-slate-300 text-sm">Click "Save Avatar" when done</p>
                </div>
              </div>
            </div>

            {/* Avatar Preview */}
            {avatarUrl && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Your Avatar Preview:</h3>
                <div className="text-center">
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-cyan-400 shadow-xl mx-auto"
                  />
                  <p className="text-slate-300 text-sm mt-3">Avatar created successfully!</p>
                </div>
              </div>
            )}

            {/* Manual Link Input */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Or Paste Ready Player Me Link:</h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={manualAvatarUrl}
                  onChange={(e) => setManualAvatarUrl(e.target.value)}
                  placeholder="https://models.readyplayer.me/..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
                <p className="text-slate-400 text-sm">
                  Paste the Ready Player Me link here if the automatic detection didn't work
                </p>
                {manualAvatarUrl && (
                  <div className="text-center">
                    <img
                      src={manualAvatarUrl}
                      alt="Manual Avatar Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400 shadow-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-slate-300 text-xs mt-2">Preview loaded!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                  <h3 className="text-amber-300 font-semibold text-lg mb-2">Processing Your Avatar...</h3>
                  <p className="text-amber-100 text-sm">
                    Please wait while we process and save your avatar. This may take up to 1 minute.
                  </p>
                  <div className="mt-4 bg-amber-500/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">💡 Tips:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Good lighting works best for face scanning</li>
                <li>• Keep your face centered in the camera</li>
                <li>• You can always edit your avatar later</li>
                <li>• Your avatar will appear in the dashboard</li>
                <li>• If automatic detection fails, paste the link manually</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyPlayerMeCreator;
