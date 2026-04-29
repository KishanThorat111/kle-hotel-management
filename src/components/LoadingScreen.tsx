import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Logo entrance
    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' }
    );

    tl.fromTo(
      textRef.current?.querySelectorAll('.reveal-text'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
      '-=0.6'
    );

    // Progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = prev < 60 ? 2.5 : prev < 85 ? 1.5 : 0.8;
        return Math.min(prev + increment, 100);
      });
    }, 28);

    return () => clearInterval(interval);
  }, []);

  // Exit animation
  useEffect(() => {
    if (progress >= 100 && containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        filter: 'blur(20px)',
        scale: 1.05,
        duration: 1,
        delay: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        },
      });
    }
  }, [progress]);

  // Update bar
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#0A0A0A' }}
    >
      {/* Luxury grid */}
      <div className="absolute inset-0 luxury-grid opacity-30" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div ref={logoRef} className="mb-12 opacity-0 flex flex-col items-center gap-4">
        {/* Crest Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.05)' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M22 6L26 14H34L28 19L30 27L22 22L14 27L16 19L10 14H18L22 6Z"
              fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M22 36V22M15 30H29" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round" />
            <circle cx="22" cy="22" r="20" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: '#C9A84C', fontFamily: 'Inter' }}>
            KLE Graduate School of
          </p>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] uppercase" style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            color: '#FAF7F0',
          }}>
            Hotel Management
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: 'rgba(250,247,240,0.4)', fontFamily: 'Inter' }}>
            Belagavi · Est. 1997
          </p>
        </div>
      </div>

      {/* Text & Progress */}
      <div ref={textRef} className="w-full max-w-xs px-8 flex flex-col items-center gap-4">
        <p className="reveal-text text-xs tracking-[0.3em] uppercase opacity-0" style={{ color: 'rgba(201,168,76,0.6)' }}>
          Crafting Your Experience
        </p>

        {/* Progress bar */}
        <div className="reveal-text w-full opacity-0">
          <div className="w-full h-px relative" style={{ background: 'rgba(201,168,76,0.15)' }}>
            <div
              ref={barRef}
              className="absolute left-0 top-0 h-full transition-all duration-100"
              style={{
                width: '0%',
                background: 'linear-gradient(90deg, #C9A84C, #EDD68A)',
                boxShadow: '0 0 8px rgba(201,168,76,0.5)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>
              LOADING
            </span>
            <span className="text-[10px] font-light" style={{ color: 'rgba(201,168,76,0.6)' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

