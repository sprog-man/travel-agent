import React, { useRef, useEffect, useCallback } from 'react';

const LERP = 0.15;

const CustomCursor: React.FC = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const outerPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  const animate = useCallback(() => {
    outerPos.current.x += (mouse.current.x - outerPos.current.x) * LERP;
    outerPos.current.y += (mouse.current.y - outerPos.current.y) * LERP;

    if (outerRef.current) {
      outerRef.current.style.transform = `translate(${outerPos.current.x - 12}px, ${outerPos.current.y - 12}px)`;
    }
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onEnter = () => {
      if (outerRef.current) outerRef.current.style.opacity = '1';
      if (innerRef.current) innerRef.current.style.opacity = '1';
    };

    const onLeave = () => {
      if (outerRef.current) outerRef.current.style.opacity = '0';
      if (innerRef.current) innerRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return (
    <>
      <div
        ref={outerRef}
        className="fixed top-0 left-0 w-6 h-6 rounded-full border border-white/40 pointer-events-none z-[9999] opacity-0 transition-[width,height,border-color] duration-200"
        style={{ mixBlendMode: 'difference' }}
      />
      <div
        ref={innerRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white pointer-events-none z-[9999] opacity-0"
        style={{ mixBlendMode: 'difference' }}
      />
    </>
  );
};

export default CustomCursor;
