import MainScene from './scenes/MainScene';

/**
 * App — 应用入口
 *
 * 架构：
 * - 单一持续的 Three.js 场景
 * - 永不切换页面
 * - 所有交互在场景内完成
 */
function App() {
  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <MainScene />
    </div>
  );
}

export default App;
