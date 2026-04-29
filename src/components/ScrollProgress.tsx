import { useScrollProgress } from '@/hooks/useScrollProgress';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const { progress } = useScrollProgress();
  const progressRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.to(textRef.current, {
        opacity: progress > 5 ? 1 : 0,
        duration: 0.3,
      });
    }
  }, [progress]);

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 h-px z-[101]" style={{ background: 'rgba(201,168,76,0.1)' }}>
        <div
          ref={progressRef}
          className="h-full transition-all duration-100"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #C9A84C, #EDD68A)',
            boxShadow: '0 0 8px rgba(201, 168, 76, 0.4)',
          }}
        />
      </div>
      
      {/* Side progress indicator */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col items-center gap-2">
        <span 
          ref={textRef}
          className="text-xs font-light opacity-0 transition-opacity tracking-widest"
          style={{ color: '#C9A84C' }}
        >
          {Math.round(progress)}%
        </span>
        <div className="w-1 h-24 bg-gray-200/50 rounded-full overflow-hidden">
          <div 
          className="h-full bg-gradient-to-b transition-all duration-100 rounded-full"
          style={{ 
            height: `${progress}%`,
            background: 'linear-gradient(180deg, #C9A84C, #EDD68A)',
          }}
          />
        </div>
      </div>
    </>
  );
}
