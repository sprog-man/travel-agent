import React, { useRef, useEffect, useState } from 'react';

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

const Globe: React.FC = () => {
  const globeRef = useRef<HTMLDivElement>(null);
  const [GlobeGl, setGlobeGl] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [particles] = useState<ParticleData[]>(() => generateParticles(PARTICLE_COUNT));
  const [rings] = useState<RingData[]>(() => generateRings());

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

  useEffect(() => {
    if (GlobeGl && globeRef.current) {
      setReady(true);
    }
  }, [GlobeGl]);

  return (
    <div ref={globeRef} className="w-full h-full bg-black">
      {ready && GlobeGl && globeRef.current && (
        <GlobeGl
          ref={(globe: any) => {
            if (globe) {
              globe.controls().autoRotate = true;
              globe.controls().autoRotateSpeed = 0.3;
              globe.controls().enableZoom = false;
            }
          }}
          width={globeRef.current.clientWidth}
          height={globeRef.current.clientHeight}
          backgroundColor="rgba(0, 0, 0, 0)"
          backgroundImageUrl=""
          showAtmosphere
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.18}
          showPoints={true}
          showGlow={true}
          glowColor="#22d3ee"
          showLabels={false}
          enablePointerInteraction={false}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
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

export default Globe;
