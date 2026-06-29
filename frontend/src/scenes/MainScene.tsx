import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Globe from '../components/three/Globe';
import CameraController from '../components/three/CameraController';
import InteractionController from '../components/three/InteractionController';
import MarkerLayer from '../components/three/MarkerLayer';
import StarField from '../components/three/StarField';
import DeepSpaceElements from '../components/three/DeepSpaceElements';
import { sampleMarkers } from '../data/markers';

/**
 * MainScene — 持续的 Three.js 场景
 *
 * 架构：
 * - Deep Space Background (6-layer gradient)
 * - Multi-layer Star Field (6 layers, 24k+ stars)
 * - Deep Space Elements (Nebula, Dust, Meteors)
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
        {/* Camera - Cinematic 35mm focal length equivalent */}
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 12]}
          fov={50}
          near={0.1}
          far={2000}
        />

        {/* Lights - Realistic space lighting */}
        <ambientLight intensity={0.1} />
        <directionalLight
          position={[50, 20, 30]}
          intensity={2.5}
          color="#ffffff"
          castShadow={false}
        />
        <pointLight position={[-30, -20, -20]} intensity={0.3} color="#4488ff" />
        <hemisphereLight
          color="#ffffff"
          groundColor="#000033"
          intensity={0.5}
        />

        {/* Multi-layer Star Field (24k+ stars across 6 layers) */}
        <StarField />

        {/* Deep Space Elements (Nebula, Dust, Meteors) */}
        <DeepSpaceElements />

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

        {/* OrbitControls - Adjusted for larger globe */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={7}
          maxDistance={30}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
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
