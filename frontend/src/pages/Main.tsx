import React from 'react';
import Globe from '../components/Globe';
import ChatPanel from '../components/ChatPanel';

/**
 * Main Page — 地球为核心的探索界面
 *
 * 设计理念：
 * - 地球占据 70% 视觉面积（主角）
 * - ChatPanel 是 Glassmorphism 浮动面板（辅助）
 * - 不是分屏布局，而是层叠布局
 * - 参考：Google Earth、Apple Maps、Linear
 */
const Main: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Globe — 全屏背景（主角） */}
      <div className="absolute inset-0 z-0">
        <Globe mode="main" />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none
                      bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      {/* ChatPanel — Glassmorphism 浮动面板（右下角） */}
      <div className="absolute bottom-6 right-6 z-10 w-[420px] max-w-[90vw]">
        <ChatPanel />
      </div>

      {/* Top-left: Logo / Title */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-xl font-bold text-white tracking-tight
                       flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          AI Travel Explorer
        </h1>
      </div>

      {/* Top-right: Settings / Help (placeholder) */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <button
          className="w-10 h-10 rounded-full
                     border border-white/20 bg-white/5 backdrop-blur-md
                     hover:bg-white/10 hover:border-white/30
                     transition-all duration-300
                     flex items-center justify-center
                     text-white/70 hover:text-white"
          aria-label="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Main;
