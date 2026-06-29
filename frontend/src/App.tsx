import { useState, useCallback } from 'react';
import Landing from './pages/Landing';
import Main from './pages/Main';

/**
 * App — 全局状态管理 + 页面切换
 *
 * 设计要求：
 * - Landing → Main 不应该"切换页面"
 * - 应该是 Camera 飞向地球的动画（2-3秒）
 * - UI 逐渐浮现
 *
 * 当前实现：
 * - 使用 CSS transform 模拟 Camera 推进效果
 * - showLanding 和 showMain 同时为 true 时，Landing 缩放+淡出，Main 淡入
 */
function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showMain, setShowMain] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleExplore = useCallback(() => {
    setTransitioning(true);
    setShowMain(true);

    // 2.5 秒后完全隐藏 Landing
    setTimeout(() => {
      setShowLanding(false);
      setTransitioning(false);
    }, 2500);
  }, []);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {/* Landing Page — Camera 推进效果 */}
      {showLanding && (
        <div
          className="absolute inset-0 z-20 transition-all duration-[2500ms] ease-in-out"
          style={{
            transform: transitioning ? 'scale(2.5)' : 'scale(1)',
            opacity: transitioning ? 0 : 1,
            pointerEvents: transitioning ? 'none' : 'auto',
          }}
        >
          <Landing onExplore={handleExplore} />
        </div>
      )}

      {/* Main Page — UI 逐渐浮现 */}
      {showMain && (
        <div
          className="absolute inset-0 z-10 transition-opacity duration-[1500ms] ease-in-out"
          style={{
            opacity: transitioning ? 0 : 1,
            transitionDelay: transitioning ? '1000ms' : '0ms',
          }}
        >
          <Main />
        </div>
      )}
    </div>
  );
}

export default App;
