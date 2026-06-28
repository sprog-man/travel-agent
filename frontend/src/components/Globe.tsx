import React, { useRef, useEffect, useState } from 'react';

interface ParticleData {
  lat: number;
  lng: number;
  size: number;
  opacity: number;
  color: [number, number, number];
}

const PARTICLE_COUNT = 600;

function generateParticles(count: number): ParticleData[] {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      lat: Math.random() * 140 - 70,
      lng: Math.random() * 360 - 180,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: [
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
      ],
    });
  }
  return particles;
}

const Globe: React.FC = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const [GlobeGl, setGlobeGl] = useState<any>(null);
  const [particles] = useState<ParticleData[]>(() => generateParticles(PARTICLE_COUNT));
  const [atmosphereColor] = useState<string>(() => {
    const r = Math.floor(Math.random() * 20 + 30);
    const g = Math.floor(Math.random() * 20 + 40);
    const b = Math.floor(Math.random() * 40 + 80);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  });

  // Dynamically import globe.gl
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
    return () => {
      cancelled = true;
    };
  }, []);

  if (!GlobeGl || !globeRef.current) {
    return (
      <div
        ref={globeRef}
        className="w-full h-full bg-black"
        aria-label="3D 地球加载场景中"
      />
    );
  }

  return (
    <div ref={globeRef} className="w-full h-full bg-black">
      <GlobeGl
        width={globeRef.current.clientWidth}
        height={globeRef.current.clientHeight}
        backgroundColor="rgba(0, 0, 0, 0)"
        backgroundImageUrl=""
        showAtmosphere
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={0.15}
        showPoints={true}
        showGlow={false}
        showLabels={false}
        enablePointerInteraction={true}
        enableZoom={true}
        zoom={2.5}
        rotateSpeed={0.4}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={particles}
        pointColor={() => '#60a5fa'}
        pointAltitude={0.08}
        pointRadius={0.5}
      />
    </div>
  );
};

export default Globe;
