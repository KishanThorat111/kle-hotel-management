import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Check if touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    // Center via GSAP xPercent/yPercent — avoids conflict with x/y quickSetter
    gsap.set([cursor, cursorDot], { xPercent: -50, yPercent: -50 });

    const pos = { x: -200, y: -200 };
    const mouse = { x: -200, y: -200 };
    const speed = 0.15;

    const xSet = gsap.quickSetter(cursor, 'x', 'px');
    const ySet = gsap.quickSetter(cursor, 'y', 'px');
    const xDotSet = gsap.quickSetter(cursorDot, 'x', 'px');
    const yDotSet = gsap.quickSetter(cursorDot, 'y', 'px');

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      xDotSet(mouse.x);
      yDotSet(mouse.y);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => {
      if (mouse.x !== -200) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
    };
    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    // Animation loop for smooth cursor following
    const tick = () => {
      pos.x += (mouse.x - pos.x) * speed;
      pos.y += (mouse.y - pos.y) * speed;
      xSet(pos.x);
      ySet(pos.y);
    };

    gsap.ticker.add(tick);

    // Detect hoverable elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable = target.closest('a, button, [data-cursor="pointer"], input, textarea, select');
      const isClickable = window.getComputedStyle(target).cursor === 'pointer';
      setIsPointer(!!isHoverable || isClickable);
      setIsHovering(!!isHoverable);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleElementHover, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      gsap.ticker.remove(tick);
    };
  }, []); // run once — isVisibleRef avoids stale closure

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`rounded-full transition-all duration-300 ${
            isHovering 
              ? 'w-16 h-16' 
              : 'w-10 h-10'
          } ${isPointer ? 'scale-150' : 'scale-100'}`}
          style={{
            border: '1.5px solid rgba(201, 168, 76, 0.8)',
            backgroundColor: isHovering ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
          }}
        />
      </div>
      
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`w-1.5 h-1.5 rounded-full transition-transform duration-150 ${
            isPointer ? 'scale-0' : 'scale-100'
          }`}
          style={{ backgroundColor: '#C9A84C' }}
        />
      </div>
    </>
  );
}
