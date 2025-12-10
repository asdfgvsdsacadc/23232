import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { StarField } from './components/StarField';
import { MagicTree } from './components/MagicTree';
import { OverlayUI } from './components/OverlayUI';
import { WISHES, isMobile } from './constants';

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [selectedWishIndex, setSelectedWishIndex] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);

  const toggleExplosion = () => {
    setIsExploded((prev) => !prev);
  };

  const handleWishChange = (direction: 'next' | 'prev') => {
    setTextOpacity(0);
    setTimeout(() => {
      setSelectedWishIndex((prev) => {
        if (direction === 'next') {
          return (prev + 1) % WISHES.length;
        } else {
          return (prev - 1 + WISHES.length) % WISHES.length;
        }
      });
      setTextOpacity(1);
    }, 400); 
  };

  // Adjust camera and bloom based on device to ensure mobile performance
  const camPos: [number, number, number] = isMobile ? [0, 2, 18] : [0, 2, 14];
  const bloomThreshold = isMobile ? 0.9 : 1.1;
  const bloomIntensity = isMobile ? 1.5 : 1.8;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans select-none no-select">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: camPos, fov: 60 }}
          dpr={[1, 2]} // Cap DPR at 2 for mobile performance
          gl={{ 
            antialias: false,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance"
          }} 
        >
          <Suspense fallback={null}>
            <color attach="background" args={['#020202']} />
            
            <OrbitControls 
              enablePan={false}
              enableDamping={true}
              dampingFactor={0.05}
              minDistance={5}
              maxDistance={35}
              makeDefault
            />

            <ambientLight intensity={0.2} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.5}
              penumbra={1}
              intensity={50}
              castShadow
            />
            <pointLight position={[-10, -5, -10]} intensity={20} color="#004400" />
            
            <Environment preset="night" />

            <StarField />
            <MagicTree isExploded={isExploded} />
            
            <ContactShadows 
              opacity={0.5} 
              scale={20} 
              blur={2.5} 
              far={10} 
              resolution={256} 
              color="#000000" 
            />

            <EffectComposer disableNormalPass>
              <Bloom 
                  luminanceThreshold={bloomThreshold} 
                  mipmapBlur 
                  intensity={bloomIntensity} 
                  radius={0.7}
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* UI Layer */}
      <OverlayUI 
        isExploded={isExploded}
        selectedWishIndex={selectedWishIndex}
        textOpacity={textOpacity}
        onToggleExplosion={toggleExplosion}
        onWishChange={handleWishChange}
      />
    </div>
  );
};

export default App;