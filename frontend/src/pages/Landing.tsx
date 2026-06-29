import React from 'react';
import Globe from '../components/Globe';

interface LandingProps {
  onExplore: () => void;
}

/**
 * Landing Page — 极简单屏设计
 *
 * 设计理念：
 * - 全屏宇宙背景
 * - 中央：高质量 3D 地球缓慢自转（主角）
 * - 极简文案：标题 + 副标题 + 唯一按钮
 * - 没有导航栏、没有复杂 UI、没有滚动
 * - 参考：Apple 发布会、Google Earth 启动页
 */
const Landing: React.FC<LandingProps> = ({ onExplore }) => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Full-screen Globe — 主角 */}
      <div className="absolute inset-0 z-0">
        <Globe mode="landing" />
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none
                      bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Content — 居中悬浮 */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

        {/* Main Title */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white mb-4
                       tracking-tight leading-none text-center
                       animate-fadeUp"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
          Explore the World
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 text-center max-w-2xl
                      tracking-wide animate-fadeUp"
           style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
          Plan Every Journey with AI
        </p>

        {/* CTA Button — 唯一的交互元素 */}
        <button
          onClick={onExplore}
          className="group relative px-12 py-5 rounded-full
                     text-white font-bold text-lg tracking-wide
                     border-2 border-white/20 bg-white/5
                     backdrop-blur-md
                     hover:border-white/40 hover:bg-white/10
                     transition-all duration-500
                     hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]
                     active:scale-95
                     animate-fadeUp"
          style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
          aria-label="Start exploring the world"
        >
          <span className="flex items-center gap-3">
            Start Exploring
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        {/* Subtle hint */}
        <p className="absolute bottom-8 text-xs text-gray-600 tracking-[0.3em] uppercase
                      animate-pulse">
          AI-Powered Travel Platform
        </p>
      </div>
    </div>
  );
};

export default Landing;
