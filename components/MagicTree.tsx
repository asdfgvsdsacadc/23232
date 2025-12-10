import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { 
  ITEM_COUNT, 
  MAX_RADIUS, 
  TREE_HEIGHT, 
  RIBBON_SEGMENTS, 
  ParticleShape, 
  GREEN_PALETTE, 
  PALETTE,
  isMobile 
} from '../constants';
import { HeartParticles } from './HeartParticles';

interface MagicTreeProps {
  isExploded: boolean;
}

export const MagicTree: React.FC<MagicTreeProps> = ({ isExploded }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Increase particle size slightly on mobile for better visibility
  const sizeMultiplier = isMobile ? 1.6 : 1.0;

  // Pre-calculate all particle positions and attributes
  const particles = useMemo(() => {
    const data = [];
    let idCounter = 0;

    // 1. Generate Tree Particles
    for (let i = 0; i < ITEM_COUNT; i++) {
      const t = i / ITEM_COUNT;
      const angle = t * Math.PI * 50 + (Math.random() * 0.5); 
      const radius = (1 - t) * MAX_RADIUS;
      const randomOffset = 0.8; 
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * randomOffset;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * randomOffset;
      const y = (t * TREE_HEIGHT) - (TREE_HEIGHT / 2);

      const initialPos = new THREE.Vector3(x, y, z);
      const rand = Math.random();
      let shape, color, scaleVec;

      // Determine shape type based on probability
      if (rand < 0.65) {
        shape = ParticleShape.Leaf;
        color = GREEN_PALETTE[Math.floor(Math.random() * GREEN_PALETTE.length)];
        const s = (0.2 + Math.random() * 0.3) * sizeMultiplier; 
        scaleVec = new THREE.Vector3(s, s, s);
      } else if (rand < 0.80) {
        shape = ParticleShape.Light;
        const lightColors = ['#fffec4', '#ffeb3b', '#ff9800', '#ffffff'];
        color = lightColors[Math.floor(Math.random() * lightColors.length)];
        const s = (0.15 + Math.random() * 0.15) * sizeMultiplier; 
        scaleVec = new THREE.Vector3(s, s, s);
      } else {
        const geometryShapes = [ParticleShape.Sphere, ParticleShape.Box];
        shape = geometryShapes[Math.floor(Math.random() * geometryShapes.length)];
        color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const s = (0.2 + Math.random() * 0.3) * sizeMultiplier; 
        scaleVec = new THREE.Vector3(s, s, s);
      }
      
      // Calculate exploded position (random sphere distribution)
      const explodeRadius = 25 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const ex = explodeRadius * Math.sin(phi) * Math.cos(theta);
      const ey = explodeRadius * Math.sin(phi) * Math.sin(theta);
      const ez = explodeRadius * Math.cos(phi);
      const explodedPos = new THREE.Vector3(ex, ey, ez);
      const rotation = new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

      data.push({ id: idCounter++, shape, color, initialPos, explodedPos, rotation, scale: scaleVec });
    }

    // 2. Generate Ribbon Particles
    const ribbons = 2;
    for (let r = 0; r < ribbons; r++) {
       const offsetPhase = (r * Math.PI); 
       for (let i = 0; i < RIBBON_SEGMENTS / ribbons; i++) {
          const t = i / (RIBBON_SEGMENTS / ribbons);
          const angle = (t * Math.PI * 12) + offsetPhase; 
          const radius = ((1 - t) * MAX_RADIUS) + 0.6; 
          const y = (t * TREE_HEIGHT) - (TREE_HEIGHT / 2);
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const initialPos = new THREE.Vector3(x, y, z);
          const explodeRadius = 30;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const explodedPos = new THREE.Vector3(
              explodeRadius * Math.sin(phi) * Math.cos(theta),
              explodeRadius * Math.sin(phi) * Math.sin(theta),
              explodeRadius * Math.cos(phi)
          );
          
          // Orient ribbon pieces to face direction of spiral
          const nextAngle = ((t + 0.01) * Math.PI * 12) + offsetPhase;
          const nextRadius = ((1 - (t + 0.01)) * MAX_RADIUS) + 0.6;
          const nextY = ((t + 0.01) * TREE_HEIGHT) - (TREE_HEIGHT / 2);
          const dummyObj = new THREE.Object3D();
          dummyObj.position.copy(initialPos);
          dummyObj.lookAt(new THREE.Vector3(Math.cos(nextAngle)*nextRadius, nextY, Math.sin(nextAngle)*nextRadius));

          data.push({
            id: idCounter++,
            shape: ParticleShape.Ribbon,
            color: r === 0 ? '#FFD700' : '#C41E3A',
            initialPos,
            explodedPos,
            rotation: dummyObj.rotation.clone(),
            scale: new THREE.Vector3(0.15, 0.6, 1)
          });
       }
    }
    return data;
  }, [sizeMultiplier]);

  // Animate particles when state changes
  useLayoutEffect(() => {
    if (!meshRefs.current) return;
    
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];

      gsap.killTweensOf(mesh.position);
      gsap.killTweensOf(mesh.rotation);
      gsap.killTweensOf(mesh.scale);

      if (isExploded) {
        // Explosion Animation
        gsap.to(mesh.position, {
          x: p.explodedPos.x,
          y: p.explodedPos.y,
          z: p.explodedPos.z,
          duration: 1.2 + Math.random() * 0.8,
          ease: "expo.out",
        });
        gsap.to(mesh.rotation, {
          x: p.rotation.x + Math.random() * 5,
          y: p.rotation.y + Math.random() * 5,
          z: p.rotation.z + Math.random() * 5,
          duration: 2.5,
          ease: "none"
        });
        if (p.shape === ParticleShape.Ribbon) {
           gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.out" });
        }
      } else {
        // Reconstruction Animation
        gsap.to(mesh.position, {
          x: p.initialPos.x,
          y: p.initialPos.y,
          z: p.initialPos.z,
          duration: 2.2 + Math.random() * 0.4,
          ease: "expo.out", 
          delay: Math.random() * 0.15 
        });
        gsap.to(mesh.rotation, {
          x: p.rotation.x,
          y: p.rotation.y,
          z: p.rotation.z,
          duration: 2.0,
          ease: "expo.out"
        });
         if (p.shape === ParticleShape.Ribbon) {
           gsap.to(mesh.scale, { 
             x: p.scale.x, 
             y: p.scale.y, 
             z: p.scale.z, 
             duration: 2.0,
             ease: "expo.out"
           });
        }
      }
    });
  }, [isExploded, particles]);

  // Continuous rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
        const speed = isExploded ? 0.01 : 0.15;
        groupRef.current.rotation.y += delta * speed;
    }
  });

  // Reusable geometries
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const leafGeo = useMemo(() => new THREE.TetrahedronGeometry(1, 0), []);
  const ribbonGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const octGeo = useMemo(() => new THREE.OctahedronGeometry(0.7, 0), []);

  useEffect(() => {
    return () => {
        sphereGeo.dispose();
        boxGeo.dispose();
        leafGeo.dispose();
        ribbonGeo.dispose();
        octGeo.dispose();
    };
  }, [sphereGeo, boxGeo, leafGeo, ribbonGeo, octGeo]);

  return (
    <group>
        <group ref={groupRef}>
            {/* Top Star/Diamond */}
            <mesh position={[0, TREE_HEIGHT / 2 + 0.5, 0]} geometry={octGeo}>
                <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFD700" 
                    emissiveIntensity={isExploded ? 0 : 4} 
                    toneMapped={false} 
                />
            </mesh>

            {/* Tree Particles */}
            {particles.map((p, i) => {
                let geometry;
                let material;

                if (p.shape === ParticleShape.Light) {
                    return (
                        <mesh
                            key={p.id}
                            ref={(el) => (meshRefs.current[i] = el)}
                            position={p.initialPos}
                            scale={[p.scale.x, p.scale.y, p.scale.z]}
                            geometry={sphereGeo}
                        >
                            <meshStandardMaterial 
                                color={p.color} 
                                emissive={p.color} 
                                emissiveIntensity={3.0} 
                                toneMapped={false} 
                            />
                        </mesh>
                    );
                }

                if (p.shape === ParticleShape.Leaf) {
                    geometry = leafGeo;
                    material = <meshStandardMaterial color={p.color} roughness={0.6} metalness={0.1} />;
                } else if (p.shape === ParticleShape.Ribbon) {
                    geometry = ribbonGeo;
                    material = <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.5} roughness={0.2} metalness={0.9} side={THREE.DoubleSide} />;
                } else if (p.shape === ParticleShape.Box) {
                    geometry = boxGeo;
                    material = <meshStandardMaterial color={p.color} roughness={0.2} metalness={0.8} />;
                } else {
                    geometry = sphereGeo;
                    material = <meshStandardMaterial color={p.color} roughness={0.2} metalness={0.8} />;
                }

                return (
                    <mesh
                        key={p.id}
                        ref={(el) => (meshRefs.current[i] = el)}
                        position={p.initialPos}
                        rotation={p.rotation}
                        scale={[p.scale.x, p.scale.y, p.scale.z]}
                        geometry={geometry}
                    >
                        {material}
                    </mesh>
                );
            })}
        </group>
        {/* Heart shaped particles for the explosion effect */}
        <HeartParticles isVisible={isExploded} />
    </group>
  );
};