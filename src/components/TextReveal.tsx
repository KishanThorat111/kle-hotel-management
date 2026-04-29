import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useInView } from '@/hooks/useInView';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  type?: 'chars' | 'words' | 'lines';
}

export default function TextReveal({ 
  children, 
  className = '', 
  delay = 0,
  type = 'words' 
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    if (!isInView || !containerRef.current) return;

    const container = containerRef.current;
    const elements = type === 'chars' 
      ? container.querySelectorAll('.char')
      : type === 'words'
      ? container.querySelectorAll('.word')
      : container.querySelectorAll('.line');

    gsap.fromTo(
      elements,
      {
        y: 60,
        opacity: 0,
        rotateX: -90,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: type === 'chars' ? 0.02 : type === 'words' ? 0.08 : 0.15,
        ease: 'power3.out',
        delay,
      }
    );
  }, [isInView, delay, type]);

  const splitText = () => {
    if (type === 'chars') {
      return children.split('').map((char, i) => (
        <span 
          key={i} 
          className="char inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ));
    }
    
    if (type === 'words') {
      return children.split(' ').map((word, i) => (
        <span key={i} className="word inline-block mr-[0.25em]">
          {word}
        </span>
      ));
    }
    
    // Lines
    return children.split('\n').map((line, i) => (
      <span key={i} className="line block">
        {line}
      </span>
    ));
  };

  return (
    <div ref={ref} className="overflow-hidden">
      <div 
        ref={containerRef}
        className={`${className}`}
        style={{ perspective: '1000px' }}
      >
        {splitText()}
      </div>
    </div>
  );
}
