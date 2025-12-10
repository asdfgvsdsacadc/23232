import * as THREE from 'three';

// --- Mobile Detection & Performance Config ---
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Reduce particle counts on mobile for performance
export const ITEM_COUNT = isMobile ? 900 : 2200;
export const RIBBON_SEGMENTS = isMobile ? 200 : 600;
export const HEART_PARTICLE_COUNT = isMobile ? 4000 : 15000;
export const STAR_COUNT = isMobile ? 800 : 2000;

export const TREE_HEIGHT = 14;
export const MAX_RADIUS = 5.5;

// --- Enums ---
export enum ParticleShape {
  Sphere = 'Sphere',
  Box = 'Box',
  Plane = 'Plane',
  Light = 'Light',
  Leaf = 'Leaf',
  Ribbon = 'Ribbon',
  Heart = 'Heart'
}

// --- Palettes ---
export const PALETTE = [
  '#FFD700', // Gold
  '#C41E3A', // Cardinal
  '#C0C0C0', // Silver
  '#FFFFFF', // White
  '#FF4500', // OrangeRed
];

export const GREEN_PALETTE = [
  '#006400', // DarkGreen
  '#228B22', // ForestGreen
  '#32CD32', // LimeGreen
  '#2E8B57', // SeaGreen
  '#008000', // Green
];

// --- Data ---
export interface Wish {
  id: number;
  title: string;
  text: string;
}

export const WISHES: Wish[] = [
  { id: 1, title: "Only You", text: "Under the mistletoe or the stars, my only wish is you." },
  { id: 2, title: "Guiding Light", text: "May your Christmas be as bright as the lights guiding me to you." },
  { id: 3, title: "The Gift", text: "The best gift this year isn't under the tree, it's holding your hand." },
  { id: 4, title: "Warmth", text: "Snowflakes melt, but my love for you warms the coldest winter night." },
  { id: 5, title: "Spark", text: "Every Christmas light reminds me of the spark in your eyes." },
  { id: 6, title: "Embrace", text: "Wrapped in your arms is the only place I want to be this holiday." },
  { id: 7, title: "Magic", text: "You are the magic that makes my Christmas sparkle." },
  { id: 8, title: "Frozen Time", text: "Wishing for a moment frozen in time, just you and me and the falling snow." },
  { id: 9, title: "Heartbeat", text: "My heart beats in rhythm with the Christmas bells, calling your name." },
  { id: 10, title: "Starlight", text: "Let's make a memory tonight that will outshine the brightest star." },
];

// --- Shader Data ---
export const HeartShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uAlpha: { value: 0 },
    uColor1: { value: new THREE.Color('#FF007F') },
    uColor2: { value: new THREE.Color('#FFC0CB') },
    uPixelRatio: { value: 1.0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uPixelRatio;

    attribute vec3 aTarget;
    attribute float aRandom;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float startAt = aRandom * 0.4;
      float duration = 0.6;
      float t = smoothstep(startAt, startAt + duration, uProgress);

      vec3 noise = vec3(
         sin(uTime * 5.0 + position.x) * 0.2 * (1.0 - t),
         cos(uTime * 5.0 + position.y) * 0.2 * (1.0 - t),
         0.0
      );
      
      vec3 pos = mix(position, aTarget, t) + noise;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float scale = mix(0.0, 1.0, t);
      // Scale point size by pixel ratio for consistent look across devices
      gl_PointSize = (6.0 * aRandom + 2.0) * scale * (1.0 / -mvPosition.z) * uPixelRatio;

      vColor = mix(uColor1, uColor2, aRandom);
      vAlpha = t; 
    }
  `,
  fragmentShader: `
    uniform float uAlpha;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 xy = gl_PointCoord.xy - 0.5;
      float dist = length(xy);
      if (dist > 0.5) discard;

      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 1.5);

      vec3 hdrColor = vColor * 6.0;

      gl_FragColor = vec4(hdrColor, strength * uAlpha * vAlpha);
    }
  `
};