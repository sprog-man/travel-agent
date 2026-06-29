import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface RaycastHit {
  point: THREE.Vector3;
  lat: number;
  lng: number;
}

export interface UseRaycasterOptions {
  onHit?: (hit: RaycastHit) => void;
  target?: THREE.Object3D;
}

/**
 * useRaycaster — 地球表面点击检测
 *
 * 功能：
 * - 鼠标点击 → Raycaster 检测
 * - 3D 坐标 → 经纬度转换
 * - 触发回调事件
 */
export const useRaycaster = (options: UseRaycasterOptions = {}) => {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // 归一化鼠标坐标 (-1 to +1)
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 更新射线
      raycaster.current.setFromCamera(mouse.current, camera);

      // 查找目标（默认场景中所有物体）
      const targets = options.target ? [options.target] : scene.children;
      const intersects = raycaster.current.intersectObjects(targets, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const point = hit.point;

        // 3D 坐标转经纬度
        const lat = Math.asin(point.y / point.length()) * (180 / Math.PI);
        const lng = Math.atan2(point.x, point.z) * (180 / Math.PI);

        options.onHit?.({
          point,
          lat,
          lng,
        });
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, gl, scene, options]);

  return raycaster.current;
};
