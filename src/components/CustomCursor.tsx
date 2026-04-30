import { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — luxury gold cursor for desktop/laptop (fine pointer) devices.
 * States: default, hover (enlarge), click (compress), typing (thin beam).
 */
export default function CustomCursor() {
  const [pos, setPos]           = useState({ x: -200, y: -200 });
  const [dotPos, setDotPos]     = useState({ x: -200, y: -200 });
  const [isHovering, setIsHovering] = useState(false);
  const [isPointer, setIsPointer]   = useState(false);
  const [isVisible, setIsVisible]   = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTyping, setIsTyping]     = useState(false);

  const ringTarget = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
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
    const onLeave  = () => setIsVisible(false);
    const onEnter  = () => setIsVisible(true);
    const onDown   = () => setIsClicking(true);
    const onUp     = () => setIsClicking(false);

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable = !!target.closest(
        'a, button, [role="button"], select, label, [data-cursor="pointer"]',
      );
      setIsHovering(hoverable);
      setIsPointer(hoverable || window.getComputedStyle(target).cursor === 'pointer');
    };

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches('input, textarea, [contenteditable="true"], [contenteditable=""]'))
        setIsTyping(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches('input, textarea, [contenteditable="true"], [contenteditable=""]'))
        setIsTyping(false);
    };

    document.addEventListener('mousemove',  onMove,     { passive: true });
    document.addEventListener('mouseover',  onOver,     { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mousedown',  onDown);
    document.addEventListener('mouseup',    onUp);
    document.addEventListener('focusin',    onFocusIn);
    document.addEventListener('focusout',   onFocusOut);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.removeEventListener('focusin',    onFocusIn);
      document.removeEventListener('focusout',   onFocusOut);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  // Typing mode → thin vertical bar; click → compressed ring; hover → expanded ring
  const ringW  = isTyping ? 2  : isClicking ? 20 : isHovering ? 52 : 34;
  const ringH  = isTyping ? 22 : isClicking ? 20 : isHovering ? 52 : 34;
  const radius = isTyping ? '1px' : '50%';
  const scale  = isClicking ? 'scale(0.8)' : 'scale(1)';

  return (
    <>
      {/* Outer ring / beam */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: ringW, height: ringH,
          borderRadius: radius,
          border: `${isTyping ? 1.5 : 1.5}px solid rgba(201,168,76,${isClicking ? 1 : 0.85})`,
          backgroundColor: isClicking
            ? 'rgba(201,168,76,0.18)'
            : isHovering ? 'rgba(201,168,76,0.08)' : 'transparent',
          transform: `translate(${pos.x - ringW / 2}px, ${pos.y - ringH / 2}px) ${scale}`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.2s, height 0.2s, border-radius 0.2s, background-color 0.15s',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />

      {/* Inner dot — hidden when hovering clickable or typing */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: (isPointer || isTyping) ? 0 : 6,
          height: (isPointer || isTyping) ? 0 : 6,
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
