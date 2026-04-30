import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { img } from '@/lib/cdn';

/** All site images — preloaded behind the doors so the site is instant when revealed */
const PRELOAD_NAMES = [
  'campus', 'team', 'chef-students', 'culinary-kitchen',
  'fb-service', 'front-office', 'accommodation',
];

const MIN_DISPLAY_MS = 2600;

// ─── Corner diamond ornament ───────────────────────────────────────────────
function CornerDiamonds() {
  const corners: React.CSSProperties[] = [
    { top: -4, left: -4 },
    { top: -4, right: -4 },
    { bottom: -4, left: -4 },
    { bottom: -4, right: -4 },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            background: 'rgba(201,168,76,0.55)',
            clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
            ...pos,
          }}
        />
      ))}
    </>
  );
}

// ─── Individual door panel face ────────────────────────────────────────────
function DoorFace({ side }: { side: 'left' | 'right' }) {
  const inwardEdge = side === 'left' ? 'right' : 'left';
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Fine diagonal hatch — subtle fabric texture */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.038 }}>
        <defs>
          <pattern
            id={`hatch-${side}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="24" stroke="#C9A84C" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#hatch-${side})`} />
      </svg>

      {/* Outer gold frame */}
      <div
        style={{
          position: 'absolute',
          top: 20, left: 20, right: 20, bottom: 20,
          border: '1px solid rgba(201,168,76,0.24)',
        }}
      >
        {/* Upper raised panel */}
        <div
          style={{
            position: 'absolute',
            top: 28, left: 22, right: 22,
            height: '26%',
            border: '0.5px solid rgba(201,168,76,0.14)',
          }}
        >
          <CornerDiamonds />
        </div>

        {/* Mid ornamental lines */}
        <div
          style={{
            position: 'absolute', left: 16, right: 16,
            top: '44%', height: 1,
            background: 'rgba(201,168,76,0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute', left: 28, right: 28,
            top: 'calc(44% + 6px)', height: 1,
            background: 'rgba(201,168,76,0.08)',
          }}
        />
        {/* Centre diamond on mid line */}
        <div
          style={{
            position: 'absolute',
            left: '50%', top: 'calc(44% - 4px)',
            width: 9, height: 9,
            transform: 'translateX(-50%)',
            background: 'rgba(201,168,76,0.4)',
            clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
          }}
        />

        {/* Lower raised panel */}
        <div
          style={{
            position: 'absolute',
            bottom: 28, left: 22, right: 22,
            height: '26%',
            border: '0.5px solid rgba(201,168,76,0.14)',
          }}
        >
          <CornerDiamonds />
        </div>
      </div>

      {/* Inward-edge seam line */}
      <div
        style={{
          position: 'absolute', top: 0, bottom: 0,
          [inwardEdge]: 0, width: 1,
          background:
            'linear-gradient(180deg,transparent 0%,rgba(201,168,76,0.5) 15%,rgba(201,168,76,0.5) 85%,transparent 100%)',
        }}
      />
      {/* Inward-edge ambient glow */}
      <div
        style={{
          position: 'absolute', top: 0, bottom: 0,
          [inwardEdge]: 0, width: 80,
          background: `linear-gradient(to ${inwardEdge}, transparent, rgba(201,168,76,0.045))`,
        }}
      />

      {/* Scan shimmer sweeping down */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0,
          height: 120,
          background:
            'linear-gradient(180deg,transparent 0%,rgba(201,168,76,0.07) 40%,rgba(201,168,76,0.1) 50%,rgba(201,168,76,0.07) 60%,transparent 100%)',
          animationName: 'doorScan',
          animationDuration: side === 'left' ? '3.2s' : '3.8s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDelay: side === 'right' ? '0.7s' : '0s',
        }}
      />
    </div>
  );
}

// ─── KLE Crown SVG ─────────────────────────────────────────────────────────
function KleCrest() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path
        d="M8 38L13 20L21 29L26 10L31 29L39 20L44 38H8Z"
        fill="none" stroke="#C9A84C" strokeWidth="1.3" strokeLinejoin="round"
      />
      <rect x="8" y="38" width="36" height="3" rx="0.8" fill="none" stroke="#C9A84C" strokeWidth="1.1" />
      <circle cx="26" cy="14" r="2" fill="#C9A84C" opacity="0.85" />
      <circle cx="12.5" cy="22" r="1.3" fill="#C9A84C" opacity="0.5" />
      <circle cx="39.5" cy="22" r="1.3" fill="#C9A84C" opacity="0.5" />
      <line x1="16" y1="45" x2="36" y2="45" stroke="rgba(201,168,76,0.3)" strokeWidth="0.5" />
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef      = useRef<HTMLDivElement>(null);
  const rightRef     = useRef<HTMLDivElement>(null);
  const seamRef      = useRef<HTMLDivElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);
  const barFillRef   = useRef<HTMLDivElement>(null);
  const pctRef       = useRef<HTMLSpanElement>(null);
  const openedRef    = useRef(false);

  const [hidden, setHidden] = useState(false);

  const openDoors = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;

    if (barFillRef.current) barFillRef.current.style.width = '100%';
    if (pctRef.current) pctRef.current.textContent = '100';

    gsap
      .timeline({ delay: 0.4, onComplete: () => setHidden(true) })
      // 1. Seam brightens — light bleeds through the crack
      .to(seamRef.current, {
        opacity: 1,
        width: 5,
        boxShadow:
          '0 0 40px 14px rgba(201,168,76,0.45), 0 0 100px 32px rgba(201,168,76,0.12)',
        duration: 0.55,
        ease: 'power2.out',
      })
      // 2. Doors sweep apart
      .to(leftRef.current, {
        xPercent: -100,
        duration: 1.6,
        ease: 'power4.inOut',
      }, '-=0.2')
      .to(rightRef.current, {
        xPercent: 100,
        duration: 1.6,
        ease: 'power4.inOut',
      }, '<')
      // 3. Logo fades as doors open
      .to(logoRef.current, {
        opacity: 0,
        y: -14,
        scale: 0.96,
        duration: 0.55,
        ease: 'power2.in',
      }, '<+0.12')
      // 4. Seam disappears
      .to(seamRef.current, {
        opacity: 0,
        duration: 0.35,
      }, '<+1.0')
      // 5. Final fade-out of overlay
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.22,
      }, '<+0.2');
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const total = PRELOAD_NAMES.length;
    let loaded = 0;

    // Logo entrance animation
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.3 }
    );

    const tryOpen = () => {
      if (loaded < total) return;
      const wait = Math.max(0, MIN_DISPLAY_MS - (Date.now() - startTime));
      setTimeout(openDoors, wait);
    };

    PRELOAD_NAMES.forEach(name => {
      const el = new window.Image();
      el.onload = el.onerror = () => {
        loaded++;
        const p = Math.round((loaded / total) * 100);
        if (barFillRef.current) {
          gsap.to(barFillRef.current, { width: `${p}%`, duration: 0.4, ease: 'power2.out' });
        }
        if (pctRef.current) pctRef.current.textContent = String(p);
        tryOpen();
      };
      el.src = img(name);
    });

    // Hard fallback — open after 8s regardless
    const fallback = setTimeout(() => {
      if (!openedRef.current) openDoors();
    }, 8000);

    return () => clearTimeout(fallback);
  }, [openDoors]);

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      {/* ── LEFT DOOR ──────────────────────────────────────────────────── */}
      <div
        ref={leftRef}
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{
          width: '50%',
          background:
            'radial-gradient(ellipse at 75% 45%, #0F1329 0%, #080B18 55%, #030508 100%)',
        }}
      >
        <DoorFace side="left" />
      </div>

      {/* ── RIGHT DOOR ─────────────────────────────────────────────────── */}
      <div
        ref={rightRef}
        className="absolute top-0 right-0 h-full overflow-hidden"
        style={{
          width: '50%',
          background:
            'radial-gradient(ellipse at 25% 45%, #0F1329 0%, #080B18 55%, #030508 100%)',
        }}
      >
        <DoorFace side="right" />
      </div>

      {/* ── CENTER SEAM GLOW ───────────────────────────────────────────── */}
      <div
        ref={seamRef}
        className="absolute top-0 h-full pointer-events-none"
        style={{
          left: 'calc(50% - 1px)',
          width: 2,
          opacity: 0.5,
          background:
            'linear-gradient(180deg,transparent 0%,#C9A84C 10%,#FFF8E0 50%,#C9A84C 90%,transparent 100%)',
          boxShadow:
            '0 0 18px 5px rgba(201,168,76,0.3), 0 0 50px 14px rgba(201,168,76,0.08)',
        }}
      />

      {/* ── LOGO (floats above both doors) ─────────────────────────────── */}
      <div
        ref={logoRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0"
        style={{ zIndex: 10 }}
      >
        {/* Ambient radial glow */}
        <div
          style={{
            position: 'absolute',
            width: 480, height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)',
          }}
        />

        {/* Crest */}
        <div
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 90, height: 90,
            borderRadius: '50%',
            border: '1px solid rgba(201,168,76,0.38)',
            background: 'rgba(201,168,76,0.04)',
            marginBottom: 24, flexShrink: 0,
          }}
        >
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="45" cy="45" r="43" stroke="rgba(201,168,76,0.12)" strokeWidth="0.5" />
            <circle cx="45" cy="45" r="36" stroke="rgba(201,168,76,0.08)" strokeWidth="0.5" />
          </svg>
          <KleCrest />
        </div>

        {/* Brand name */}
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 9,
            letterSpacing: '0.5em', textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.65)', marginBottom: 8,
          }}>
            KLE Graduate School of
          </p>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontWeight: 300,
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            letterSpacing: '0.1em',
            color: '#FAF7F0', lineHeight: 1.1,
          }}>
            Hotel Management
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(201,168,76,0.38)' }} />
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9,
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(250,247,240,0.3)',
            }}>
              Belagavi · Est. 1997
            </p>
            <div style={{ height: 1, width: 28, background: 'rgba(201,168,76,0.38)' }} />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: 180, position: 'relative', zIndex: 1 }}>
          <div style={{ width: '100%', height: 1, background: 'rgba(201,168,76,0.14)', position: 'relative' }}>
            <div
              ref={barFillRef}
              style={{
                position: 'absolute', top: 0, left: 0, height: '100%', width: '0%',
                background: 'linear-gradient(90deg, rgba(201,168,76,0.7), #EDD68A)',
                boxShadow: '0 0 8px rgba(201,168,76,0.55)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9,
              letterSpacing: '0.38em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.38)',
            }}>
              Preparing
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(201,168,76,0.45)' }}>
              <span ref={pctRef}>0</span>%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
