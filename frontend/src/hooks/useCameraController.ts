import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

/**
 * Camera 状态类型
 */
export type CameraMode = 'landing' | 'idle' | 'flyTo' | 'focus';

export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
  duration?: number; // 动画时长（秒）
}

/**
 * CameraController — 智能相机控制系统
 *
 * 支持：
 * - Landing Orbit（初始环绕）
 * - Fly To（飞向目标）
 * - Focus（聚焦国家/城市/POI）
 * - Smooth Easing（平滑缓动）
 * - Momentum（惯性）
 */
export const useCameraController = () => {
  const { camera } = useThree();
  const modeRef = useRef<CameraMode>('landing');
  const targetRef = useRef<CameraTarget | null>(null);
  const progressRef = useRef(0);

  // Landing Orbit: 自动环绕
  const startLandingOrbit = () => {
    modeRef.current = 'landing';
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  };

  // Fly To: 飞向目标
  const flyTo = (target: CameraTarget) => {
    modeRef.current = 'flyTo';
    targetRef.current = target;
    progressRef.current = 0;
  };

  // Focus: 聚焦特定点
  const focusOn = (position: [number, number, number], distance: number = 2) => {
    const target: CameraTarget = {
      position: [
        position[0] * distance,
        position[1] * distance,
        position[2] * distance,
      ],
      lookAt: position,
      duration: 1.5,
    };
    flyTo(target);
  };

  // Reset: 返回 idle 状态
  const reset = () => {
    flyTo({
      position: [0, 0, 5],
      lookAt: [0, 0, 0],
      duration: 1.2,
    });
  };

  // Animation Loop
  useFrame((state, delta) => {
    const mode = modeRef.current;

    if (mode === 'landing') {
      // Landing Orbit: 缓慢环绕
      const time = state.clock.getElapsedTime();
      const radius = 5;
      camera.position.x = Math.sin(time * 0.1) * radius;
      camera.position.z = Math.cos(time * 0.1) * radius;
      camera.position.y = Math.sin(time * 0.05) * 1;
      camera.lookAt(0, 0, 0);
    } else if (mode === 'flyTo' && targetRef.current) {
      // Fly To: 平滑飞行动画
      const target = targetRef.current;
      const duration = target.duration || 2;
      progressRef.current += delta / duration;

      if (progressRef.current >= 1) {
        // 动画完成
        camera.position.set(...target.position);
        camera.lookAt(...target.lookAt);
        modeRef.current = 'idle';
        progressRef.current = 0;
      } else {
        // Ease Out Cubic
        const t = 1 - Math.pow(1 - progressRef.current, 3);

        // Lerp position
        const startPos = new Vector3().copy(camera.position);
        const endPos = new Vector3(...target.position);
        camera.position.lerpVectors(startPos, endPos, t);

        // Slerp lookAt (smooth rotation)
        const currentLookAt = new Vector3();
        camera.getWorldDirection(currentLookAt);
        const targetLookAt = new Vector3(...target.lookAt).sub(camera.position).normalize();

        const lerpedDirection = new Vector3().lerpVectors(
          currentLookAt,
          targetLookAt,
          t
        );

        const lookAtPoint = new Vector3().copy(camera.position).add(lerpedDirection);
        camera.lookAt(lookAtPoint);
      }
    }
  });

  return {
    mode: modeRef.current,
    startLandingOrbit,
    flyTo,
    focusOn,
    reset,
  };
};
