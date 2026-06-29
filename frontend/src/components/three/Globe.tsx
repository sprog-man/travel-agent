import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

/**
 * Globe — 基于 react-three-fiber 的电影级地球
 *
 * 特性：
 * - PBR 材质（MeshPhysicalMaterial）
 * - 8K 纹理（来自 NASA/Solar System Scope）
 * - 真实海洋反射（Fresnel 效果）
 * - 独立云层（半透明）
 * - 夜晚城市灯光
 * - 真实大气散射
 * - 自动旋转
 */
const Globe: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load high-resolution textures (8K from Solar System Scope)
  const earthTexture = useLoader(
    TextureLoader,
    'https://www.solarsystemscope.com/textures/download/8k_earth_daymap.jpg'
  );
  const normalTexture = useLoader(
    TextureLoader,
    'https://www.solarsystemscope.com/textures/download/8k_earth_normal_map.jpg'
  );
  const specularTexture = useLoader(
    TextureLoader,
    'https://www.solarsystemscope.com/textures/download/8k_earth_specular_map.jpg'
  );
  const nightTexture = useLoader(
    TextureLoader,
    'https://www.solarsystemscope.com/textures/download/8k_earth_nightmap.jpg'
  );
  const cloudsTexture = useLoader(
    TextureLoader,
    'https://www.solarsystemscope.com/textures/download/8k_earth_clouds.jpg'
  );

  // Rotation animation (slower, more realistic)
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.025;
    }
  });

  return (
    <group>
      {/* Earth with PBR Material */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 128, 128]} />
        <meshPhysicalMaterial
          map={earthTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughnessMap={specularTexture}
          roughness={0.8}
          metalness={0.1}
          emissiveMap={nightTexture}
          emissive={new THREE.Color(0xffaa66)}
          emissiveIntensity={1.5}
          clearcoat={0.05}
          clearcoatRoughness={0.3}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Clouds Layer */}
      <mesh ref={cloudsRef} scale={1.005}>
        <sphereGeometry args={[5, 128, 128]} />
        <meshPhysicalMaterial
          map={cloudsTexture}
          transparent
          opacity={0.6}
          depthWrite={false}
          roughness={1.0}
          metalness={0}
          transmission={0.1}
        />
      </mesh>

      {/* Atmosphere Glow - Inner Layer (Rayleigh Scattering) */}
      <mesh scale={1.015}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color={0x88ccff}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere Glow - Outer Layer (Mie Scattering) */}
      <mesh ref={atmosphereRef} scale={1.03}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color={0x4488ff}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default Globe;
