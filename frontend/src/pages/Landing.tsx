import React, { useEffect, useRef } from 'react';
import Globe from '../components/Globe';
import CustomCursor from '../components/CustomCursor';

interface LandingProps {
  onExplore: () => void;
}

const FEATURES = [
  {
    icon: '🌍',
    title: '智能探索',
    desc: '3D 地球交互，点击任意目的地，AI 自动获取天气、景点、攻略信息',
  },
  {
    icon: '💬',
    title: '对话规划',
    desc: '多轮对话理解你的偏好，智能编排个性化行程方案',
  },
  {
    icon: '📋',
    title: '一键导出',
    desc: '行程确认后即时生成 Markdown / PDF 行程单，随时查阅',
  },
] as const;

type StaggerDelay = 'stagger-1' | 'stagger-2' | 'stagger-3';

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  delay: StaggerDelay;
}

const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, delay }) => (
  <div
    className={`scroll-reveal ${delay} group relative p-8 rounded-2xl border border-white/10
                 bg-white/[0.03] backdrop-blur-sm
                 hover:border-cyan-400/30 hover:bg-white/[0.06]
                 transition-all duration-500 hover:-translate-y-2`}
  >
    <div className="text-4xl mb-5">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
         style={{ boxShadow: '0 0 30px rgba(34,211,238,0.08)' }} />
  </div>
);

const Landing: React.FC<LandingProps> = ({ onExplore }) => {
  const scrollRef = useRef(0);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const heroRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  // Scroll-driven parallax via useRef + direct DOM (no React re-render)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      scrollRef.current = y;

      if (heroContentRef.current) {
        const opacity = Math.max(0, 1 - y / 600);
        heroContentRef.current.style.opacity = String(opacity);
        heroContentRef.current.style.transform = `translateY(-${y * 0.3}px)`;
      }
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(Math.max(0, 1 - y / 200));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-y-auto overflow-x-hidden">
      <CustomCursor />

      {/* Globe — fixed background */}
      <div className="fixed inset-0 z-0">
        <Globe />
      </div>

      {/* Gradient overlays for depth */}
      <div className="fixed inset-0 z-[1] pointer-events-none
                      bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* ── Section 1: Hero ── */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center px-4">
        <div
          ref={(el) => {
            (heroRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            (heroContentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          className="scroll-reveal text-center max-w-4xl"
        >
          {/* English subtitle */}
          <p className="text-xs sm:text-sm tracking-[0.35em] text-cyan-400/70 mb-6 uppercase font-medium">
            AI-Powered Travel Planner
          </p>

          {/* Main title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            智能旅行
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              攻略助手
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">
            探索世界，从一次对话开始
          </p>

          {/* CTA */}
          <button
            onClick={onExplore}
            className="group relative px-10 py-4 rounded-full text-white font-semibold text-lg
                       border border-cyan-400/40 bg-cyan-400/10
                       hover:bg-cyan-400/20 hover:border-cyan-400/60
                       transition-all duration-500
                       hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]
                       active:scale-95"
            style={{ animation: 'glow 3s ease-in-out infinite' }}
            aria-label="开始探索旅行攻略"
          >
            <span className="relative z-10 flex items-center gap-3">
              开始探索
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Scroll hint */}
        <div ref={scrollHintRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
          <svg className="w-5 h-5 text-gray-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Section 2: Features ── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24">
        <div ref={featuresRef} className="scroll-reveal max-w-5xl w-full">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-cyan-400/60 uppercase mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              三步完成旅行规划
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.title}
                {...f}
                delay={`stagger-${i + 1}` as StaggerDelay}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: CTA ── */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center px-4">
        <div ref={ctaRef} className="scroll-reveal text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            你的下一次旅行
            <br />
            <span className="text-cyan-400">从这里开始</span>
          </h2>
          <p className="text-gray-400 mb-10 max-w-md mx-auto">
            告诉 AI 你的想法，让它为你规划完美行程
          </p>
          <button
            onClick={onExplore}
            className="group relative px-12 py-5 rounded-full text-white font-bold text-lg
                       bg-gradient-to-r from-cyan-500 to-blue-500
                       hover:from-cyan-400 hover:to-blue-400
                       transition-all duration-500
                       hover:shadow-[0_0_60px_rgba(34,211,238,0.4)]
                       active:scale-95"
            aria-label="开始探索旅行攻略"
          >
            <span className="flex items-center gap-3">
              开始探索
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-gray-600 tracking-wider">
            Powered by AI · Built with Three.js
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
