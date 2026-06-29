import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing Page — 搜索中心入口
 *
 * 规范：frontend-spec.md § 4.1
 * - 全屏深色背景
 * - 居中搜索框 + 品牌标识
 * - 热门目的地芯片
 */
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const popularDestinations = [
    '东京', '巴黎', '纽约', '伦敦', '罗马', '悉尼'
  ];

  const handleSearch = (destination?: string) => {
    const query = destination || searchValue;
    if (query.trim()) {
      navigate('/app', { state: { destination: query } });
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Hero Area */}
      <div className="flex flex-col items-center">
        {/* Brand Wordmark */}
        <h1 className="text-4xl font-light tracking-wide text-white mb-2
                       animate-fadeUp"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          TravelAI
        </h1>

        {/* Tagline */}
        <p className="text-sm text-white/50 mb-8
                      animate-fadeUp"
           style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
          Plan every journey with AI
        </p>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Where do you want to go?"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-[480px] max-w-[90vw] h-12
                     bg-white/5 backdrop-blur-xl
                     border border-white/10 rounded-full
                     px-6 text-white placeholder-white/30 text-sm
                     outline-none focus:border-white/30
                     transition-colors
                     animate-fadeUp"
          style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
        />

        {/* Popular Destinations */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center
                        animate-fadeUp"
             style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
          {popularDestinations.map((dest, idx) => (
            <button
              key={dest}
              onClick={() => handleSearch(dest)}
              className="chip hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              style={{
                animationDelay: `${0.6 + idx * 0.05}s`,
                animationFillMode: 'backwards'
              }}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="fixed bottom-8 text-xs text-white/25 tracking-[0.3em] uppercase">
        AI-Powered Travel Platform
      </p>
    </div>
  );
};

export default Landing;
