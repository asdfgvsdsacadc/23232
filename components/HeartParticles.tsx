import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { HEART_PARTICLE_COUNT, HeartShaderMaterial } from '../constants';

interface HeartParticlesProps {
  isVisible: boolean;
}

export const HeartParticles: React.FC<HeartParticlesProps> = ({ isVisible }) => {
  const pointsRef = useRef<THREE.Points>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, targets, randoms } = useMemo(() => {
    const posArray = new Float32Array(HEART_PARTICLE_COUNT * 3);
    const targetArray = new Float32Array(HEART_PARTICLE_COUNT * 3);
    const randomArray = new Float32Array(HEART_PARTICLE_COUNT);

    let i = 0;
    while (i < HEART_PARTICLE_COUNT) {
      // Create a 3D heart shape mathematically
      const range = 1.3;
      const x = (Math.random() - 0.5) * 2 * range;
      const y = (Math.random() - 0.5) * 2 * range;
      const z = (Math.random() - 0.5) * 2 * range;
      
      // Heart formula approximation
      const a = x*x + (9/4)*(y*y) + z*z - 1;
      const term2 = x*x*z*z*z;
      const term3 = (9/80)*y*y*z*z*z;
      
      if (a*a*a - term2 - term3 < 0) {
        const s = 3.5;
        // Map Y to Z in 3D space for upright heart, Z to Y for depth
        targetArray[i * 3] = x * s;         // X
        targetArray[i * 3 + 1] = z * s + 2; // Y (Height)
        targetArray[i * 3 + 2] = y * s;     // Z (Depth)
        
        // Start from center
        posArray[i * 3] = 0; 
        posArray[i * 3 + 1] = 0;
        posArray[i * 3 + 2] = 0;

        randomArray[i] = Math.random();
        i++;
      }
    }
    return { positions: posArray, targets: targetArray, randoms: randomArray };
  }, []);

  useEffect(() => {
    if (materialRef.current) {
       // Adjust point size based on device pixel ratio for sharp rendering on mobile
       materialRef.current.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
  }, []);

  useLayoutEffect(() => {
    if (!materialRef.current) return;

    if (isVisible) {
      gsap.killTweensOf(materialRef.current.uniforms.uProgress);
      gsap.killTweensOf(materialRef.current.uniforms.uAlpha);
      
      gsap.to(materialRef.current.uniforms.uProgress, {
        value: 1,
        duration: 3.0,
        ease: "power2.out"
      });
      gsap.to(materialRef.current.uniforms.uAlpha, {
        value: 1,
        duration: 1.5,
        delay: 0.1,
        ease: "power1.out"
      });
    } else {
      gsap.killTweensOf(materialRef.current.uniforms.uProgress);
      gsap.killTweensOf(materialRef.current.uniforms.uAlpha);

      gsap.to(materialRef.current.uniforms.uProgress, {
        value: 0,
        duration: 1.2,
        ease: "power2.in"
      });
      gsap.to(materialRef.current.uniforms.uAlpha, {
        value: 0,
        duration: 0.5,
        ease: "power1.out"
      });
    }
  }, [isVisible]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (pointsRef.current && isVisible) {
        // Slow rotation when visible
        pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTarget"
          count={targets.length / 3}
          array={targets}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[HeartShaderMaterial]}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};