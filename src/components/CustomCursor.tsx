import { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — luxury gold cursor for desktop/laptop (fine pointer) devices.
 * Uses plain CSS transitions instead of GSAP to avoid transform conflicts.
 * Hidden on touch/mobile devices; native cursor restored there via App.css.
 */
export default function CustomCursor() {
  // Initialise off-screen so the ring doesn't flash at (0,0) before first move
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [dotPos, setDotPos] = useState({ x: -200, y: -200 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth ring follows mouse with lerp via rAF
  const ringTarget = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Only activate on fine-pointer (mouse/trackpad) devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let current = { x: -200, y: -200 };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      current.x = lerp(current.x, ringTarget.current.x, 0.12);
      current.y = lerp(current.y, ringTarget.current.y, 0.12);
      setPos({ x: current.x, y: current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const onMove = (e: MouseEvent) => {
      ringTarget.current = { x: e.clientX, y: e.clientY };
      setDotPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable = !!target.closest('a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]');
      setIsHovering(hoverable);
      setIsPointer(hoverable || window.getComputedStyle(target).cursor === 'pointer');
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  // Don't render at all on touch devices (SSR-safe check)
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Outer ring — lags smoothly behind the mouse */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? 56 : 36,
          height: isHovering ? 56 : 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(201,168,76,0.85)',
          backgroundColor: isHovering ? 'rgba(201,168,76,0.1)' : 'transparent',
          transform: `translate(${pos.x - (isHovering ? 28 : 18)}px, ${pos.y - (isHovering ? 28 : 18)}px)`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.25s, height 0.25s, background-color 0.25s',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />

      {/* Inner dot — snaps exactly to mouse position */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isPointer ? 0 : 6,
          height: isPointer ? 0 : 6,
          borderRadius: '50%',
          backgroundColor: '#C9A84C',
          transform: `translate(${dotPos.x - 3}px, ${dotPos.y - 3}px)`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.15s, height 0.15s',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
    </>
  );
}
