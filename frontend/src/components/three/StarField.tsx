import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * StarField — 多层星空系统
 *
 * 6 层星空：
 * Layer 1: 20,000+ 微小星星（随机亮度/颜色/不透明度）
 * Layer 2: 3,000 中等星星
 * Layer 3: 300 明亮星星
 * Layer 4: 彩色星星（蓝/橙/红）
 * Layer 5: 星团
 * Layer 6: 银河纹理背景
 */

interface StarLayerProps {
  count: number;
  radius: number;
  size: number;
  color: THREE.Color;
  opacity: number;
  speed: number;
}

const StarLayer: React.FC<StarLayerProps> = ({
  count,
  radius,
  size,
  color,
  opacity,
  speed,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + Math.random() * 50;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Random color variation
      const colorVariation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = color.r * colorVariation;
      colors[i * 3 + 1] = color.g * colorVariation;
      colors[i * 3 + 2] = color.b * colorVariation;

      // Random size variation
      sizes[i] = size * (0.5 + Math.random() * 0.5);
    }

    return [positions, colors, sizes];
  }, [count, radius, size, color]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const StarField: React.FC = () => {
  return (
    <group>
      {/* Layer 1: Micro stars (background) */}
      <StarLayer
        count={20000}
        radius={500}
        size={0.5}
        color={new THREE.Color(0xffffff)}
        opacity={0.4}
        speed={0.0001}
      />

      {/* Layer 2: Medium stars */}
      <StarLayer
        count={3000}
        radius={450}
        size={1.2}
        color={new THREE.Color(0xffffff)}
        opacity={0.6}
        speed={0.0002}
      />

      {/* Layer 3: Bright stars */}
      <StarLayer
        count={300}
        radius={400}
        size={2.5}
        color={new THREE.Color(0xffffff)}
        opacity={0.9}
        speed={0.0003}
      />

      {/* Layer 4: Blue stars */}
      <StarLayer
        count={150}
        radius={420}
        size={2.0}
        color={new THREE.Color(0x88ccff)}
        opacity={0.8}
        speed={0.00025}
      />

      {/* Layer 5: Orange stars */}
      <StarLayer
        count={150}
        radius={430}
        size={2.0}
        color={new THREE.Color(0xffaa66)}
        opacity={0.8}
        speed={0.00028}
      />

      {/* Layer 6: Red stars */}
      <StarLayer
        count={100}
        radius={440}
        size={1.8}
        color={new THREE.Color(0xff6666)}
        opacity={0.7}
        speed={0.00022}
      />
    </group>
  );
};

export default StarField;
