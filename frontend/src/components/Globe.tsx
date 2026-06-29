import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ParticleData {
  lat: number;
  lng: number;
  size: number;
  opacity: number;
}

const PARTICLE_COUNT = 800;

function generateParticles(count: number): ParticleData[] {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      lat: Math.random() * 140 - 70,
      lng: Math.random() * 360 - 180,
      size: Math.random() * 2 + 0.3,
      opacity: Math.random() * 0.7 + 0.1,
    });
  }
  return particles;
}

interface RingData {
  lat: number;
  lng: number;
  maxAltitude: number;
}

function generateRings(): RingData[] {
  return [
    { lat: 0, lng: 0, maxAltitude: 0.12 },
    { lat: 23.5, lng: 0, maxAltitude: 0.08 },
    { lat: -23.5, lng: 0, maxAltitude: 0.08 },
  ];
}

function disposeThreeObject(obj: THREE.Object3D) {
  if (obj instanceof THREE.Mesh) {
    obj.geometry?.dispose();
    const mat = obj.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => m.dispose());
    } else if (mat) {
      mat.dispose();
    }
  }
  obj.children.forEach(disposeThreeObject);
}

interface GlobeProps {
  className?: string;
  mode?: 'landing' | 'main';
}

const Globe: React.FC<GlobeProps> = ({ className = '', mode = 'main' }) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<Record<string, unknown> | null>(null);
  const [GlobeGl, setGlobeGl] = useState<typeof import('react-globe.gl')['default'] | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [particles] = useState<ParticleData[]>(() => generateParticles(PARTICLE_COUNT));
  const [rings] = useState<RingData[]>(() => generateRings());

  // Dynamic import globe.gl
  useEffect(() => {
    let cancelled = false;
    const loadGlobe = async () => {
      try {
        const module = await import('react-globe.gl');
        if (!cancelled) {
          setGlobeGl(() => module.default);
        }
      } catch (err) {
        console.error('Failed to load react-globe.gl:', err);
      }
    };
    loadGlobe();
    return () => { cancelled = true; };
  }, []);

  // ResizeObserver for responsive dimensions
  useEffect(() => {
    const el = globeRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cleanup Three.js resources on unmount
  const cleanupGlobe = useCallback(() => {
    if (globeInstanceRef.current) {
      try {
        const globe = globeInstanceRef.current as {
          scene?: () => THREE.Scene;
          renderer?: () => THREE.WebGLRenderer;
        };
        if (typeof globe.scene === 'function') {
          const scene = globe.scene();
          scene.children.forEach(disposeThreeObject);
        }
        if (typeof globe.renderer === 'function') {
          globe.renderer().dispose();
        }
      } catch {
        // Globe may already be disposed
      }
      globeInstanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanupGlobe;
  }, [cleanupGlobe]);

  return (
    <div ref={globeRef} className={`w-full h-full bg-black ${className}`}>
      {GlobeGl && size.width > 0 && size.height > 0 && (
        <GlobeGl
          ref={(globe: unknown) => {
            if (globe && typeof globe === 'object') {
              globeInstanceRef.current = globe as Record<string, unknown>;
              const ctrl = (globe as { controls?: () => GlobeControls }).controls?.();
              if (ctrl) {
                ctrl.autoRotate = true;
                ctrl.autoRotateSpeed = mode === 'landing' ? 0.5 : 0.3;
                ctrl.enableZoom = mode === 'main';
              }
            }
          }}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0, 0, 0, 0)"
          backgroundImageUrl=""
          showAtmosphere
          atmosphereColor={mode === 'landing' ? '#ffffff' : '#22d3ee'}
          atmosphereAltitude={mode === 'landing' ? 0.25 : 0.18}
          showPoints
          showLabels={false}
          enablePointerInteraction={mode === 'main'}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          pointsData={particles}
          pointColor={() => '#22d3ee'}
          pointAltitude={0.06}
          pointRadius={0.4}
          ringsData={rings}
          ringColor={() => (t: number) => `rgba(34, 211, 238, ${0.3 * (1 - t)})`}
          ringMaxRadius={3}
          ringPropagationSpeed={2}
          ringRepeatPeriod={2000}
        />
      )}
    </div>
  );
};

interface GlobeControls {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableZoom: boolean;
}

export default Globe;
