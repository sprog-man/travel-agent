import React, { useCallback } from 'react';
import Globe from '../components/Globe';

interface LandingProps {
  onExplore: () => void;
}

const Landing: React.FC<LandingProps> = ({ onExplore }) => {
  const handleExplore = useCallback(() => {
    onExplore();
  }, [onExplore]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Globe />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-wide drop-shadow-lg">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            智能旅行攻略助手
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-12 max-w-lg leading-relaxed drop-shadow-md">
          探索世界，从一次对话开始
        </p>

        {/* CTA Button */}
        <button
          onClick={handleExplore}
          className="pointer-events-auto group relative px-10 py-4 rounded-full text-white font-semibold text-lg
                     bg-gradient-to-r from-blue-600 to-cyan-500
                     hover:from-blue-500 hover:to-cyan-400
                     focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black
                     transition-all duration-300 ease-in-out
                     transform hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]
                     active:scale-95
                     shadow-lg"
          aria-label="开始探索旅行攻略"
        >
          <span className="relative z-10 flex items-center gap-2">
            开始探索
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
          {/* Glow effect */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
        </button>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
        <p className="text-xs text-gray-500 animate-pulse">
          拖拽地球探索世界 · 点击按钮开始你的旅程
        </p>
      </div>
    </div>
  );
};

export default Landing;
