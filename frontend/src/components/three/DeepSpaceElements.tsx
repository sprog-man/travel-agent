import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DeepSpaceElements — 深空元素
 *
 * 包含：
 * - HDR 星云纹理
 * - 太空尘埃粒子
 * - 体积雾效果
 * - 随机流星（8-45秒间隔）
 */

// Nebula Background
const Nebula: React.FC = () => {
  const nebulaRef = useRef<THREE.Mesh>(null);

  // Use procedural nebula texture (no external dependency)
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Create nebula gradient
    const gradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)'); // Purple center
    gradient.addColorStop(0.3, 'rgba(75, 0, 130, 0.2)'); // Indigo
    gradient.addColorStop(0.6, 'rgba(25, 25, 112, 0.1)'); // Midnight blue
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 2048);

    // Add star dust
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const radius = Math.random() * 2;
      const alpha = Math.random() * 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z = clock.getElapsedTime() * 0.00005;
    }
  });

  return (
    <mesh ref={nebulaRef} position={[0, 0, -800]}>
      <planeGeometry args={[1500, 1500]} />
      <meshBasicMaterial
        map={nebulaTexture}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// Space Dust Particles
const SpaceDust: React.FC = () => {
  const dustRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random box distribution
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

      sizes[i] = Math.random() * 0.5;
    }

    return [positions, sizes];
  }, []);

  useFrame(({ clock }) => {
    if (dustRef.current) {
      dustRef.current.rotation.y = clock.getElapsedTime() * 0.00008;
      dustRef.current.rotation.x = clock.getElapsedTime() * 0.00005;
    }
  });

  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color={0x8888aa}
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Meteor
interface MeteorProps {
  onComplete: () => void;
}

const Meteor: React.FC<MeteorProps> = ({ onComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const trailPositions = useRef<THREE.Vector3[]>([]);

  const startPos = useMemo(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    return new THREE.Vector3(
      Math.cos(angle) * distance,
      (Math.random() - 0.5) * 50,
      Math.sin(angle) * distance
    );
  }, []);

  const velocity = useMemo(() => {
    const speed = 0.8 + Math.random() * 0.4;
    const direction = new THREE.Vector3()
      .subVectors(new THREE.Vector3(0, 0, 0), startPos)
      .normalize()
      .multiplyScalar(speed);
    return direction;
  }, [startPos]);

  const currentPos = useRef(startPos.clone());

  useFrame(() => {
    if (groupRef.current) {
      currentPos.current.add(velocity);
      groupRef.current.position.copy(currentPos.current);

      // Update trail positions
      trailPositions.current.unshift(currentPos.current.clone());
      if (trailPositions.current.length > 15) {
        trailPositions.current.pop();
      }

      // Remove when out of view
      if (currentPos.current.length() < 10) {
        onComplete();
      }
    }
  });

  return (
    <group ref={groupRef} position={startPos}>
      {/* Meteor head */}
      <mesh>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial
          color={0xffffdd}
          transparent
          opacity={1.0}
        />
      </mesh>

      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial
          color={0xffaa66}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

// Meteor System
const MeteorSystem: React.FC = () => {
  const [meteors, setMeteors] = useState<number[]>([]);

  useEffect(() => {
    const spawnMeteor = () => {
      const newMeteor = Date.now();
      setMeteors((prev) => [...prev, newMeteor]);

      // Schedule next meteor (8-45 seconds)
      const delay = 8000 + Math.random() * 37000;
      setTimeout(spawnMeteor, delay);
    };

    // First meteor after 10 seconds
    const timer = setTimeout(spawnMeteor, 10000);

    return () => clearTimeout(timer);
  }, []);

  const removeMeteor = (id: number) => {
    setMeteors((prev) => prev.filter((m) => m !== id));
  };

  return (
    <>
      {meteors.map((id) => (
        <Meteor key={id} onComplete={() => removeMeteor(id)} />
      ))}
    </>
  );
};

// Main Component
const DeepSpaceElements: React.FC = () => {
  return (
    <group>
      <Nebula />
      <SpaceDust />
      <MeteorSystem />
    </group>
  );
};

export default DeepSpaceElements;
