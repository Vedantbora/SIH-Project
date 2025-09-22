// Avatar Types and Interfaces
export interface AvatarConfig {
  // Face customization
  faceShape: 'round' | 'oval' | 'square' | 'heart';
  faceWidth: number; // 0.8 - 1.2
  faceHeight: number; // 0.8 - 1.2
  
  // Eyes
  eyeShape: 'round' | 'almond' | 'narrow' | 'wide';
  eyeSize: number; // 0.7 - 1.3
  eyeSpacing: number; // 0.8 - 1.2
  eyeColor: string;
  
  // Nose
  noseShape: 'small' | 'medium' | 'large' | 'wide';
  noseSize: number; // 0.7 - 1.3
  
  // Mouth
  mouthShape: 'small' | 'medium' | 'wide' | 'smile';
  mouthSize: number; // 0.7 - 1.3
  mouthExpression: 'neutral' | 'smile' | 'frown';
  
  // Hair
  hairStyle: 'short' | 'medium' | 'long' | 'curly' | 'wavy' | 'bald' | 'beard' | 'mustache';
  hairColor: string;
  
  // Skin
  skinTone: string;
  
  // Body
  bodyType: 'slim' | 'average' | 'athletic' | 'curvy';
  height: number; // 0.8 - 1.2
  
  // Clothing
  clothingStyle: 'casual' | 'formal' | 'sporty' | 'vintage' | 'modern' | 'stylish';
  clothingColor: string;
  
  // Accessories
  accessories: 'none' | 'sunglasses' | 'earring' | 'both';
  
  // Animation
  currentAnimation: 'idle' | 'wave' | 'smile' | 'dance';
}

export interface AvatarState {
  config: AvatarConfig;
  isAnimating: boolean;
  animationProgress: number;
}

export const defaultAvatarConfig: AvatarConfig = {
  faceShape: 'oval',
  faceWidth: 1.0,
  faceHeight: 1.0,
  eyeShape: 'round',
  eyeSize: 1.0,
  eyeSpacing: 1.0,
  eyeColor: '#2F1B14',
  noseShape: 'medium',
  noseSize: 1.0,
  mouthShape: 'medium',
  mouthSize: 1.0,
  mouthExpression: 'neutral',
  hairStyle: 'short',
  hairColor: '#2F1B14',
  skinTone: '#E8A87C',
  bodyType: 'average',
  height: 1.0,
  clothingStyle: 'casual',
  clothingColor: '#1E3A8A',
  accessories: 'none',
  currentAnimation: 'idle'
};

export const faceShapes = ['round', 'oval', 'square', 'heart'] as const;
export const eyeShapes = ['round', 'almond', 'narrow', 'wide'] as const;
export const noseShapes = ['small', 'medium', 'large', 'wide'] as const;
export const mouthShapes = ['small', 'medium', 'wide', 'smile'] as const;
export const hairStyles = ['short', 'medium', 'long', 'curly', 'wavy', 'bald', 'beard', 'mustache'] as const;
export const bodyTypes = ['slim', 'average', 'athletic', 'curvy'] as const;
export const clothingStyles = ['casual', 'formal', 'sporty', 'vintage', 'modern', 'stylish'] as const;
export const accessoriesOptions = ['none', 'sunglasses', 'earring', 'both'] as const;
export const animations = ['idle', 'wave', 'smile', 'dance'] as const;

export const skinTones = [
  '#FDBCB4', '#E8A87C', '#D08B5B', '#AE5D29', '#8B4513', '#654321', '#4A2C2A', '#2D1810'
];

export const hairColors = [
  '#2F1B14', '#1A0F0A', '#8B4513', '#654321', '#4A2C2A', '#FFD700', '#C0C0C0', '#FFFFFF', '#8B0000'
];

export const eyeColors = [
  '#2F1B14', '#654321', '#8B4513', '#000080', '#006400', '#8B0000', '#4B0082'
];

export const clothingColors = [
  '#1E3A8A', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#BE185D', '#0F172A', '#374151'
];
