import React, { useState } from 'react';
import { 
  Shuffle, 
  Save, 
  RotateCcw, 
  Download, 
  Play, 
  Pause,
  Camera,
  Settings
} from 'lucide-react';
import useAvatarStore from '../../stores/avatarStore';
import { 
  faceShapes, 
  eyeShapes, 
  noseShapes, 
  mouthShapes, 
  hairStyles, 
  bodyTypes, 
  clothingStyles, 
  accessoriesOptions, 
  animations,
  skinTones, 
  hairColors, 
  eyeColors, 
  clothingColors 
} from '../../types/avatar';

interface ControlsPanelProps {
  className?: string;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ className = "" }) => {
  const { 
    config, 
    updateConfig, 
    setAnimation, 
    randomizeAvatar, 
    resetAvatar, 
    saveAvatar, 
    exportAvatar 
  } = useAvatarStore();
  
  const [avatarName, setAvatarName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

  const handleSave = () => {
    if (avatarName.trim()) {
      saveAvatar(avatarName.trim());
      setShowSaveDialog(false);
      setAvatarName('');
    }
  };

  const handleExport = () => {
    const avatarData = exportAvatar();
    const blob = new Blob([avatarData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avatar-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAnimationToggle = () => {
    if (isPlayingAnimation) {
      setAnimation('idle');
    } else {
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      setAnimation(randomAnim);
    }
    setIsPlayingAnimation(!isPlayingAnimation);
  };

  const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
  }> = ({ label, value, min, max, step, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-xs text-slate-400 w-12 text-right">
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  );

  const ColorPicker: React.FC<{
    label: string;
    colors: string[];
    value: string;
    onChange: (color: string) => void;
  }> = ({ label, colors, value, onChange }) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              value === color ? 'border-purple-400 scale-110' : 'border-slate-600'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  const SelectControl: React.FC<{
    label: string;
    options: readonly string[];
    value: string;
    onChange: (value: string) => void;
  }> = ({ label, options, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Settings className="w-5 h-5 mr-2 text-purple-400" />
          Avatar Customization
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleAnimationToggle}
            className={`p-2 rounded-lg transition-colors ${
              isPlayingAnimation 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
            title={isPlayingAnimation ? 'Stop Animation' : 'Play Animation'}
          >
            {isPlayingAnimation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={randomizeAvatar}
            className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            title="Randomize Avatar"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button
          onClick={resetAvatar}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
        <button
          onClick={() => {/* TODO: Implement screenshot */}}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Screenshot</span>
        </button>
      </div>

      {/* Customization Sections */}
      <div className="space-y-6">
        {/* Face Shape */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Face Shape</h3>
          <div className="space-y-4">
            <SelectControl
              label="Face Shape"
              options={faceShapes}
              value={config.faceShape}
              onChange={(value) => updateConfig({ faceShape: value as any })}
            />
            <SliderControl
              label="Face Width"
              value={config.faceWidth}
              min={0.8}
              max={1.2}
              step={0.05}
              onChange={(value) => updateConfig({ faceWidth: value })}
            />
            <SliderControl
              label="Face Height"
              value={config.faceHeight}
              min={0.8}
              max={1.2}
              step={0.05}
              onChange={(value) => updateConfig({ faceHeight: value })}
            />
          </div>
        </div>

        {/* Eyes */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Eyes</h3>
          <div className="space-y-4">
            <SelectControl
              label="Eye Shape"
              options={eyeShapes}
              value={config.eyeShape}
              onChange={(value) => updateConfig({ eyeShape: value as any })}
            />
            <SliderControl
              label="Eye Size"
              value={config.eyeSize}
              min={0.7}
              max={1.3}
              step={0.05}
              onChange={(value) => updateConfig({ eyeSize: value })}
            />
            <SliderControl
              label="Eye Spacing"
              value={config.eyeSpacing}
              min={0.8}
              max={1.2}
              step={0.05}
              onChange={(value) => updateConfig({ eyeSpacing: value })}
            />
            <ColorPicker
              label="Eye Color"
              colors={eyeColors}
              value={config.eyeColor}
              onChange={(color) => updateConfig({ eyeColor: color })}
            />
          </div>
        </div>

        {/* Nose */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Nose</h3>
          <div className="space-y-4">
            <SelectControl
              label="Nose Shape"
              options={noseShapes}
              value={config.noseShape}
              onChange={(value) => updateConfig({ noseShape: value as any })}
            />
            <SliderControl
              label="Nose Size"
              value={config.noseSize}
              min={0.7}
              max={1.3}
              step={0.05}
              onChange={(value) => updateConfig({ noseSize: value })}
            />
          </div>
        </div>

        {/* Mouth */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Mouth</h3>
          <div className="space-y-4">
            <SelectControl
              label="Mouth Shape"
              options={mouthShapes}
              value={config.mouthShape}
              onChange={(value) => updateConfig({ mouthShape: value as any })}
            />
            <SliderControl
              label="Mouth Size"
              value={config.mouthSize}
              min={0.7}
              max={1.3}
              step={0.05}
              onChange={(value) => updateConfig({ mouthSize: value })}
            />
            <SelectControl
              label="Expression"
              options={['neutral', 'smile', 'frown'] as const}
              value={config.mouthExpression}
              onChange={(value) => updateConfig({ mouthExpression: value as any })}
            />
          </div>
        </div>

        {/* Hair */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Hair</h3>
          <div className="space-y-4">
            <SelectControl
              label="Hair Style"
              options={hairStyles}
              value={config.hairStyle}
              onChange={(value) => updateConfig({ hairStyle: value as any })}
            />
            <ColorPicker
              label="Hair Color"
              colors={hairColors}
              value={config.hairColor}
              onChange={(color) => updateConfig({ hairColor: color })}
            />
          </div>
        </div>

        {/* Body */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Body</h3>
          <div className="space-y-4">
            <SelectControl
              label="Body Type"
              options={bodyTypes}
              value={config.bodyType}
              onChange={(value) => updateConfig({ bodyType: value as any })}
            />
            <SliderControl
              label="Height"
              value={config.height}
              min={0.8}
              max={1.2}
              step={0.05}
              onChange={(value) => updateConfig({ height: value })}
            />
            <ColorPicker
              label="Skin Tone"
              colors={skinTones}
              value={config.skinTone}
              onChange={(color) => updateConfig({ skinTone: color })}
            />
          </div>
        </div>

        {/* Clothing */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Clothing</h3>
          <div className="space-y-4">
            <SelectControl
              label="Clothing Style"
              options={clothingStyles}
              value={config.clothingStyle}
              onChange={(value) => updateConfig({ clothingStyle: value as any })}
            />
            <ColorPicker
              label="Clothing Color"
              colors={clothingColors}
              value={config.clothingColor}
              onChange={(color) => updateConfig({ clothingColor: color })}
            />
          </div>
        </div>

        {/* Accessories */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Accessories</h3>
          <div className="space-y-4">
            <SelectControl
              label="Accessories"
              options={accessoriesOptions}
              value={config.accessories}
              onChange={(value) => updateConfig({ accessories: value as any })}
            />
          </div>
        </div>

        {/* Animations */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Animations</h3>
          <div className="space-y-4">
            <SelectControl
              label="Animation"
              options={animations}
              value={config.currentAnimation}
              onChange={(value) => setAnimation(value as any)}
            />
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-96">
            <h3 className="text-white font-semibold mb-4">Save Avatar</h3>
            <input
              type="text"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              placeholder="Enter avatar name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={!avatarName.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlsPanel;
