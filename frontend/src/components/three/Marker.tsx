import React, { useMemo } from 'react';
import * as THREE from 'three';

export interface MarkerData {
  id: string;
  type: 'country' | 'city' | 'poi';
  name: string;
  lat: number;
  lng: number;
  color?: string;
  size?: number;
}

interface MarkerProps {
  data: MarkerData;
  onClick?: (marker: MarkerData) => void;
}

/**
 * Marker — 地球表面标记点
 *
 * 特性：
 * - 经纬度 → 3D 坐标转换
 * - 发光效果
 * - 点击交互
 */
const Marker: React.FC<MarkerProps> = ({ data, onClick }) => {
  // 经纬度转 3D 坐标
  const position = useMemo(() => {
    const phi = (90 - data.lat) * (Math.PI / 180);
    const theta = (data.lng + 180) * (Math.PI / 180);
    const radius = 1.01; // 略高于地球表面

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  }, [data.lat, data.lng]);

  const color = data.color || '#ff6b6b';
  const size = data.size || 0.02;

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(data);
      }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />

      {/* 发光外圈 */}
      <mesh scale={1.5}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
};

export default Marker;
