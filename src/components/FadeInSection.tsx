import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
}

export default function FadeInSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 50,
  duration = 1,
}: FadeInSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up': return { y: distance, x: 0 };
        case 'down': return { y: -distance, x: 0 };
        case 'left': return { x: distance, y: 0 };
        case 'right': return { x: -distance, y: 0 };
        default: return { y: distance, x: 0 };
      }
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        {
          opacity: 0,
          ...getInitialPosition(),
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [delay, direction, distance, duration]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}
