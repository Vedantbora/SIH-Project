import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarConfig } from '../../types/avatar';

interface AvatarRendererProps {
  config: AvatarConfig;
  isAnimating: boolean;
  animationProgress: number;
  className?: string;
}

// Enhanced 3D Avatar Component with Animations
function Avatar({ config, isAnimating, animationProgress }: { config: AvatarConfig; isAnimating: boolean; animationProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Idle animation - subtle breathing
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    
    // Breathing animation
    if (headRef.current) {
      headRef.current.position.y = 1.5 + Math.sin(time * 2) * 0.02;
    }
    
    // Animation-specific movements
    if (isAnimating) {
      switch (config.currentAnimation) {
        case 'wave':
          if (rightArmRef.current && rightHandRef.current) {
            const waveAngle = Math.sin(animationProgress * Math.PI * 4) * 0.5;
            rightArmRef.current.rotation.z = waveAngle;
            rightHandRef.current.rotation.z = waveAngle * 0.5;
          }
          break;
        case 'smile':
          // Smile animation handled in mouth rendering
          break;
        case 'dance':
          if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(animationProgress * Math.PI * 2) * 0.3;
            groupRef.current.position.y = Math.sin(animationProgress * Math.PI * 4) * 0.1;
          }
          break;
      }
    }
  });

  const renderFace = () => {
    const faceGeometry = useMemo(() => {
      switch (config.faceShape) {
        case 'round':
          return new THREE.SphereGeometry(0.5 * config.faceWidth, 32, 32);
        case 'oval':
          return new THREE.SphereGeometry(0.5 * config.faceWidth, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8);
        case 'square':
          return new THREE.BoxGeometry(0.5 * config.faceWidth, 0.5 * config.faceHeight, 0.3);
        case 'heart':
          return new THREE.SphereGeometry(0.5 * config.faceWidth, 32, 32);
        default:
          return new THREE.SphereGeometry(0.5, 32, 32);
      }
    }, [config.faceShape, config.faceWidth, config.faceHeight]);

    return (
      <mesh ref={headRef} position={[0, 1.5, 0]} geometry={faceGeometry}>
        <meshStandardMaterial 
          color={config.skinTone} 
          roughness={0.6} 
          metalness={0.1}
        />
      </mesh>
    );
  };

  const renderEyes = () => {
    const eyeGeometry = useMemo(() => {
      switch (config.eyeShape) {
        case 'round':
          return new THREE.SphereGeometry(0.06 * config.eyeSize, 16, 16);
        case 'almond':
          return new THREE.SphereGeometry(0.06 * config.eyeSize, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
        case 'narrow':
          return new THREE.BoxGeometry(0.08 * config.eyeSize, 0.04 * config.eyeSize, 0.02);
        case 'wide':
          return new THREE.SphereGeometry(0.08 * config.eyeSize, 16, 16);
        default:
          return new THREE.SphereGeometry(0.06, 16, 16);
      }
    }, [config.eyeShape, config.eyeSize]);

    const eyeSpacing = 0.18 * config.eyeSpacing;

    return (
      <group>
        {/* Left eye */}
        <mesh position={[-eyeSpacing, 1.58, 0.42]} geometry={eyeGeometry}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
        <mesh position={[-eyeSpacing, 1.58, 0.45]} geometry={eyeGeometry}>
          <meshStandardMaterial color={config.eyeColor} roughness={0.3} />
        </mesh>
        <mesh position={[-eyeSpacing, 1.58, 0.47]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.1} />
        </mesh>
        
        {/* Right eye */}
        <mesh position={[eyeSpacing, 1.58, 0.42]} geometry={eyeGeometry}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
        <mesh position={[eyeSpacing, 1.58, 0.45]} geometry={eyeGeometry}>
          <meshStandardMaterial color={config.eyeColor} roughness={0.3} />
        </mesh>
        <mesh position={[eyeSpacing, 1.58, 0.47]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.1} />
        </mesh>
      </group>
    );
  };

  const renderNose = () => {
    const noseGeometry = useMemo(() => {
      switch (config.noseShape) {
        case 'small':
          return new THREE.ConeGeometry(0.03 * config.noseSize, 0.06 * config.noseSize, 8);
        case 'medium':
          return new THREE.ConeGeometry(0.04 * config.noseSize, 0.08 * config.noseSize, 8);
        case 'large':
          return new THREE.ConeGeometry(0.05 * config.noseSize, 0.1 * config.noseSize, 8);
        case 'wide':
          return new THREE.BoxGeometry(0.08 * config.noseSize, 0.06 * config.noseSize, 0.04 * config.noseSize);
        default:
          return new THREE.ConeGeometry(0.04, 0.08, 8);
      }
    }, [config.noseShape, config.noseSize]);

    return (
      <mesh position={[0, 1.5, 0.48]} geometry={noseGeometry}>
        <meshStandardMaterial color={config.skinTone} roughness={0.6} />
      </mesh>
    );
  };

  const renderMouth = () => {
    const mouthGeometry = useMemo(() => {
      const smileMultiplier = config.mouthExpression === 'smile' ? 1.2 : 1.0;
      const frownMultiplier = config.mouthExpression === 'frown' ? 0.8 : 1.0;
      
      switch (config.mouthShape) {
        case 'small':
          return new THREE.TorusGeometry(0.04 * config.mouthSize * smileMultiplier * frownMultiplier, 0.01, 8, 16, Math.PI);
        case 'medium':
          return new THREE.TorusGeometry(0.06 * config.mouthSize * smileMultiplier * frownMultiplier, 0.015, 8, 16, Math.PI);
        case 'wide':
          return new THREE.TorusGeometry(0.08 * config.mouthSize * smileMultiplier * frownMultiplier, 0.015, 8, 16, Math.PI);
        case 'smile':
          return new THREE.TorusGeometry(0.07 * config.mouthSize * smileMultiplier, 0.015, 8, 16, Math.PI);
        default:
          return new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI);
      }
    }, [config.mouthShape, config.mouthSize, config.mouthExpression]);

    return (
      <mesh position={[0, 1.42, 0.46]} rotation={[0, 0, 0]} geometry={mouthGeometry}>
        <meshStandardMaterial color="#8B0000" roughness={0.4} />
      </mesh>
    );
  };

  const renderHair = () => {
    switch (config.hairStyle) {
      case 'short':
        return (
          <mesh position={[0, 1.75, 0]}>
            <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.8} />
          </mesh>
        );
      case 'medium':
        return (
          <group>
            <mesh position={[0, 1.8, 0]}>
              <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
              <meshStandardMaterial color={config.hairColor} roughness={0.8} />
            </mesh>
            {[...Array(8)].map((_, i) => (
              <mesh key={i} position={[
                Math.cos(i * Math.PI / 4) * 0.4,
                1.6 + Math.sin(i * 0.5) * 0.1,
                Math.sin(i * Math.PI / 4) * 0.4
              ]}>
                <cylinderGeometry args={[0.02, 0.01, 0.3, 8]} />
                <meshStandardMaterial color={config.hairColor} roughness={0.8} />
              </mesh>
            ))}
          </group>
        );
      case 'beard':
        return (
          <group>
            <mesh position={[0, 1.75, 0]}>
              <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
              <meshStandardMaterial color={config.hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.3, 0.4]}>
              <boxGeometry args={[0.3, 0.15, 0.1]} />
              <meshStandardMaterial color={config.hairColor} roughness={0.8} />
            </mesh>
          </group>
        );
      case 'mustache':
        return (
          <group>
            <mesh position={[0, 1.75, 0]}>
              <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
              <meshStandardMaterial color={config.hairColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.45, 0.45]}>
              <boxGeometry args={[0.2, 0.05, 0.05]} />
              <meshStandardMaterial color={config.hairColor} roughness={0.8} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh position={[0, 1.75, 0]}>
            <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color={config.hairColor} roughness={0.8} />
          </mesh>
        );
    }
  };

  const renderClothing = () => {
    switch (config.clothingStyle) {
      case 'casual':
        return (
          <group>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.45, 0.35, 0.8, 32]} />
              <meshStandardMaterial color={config.clothingColor} roughness={0.7} />
            </mesh>
            <mesh position={[-0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.9, 16]} />
              <meshStandardMaterial color="#1E3A8A" roughness={0.8} />
            </mesh>
            <mesh position={[0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.9, 16]} />
              <meshStandardMaterial color="#1E3A8A" roughness={0.8} />
            </mesh>
          </group>
        );
      case 'stylish':
        return (
          <group>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.44, 0.34, 0.8, 32]} />
              <meshStandardMaterial color="#87CEEB" roughness={0.4} />
            </mesh>
            <mesh position={[-0.65, 0.7, 0]} rotation={[0, 0, 0.1]}>
              <cylinderGeometry args={[0.07, 0.05, 0.4, 16]} />
              <meshStandardMaterial color={config.skinTone} roughness={0.6} />
            </mesh>
            <mesh position={[0.65, 0.7, 0]} rotation={[0, 0, -0.1]}>
              <cylinderGeometry args={[0.07, 0.05, 0.4, 16]} />
              <meshStandardMaterial color={config.skinTone} roughness={0.6} />
            </mesh>
            <mesh position={[-0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.9, 16]} />
              <meshStandardMaterial color="#2D3748" roughness={0.8} />
            </mesh>
            <mesh position={[0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.9, 16]} />
              <meshStandardMaterial color="#2D3748" roughness={0.8} />
            </mesh>
          </group>
        );
      default:
        return (
          <group>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.45, 0.35, 0.8, 32]} />
              <meshStandardMaterial color={config.clothingColor} roughness={0.7} />
            </mesh>
            <mesh position={[-0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.9, 16]} />
              <meshStandardMaterial color="#374151" roughness={0.8} />
            </mesh>
            <mesh position={[0.2, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.9, 16]} />
              <meshStandardMaterial color="#374151" roughness={0.8} />
            </mesh>
          </group>
        );
    }
  };

  const renderAccessories = () => {
    if (config.accessories === 'none') return null;

    return (
      <group>
        {(config.accessories === 'sunglasses' || config.accessories === 'both') && (
          <group>
            <mesh position={[-0.18, 1.58, 0.5]}>
              <boxGeometry args={[0.12, 0.08, 0.01]} />
              <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
            </mesh>
            <mesh position={[0.18, 1.58, 0.5]}>
              <boxGeometry args={[0.12, 0.08, 0.01]} />
              <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
            </mesh>
            <mesh position={[0, 1.58, 0.5]}>
              <boxGeometry args={[0.02, 0.08, 0.01]} />
              <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        )}
        
        {(config.accessories === 'earring' || config.accessories === 'both') && (
          <mesh position={[0.45, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.02, 0.005, 8, 16]} />
            <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.9} />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group ref={groupRef} scale={[1, config.height, 1]}>
      {/* Face */}
      {renderFace()}
      
      {/* Hair */}
      {renderHair()}
      
      {/* Eyes */}
      {renderEyes()}
      
      {/* Eyebrows */}
      <mesh position={[-0.18, 1.65, 0.41]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={config.hairColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 1.65, 0.41]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={config.hairColor} roughness={0.8} />
      </mesh>
      
      {/* Nose */}
      {renderNose()}
      
      {/* Mouth */}
      {renderMouth()}
      
      {/* Accessories */}
      {renderAccessories()}
      
      {/* Body and Clothing */}
      {renderClothing()}
      
      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.4, 0.8, 0.2]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.08, 0.06, 0.7, 16]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.6} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.4, 0.8, 0.2]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.06, 0.7, 16]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.6} />
      </mesh>
      
      {/* Hands */}
      <mesh ref={leftHandRef} position={[-0.1, 0.8, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.6} />
      </mesh>
      <mesh ref={rightHandRef} position={[0.1, 0.8, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={config.skinTone} roughness={0.6} />
      </mesh>
      
      {/* Feet */}
      <group>
        <mesh position={[-0.2, -0.7, 0.1]}>
          <boxGeometry args={[0.15, 0.05, 0.3]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[-0.2, -0.75, 0.1]}>
          <boxGeometry args={[0.15, 0.02, 0.3]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, -0.7, 0.1]}>
          <boxGeometry args={[0.15, 0.05, 0.3]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0.2, -0.75, 0.1]}>
          <boxGeometry args={[0.15, 0.02, 0.3]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

const AvatarRenderer: React.FC<AvatarRendererProps> = ({ 
  config, 
  isAnimating, 
  animationProgress, 
  className = "" 
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        <spotLight 
          position={[0, 10, 0]} 
          intensity={0.5} 
          angle={0.3} 
          penumbra={0.5}
          castShadow
        />
        
        <Avatar 
          config={config} 
          isAnimating={isAnimating} 
          animationProgress={animationProgress} 
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default AvatarRenderer;
