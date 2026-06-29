import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import Globe from '../components/three/Globe';
import CameraController from '../components/three/CameraController';

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
    <div className="relative w-full h-full bg-black">
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
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Space Background */}
        <Stars
          radius={300}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Globe */}
        <Suspense fallback={null}>
          <Globe />
        </Suspense>

        {/* Camera Controller */}
        <CameraController />
      </Canvas>

      {/* Floating UI Layer (DOM) */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          AI Travel Explorer
        </h1>
      </div>
    </div>
  );
};

export default MainScene;
