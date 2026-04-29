import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export default function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  direction = 'up',
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;
    if (items.length === 0) return;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up': return { y: 60 };
        case 'down': return { y: -60 };
        case 'left': return { x: 60 };
        case 'right': return { x: -60 };
        default: return { y: 60 };
      }
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        {
          opacity: 0,
          ...getInitialPosition(),
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          stagger: staggerDelay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [staggerDelay, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
