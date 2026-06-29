import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import Globe from '../components/three/Globe';
import CameraController from '../components/three/CameraController';
import InteractionController from '../components/three/InteractionController';
import MarkerLayer from '../components/three/MarkerLayer';
import { sampleMarkers } from '../data/markers';

/**
 * MainScene — 持续的 Three.js 场景
 *
 * 架构：
 * - Space Background
 * - Star Layer
 * - Globe (Earth + Atmosphere + Clouds)
 * - Camera Controller
 * - Floating UI Layer (DOM overlay)
 *
 * 永不切换页面，所有交互在一个场景内完成
 */
const MainScene: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-[#0a0a1f]">
      {/* Deep Space Background with Nebula Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a3f] via-[#0f0f2e] to-[#050510]" />
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />

      {/* Three.js Canvas */}
      <Canvas className="w-full h-full">
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 5]}
          fov={45}
          near={0.1}
          far={1000}
        />

        {/* Lights */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#6688ff" />
        <pointLight position={[5, -5, -10]} intensity={0.4} color="#ff88ff" />

        {/* Dense Star Field */}
        <Stars
          radius={300}
          depth={60}
          count={15000}
          factor={4}
          saturation={0.3}
          fade
          speed={0.5}
        />

        {/* Globe */}
        <Suspense fallback={null}>
          <Globe />
          <MarkerLayer
            markers={sampleMarkers}
            onMarkerClick={(marker) => {
              console.log('Marker clicked:', marker.name);
            }}
          />
        </Suspense>

        {/* Interaction & Camera Controllers */}
        <InteractionController />
        <CameraController />
      </Canvas>

      {/* Floating UI Layer (DOM) */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 drop-shadow-lg">
          <span className="text-2xl">🌍</span>
          AI Travel Explorer
        </h1>
      </div>
    </div>
  );
};

export default MainScene;
