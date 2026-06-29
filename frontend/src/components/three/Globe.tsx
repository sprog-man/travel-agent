import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

/**
 * Globe — 基于 react-three-fiber 的地球
 *
 * 特性：
 * - Earth 纹理（地表）
 * - Bump Map（地形）
 * - Specular Map（海洋反光）
 * - Atmosphere（大气层辉光）
 * - Clouds（云层）
 * - Auto Rotation
 */
const Globe: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load textures
  const earthTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
  );
  const bumpTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  );
  const cloudsTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  );

  // Rotation animation
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <group>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.01}
          specularMap={bumpTexture}
          specular={new THREE.Color(0x333333)}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef} scale={1.01}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color={0x4488ff}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

export default Globe;
