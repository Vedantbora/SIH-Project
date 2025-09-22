import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AvatarConfig, AvatarState, defaultAvatarConfig } from '../types/avatar';

interface AvatarStore extends AvatarState {
  // Actions
  updateConfig: (updates: Partial<AvatarConfig>) => void;
  setAnimation: (animation: AvatarConfig['currentAnimation']) => void;
  randomizeAvatar: () => void;
  resetAvatar: () => void;
  saveAvatar: (name: string) => void;
  loadAvatar: (name: string) => void;
  exportAvatar: () => string;
}

const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      config: defaultAvatarConfig,
      isAnimating: false,
      animationProgress: 0,

      updateConfig: (updates) => {
        set((state) => ({
          config: { ...state.config, ...updates }
        }));
      },

      setAnimation: (animation) => {
        set((state) => ({
          config: { ...state.config, currentAnimation: animation },
          isAnimating: animation !== 'idle',
          animationProgress: 0
        }));
      },

      randomizeAvatar: () => {
        const { faceShapes, eyeShapes, noseShapes, mouthShapes, hairStyles, bodyTypes, clothingStyles, accessoriesOptions, skinTones, hairColors, eyeColors, clothingColors } = require('../types/avatar');
        
        const randomConfig: Partial<AvatarConfig> = {
          faceShape: faceShapes[Math.floor(Math.random() * faceShapes.length)],
          faceWidth: 0.8 + Math.random() * 0.4,
          faceHeight: 0.8 + Math.random() * 0.4,
          eyeShape: eyeShapes[Math.floor(Math.random() * eyeShapes.length)],
          eyeSize: 0.7 + Math.random() * 0.6,
          eyeSpacing: 0.8 + Math.random() * 0.4,
          eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
          noseShape: noseShapes[Math.floor(Math.random() * noseShapes.length)],
          noseSize: 0.7 + Math.random() * 0.6,
          mouthShape: mouthShapes[Math.floor(Math.random() * mouthShapes.length)],
          mouthSize: 0.7 + Math.random() * 0.6,
          mouthExpression: ['neutral', 'smile', 'frown'][Math.floor(Math.random() * 3)] as any,
          hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
          hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
          skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
          bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
          height: 0.8 + Math.random() * 0.4,
          clothingStyle: clothingStyles[Math.floor(Math.random() * clothingStyles.length)],
          clothingColor: clothingColors[Math.floor(Math.random() * clothingColors.length)],
          accessories: accessoriesOptions[Math.floor(Math.random() * accessoriesOptions.length)]
        };

        set((state) => ({
          config: { ...state.config, ...randomConfig }
        }));
      },

      resetAvatar: () => {
        set({
          config: defaultAvatarConfig,
          isAnimating: false,
          animationProgress: 0
        });
      },

      saveAvatar: (name: string) => {
        const { config } = get();
        const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '{}');
        savedAvatars[name] = config;
        localStorage.setItem('savedAvatars', JSON.stringify(savedAvatars));
      },

      loadAvatar: (name: string) => {
        const savedAvatars = JSON.parse(localStorage.getItem('savedAvatars') || '{}');
        if (savedAvatars[name]) {
          set({
            config: savedAvatars[name],
            isAnimating: false,
            animationProgress: 0
          });
        }
      },

      exportAvatar: () => {
        const { config } = get();
        return JSON.stringify(config, null, 2);
      }
    }),
    {
      name: 'avatar-store',
      partialize: (state) => ({ config: state.config })
    }
  )
);

export default useAvatarStore;
