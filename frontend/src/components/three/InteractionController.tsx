import { useRaycaster } from '../../hooks/useRaycaster';
import { useCameraController } from '../../hooks/useCameraController';

/**
 * InteractionController — 交互控制器（Canvas 内部逻辑）
 *
 * 职责：
 * - 处理地球点击事件
 * - 触发 Camera 飞行
 */
const InteractionController: React.FC = () => {
  const { focusOn } = useCameraController();

  // 处理点击
  useRaycaster({
    onHit: (hit) => {
      console.log(`Clicked: lat=${hit.lat.toFixed(2)}°, lng=${hit.lng.toFixed(2)}°`);

      // Camera 飞向点击位置
      const normalized = hit.point.clone().normalize();
      focusOn([normalized.x, normalized.y, normalized.z], 2.5);
    },
  });

  return null; // 纯逻辑组件，无渲染
};

export default InteractionController;
