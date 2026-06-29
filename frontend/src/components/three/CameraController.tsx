import { useEffect } from 'react';
import { useCameraController } from '../../hooks/useCameraController';

/**
 * CameraController — Camera 控制器组件
 *
 * 负责：
 * - Landing Orbit 自动环绕
 * - 响应外部控制命令
 * - 平滑动画过渡
 */
const CameraController: React.FC = () => {
  const { startLandingOrbit } = useCameraController();

  useEffect(() => {
    // 启动时进入 Landing Orbit 模式
    startLandingOrbit();
  }, [startLandingOrbit]);

  return null; // 纯逻辑组件，无 UI
};

export default CameraController;
