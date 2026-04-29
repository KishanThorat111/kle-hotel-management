import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, MessageSquare, ChevronDown, Shield, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WA = '916364504056';
const env = import.meta.env as Record<string, string>;
const SUPABASE_URL = env['VITE_SUPABASE_URL'] ?? '';
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'] ?? '';

const COURSES = [
  { val: 'B.Sc Hotel Management',      label: 'Hotel Management',    sub: 'Operations & Leadership'      },
  { val: 'B.Sc Food Production',       label: 'Food Production',     sub: 'Culinary Arts & Kitchen'      },
  { val: 'B.Sc Food & Beverage',       label: 'Food & Beverage',     sub: 'Service & Bar Management'     },
  { val: 'B.Sc Tourism Management',    label: 'Tourism Management',  sub: 'Travel & Hospitality'         },
  { val: 'Diploma in Hotel Management',label: 'Diploma Program',     sub: '1-Year Fast Track'            },
];

const PARTNERS = [
  'Taj Hotels', 'ITC Hotels', 'Marriott', 'Hyatt', 'Hilton',
  'Oberoi Group', 'Leela Palaces', 'Radisson', 'JW Marriott',
  'Novotel', 'The Westin', 'Crowne Plaza',
];

const STATS = [
  { value: '26+',   label: 'Years'     },
  { value: '2000+', label: 'Alumni'    },
  { value: '50+',   label: 'Partners'  },
  { value: '100%',  label: 'Placement' },
];

async function saveLead(data: { name: string; phone: string; course: string }) {
  const payload = { ...data, ts: new Date().toISOString(), src: 'landing' };
  try {
    const stored = JSON.parse(localStorage.getItem('kle_leads') || '[]');
    stored.push(payload);
    localStorage.setItem('kle_leads', JSON.stringify(stored));
  } catch { /* private browsing */ }
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
    } catch { /* non-blocking network error */ }
  }
}

type Step = 1 | 2 | 3 | 'done';

export default function LandingPage() {
  const [introVisible, setIntroVisible] = useState(true);
  const [step, setStep]       = useState<Step>(1);
  const [dir, setDir]         = useState(1);
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFloat, setShowFloat]   = useState(false);
  const pageRef  = useRef<HTMLDivElement>(null);
  const nameRef  = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  /* Auto-focus inputs */
  useEffect(() => {
    if (step === 1 && !introVisible) setTimeout(() => nameRef.current?.focus(), 380);
    if (step === 2)                  setTimeout(() => phoneRef.current?.focus(), 380);
  }, [step, introVisible]);

  /* GSAP */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const startHero = (delay: number) => {
        gsap.fromTo('.lp-word',
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.07, ease: 'power4.out', delay }
        );
        gsap.timeline({ delay: delay + 0.28 })
          .fromTo('.lp-tag',     { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7,  ease: 'power4.out' }, 0)
          .fromTo('.lp-divider', { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.75, ease: 'power4.out', transformOrigin: 'left' }, 0.6)
          .fromTo('.lp-sub',     { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power4.out' }, 0.74)
          .fromTo('.lp-cta-btn', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power4.out' }, 1.0)
          .fromTo('.lp-stat',    { opacity: 0, y: 8  }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: 'power3.out' }, 1.3);
      };

      if (reduced) {
        setIntroVisible(false);
        startHero(0.18);
      } else {
        gsap.set('.lp-intro-kle',  { yPercent: 108 });
        gsap.set(['.lp-intro-over', '.lp-intro-sub'], { opacity: 0, y: 8 });
        gsap.set('.lp-intro-line', { scaleX: 0, transformOrigin: 'center' });

        gsap.timeline({
          onComplete: () => { startHero(0.14); setTimeout(() => setIntroVisible(false), 380); },
        })
          .to('.lp-intro-over',    { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 0.28)
          .to('.lp-intro-kle',     { yPercent: 0,     duration: 1.0,  ease: 'power4.out' }, 0.52)
          .to('.lp-intro-line',    { scaleX: 1,       duration: 0.72, ease: 'power4.out' }, 1.14)
          .to('.lp-intro-sub',     { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, 1.42)
          .to('.lp-intro-content', { opacity: 0,       duration: 0.35, ease: 'power2.in'  }, 2.52)
          .to('.lp-curtain-top',   { y: '-101%',       duration: 0.9,  ease: 'expo.inOut' }, 2.64)
          .to('.lp-curtain-bot',   { y: '101%',        duration: 0.9,  ease: 'expo.inOut' }, 2.64);

        gsap.to('.lp-hero-bg', {
          yPercent: 18, ease: 'none',
          scrollTrigger: { trigger: '.lp-hero', start: 'top top', end: 'bottom top', scrub: 1.6 },
        });
      }

      gsap.utils.toArray<HTMLElement>('.lp-reveal').forEach(el =>
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power4.out', clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        })
      );
      gsap.utils.toArray<HTMLElement>('.lp-stagger').forEach(wrap =>
        gsap.fromTo(Array.from(wrap.children), { opacity: 0, y: 22 }, {
          opacity: 1, y: 0, duration: 0.82, stagger: 0.1, ease: 'power4.out', clearProps: 'transform',
          scrollTrigger: { trigger: wrap, start: 'top 86%', toggleActions: 'play none none none' },
        })
      );
    }, pageRef);

    const onScroll = () => setShowFloat(window.scrollY > 160);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { ctx.revert(); window.removeEventListener('scroll', onScroll); };
  }, []);

  /* Handlers */
  const advanceName = () => {
    if (!name.trim()) return;
    setDir(1); setStep(2);
  };

  const advancePhone = () => {
    if (!/^\d{10}$/.test(phone)) { setPhoneError('Enter a valid 10-digit number'); return; }
    setPhoneError(''); setDir(1); setStep(3);
  };

  const selectCourse = async (val: string) => {
    setSubmitting(true);
    await saveLead({ name: name.trim(), phone, course: val });
    setSubmitting(false);
    setDir(1); setStep('done');
    setTimeout(() =>
      window.open(
        `https://wa.me/${WA}?text=${encodeURIComponent(`Hi! I'm ${name.trim()}. Interested in ${val} at KLE Hotel Management, Belagavi. My number is ${phone}.`)}`,
        '_blank'
      ), 1800
    );
  };

  const scrollToForm = () =>
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });

  /* Framer Motion step transition */
  const sv = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };
  const st = { duration: 0.44, ease: [0.16, 1, 0.3, 1] };

  const currentStepNum = step === 'done' ? 3 : (step as number);

  /* ─────────────────────────── JSX ─────────────────────────── */
  return (
    <div ref={pageRef} style={{ background: '#080808', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 300, overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

        /* ── Curtains ── */
        .lp-curtain-top, .lp-curtain-bot { will-change: transform }
        .lp-intro-kle-outer { overflow: hidden; line-height: .9 }

        /* ── Hero zoom ── */
        @keyframes lp-hero-zoom {
          from { transform: scale(1) }
          to   { transform: scale(1.065) }
        }

        /* ── Sweep ── */
        @keyframes lp-sweep {
          from { transform: translateX(-100%) skewX(-10deg) }
          to   { transform: translateX(620%)  skewX(-10deg) }
        }

        /* ── Badge breathe ── */
        @keyframes lp-badge-breathe {
          0%,100% { box-shadow: none; border-color: rgba(201,168,76,.28) }
          50%     { box-shadow: 0 0 22px 4px rgba(201,168,76,.1); border-color: rgba(201,168,76,.7) }
        }
        .lp-badge-breathe { animation: lp-badge-breathe 3.8s ease-in-out infinite }

        /* ── Word reveal ── */
        .lp-word-outer { display: inline-block; overflow: hidden; vertical-align: bottom }
        .lp-word       { display: inline-block }

        /* ── Stats grid responsive ── */
        @media (min-width: 600px) {
          .lp-stats-grid { grid-template-columns: repeat(4,1fr) !important }
          .lp-stat       { border-bottom: none !important }
        }

        /* ── Step input ── */
        .lp-step-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(255,255,255,.16);
          color: #fff;
          font-family: Inter, sans-serif;
          font-size: 1.3rem;
          font-weight: 300;
          padding: .65rem 0;
          outline: none;
          transition: border-color .4s ease;
          -webkit-appearance: none;
        }
        .lp-step-input:focus { border-bottom-color: #C9A84C }
        .lp-step-input::placeholder { color: rgba(255,255,255,.18); font-size: .98rem }

        /* ── Next arrow button ── */
        .lp-btn-next {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: #C9A84C;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform .38s cubic-bezier(.16,1,.3,1), box-shadow .38s ease;
          flex-shrink: 0;
        }
        .lp-btn-next:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 28px rgba(201,168,76,.42);
        }
        .lp-btn-next:disabled { opacity: .26; cursor: default }

        /* ── Course cards ── */
        .lp-course-card {
          width: 100%;
          text-align: left;
          padding: 1rem 1.2rem;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          color: #fff;
          cursor: pointer;
          transition: border-color .35s ease, background .35s ease, transform .45s cubic-bezier(.16,1,.3,1);
        }
        .lp-course-card:hover {
          border-color: rgba(201,168,76,.55);
          background: rgba(201,168,76,.075);
          transform: translateX(5px);
        }

        /* ── Highlight rows ── */
        .lp-hl {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 1.2rem 1.15rem;
          background: rgba(255,255,255,.022);
          border: 1px solid rgba(201,168,76,.065);
          transition: border-color .4s ease, background .4s ease, transform .45s cubic-bezier(.16,1,.3,1);
        }
        .lp-hl:hover {
          border-color: rgba(201,168,76,.35);
          transform: translateX(5px);
          background: rgba(201,168,76,.025);
        }

        /* ── Partners marquee ── */
        @keyframes lp-marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        .lp-marquee-track {
          display: flex;
          width: max-content;
          animation: lp-marquee 26s linear infinite;
          will-change: transform;
        }
        .lp-marquee-track:hover { animation-play-state: paused }
        .lp-marquee-item {
          padding: 0 2.75rem;
          font-size: .65rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: rgba(255,255,255,.26);
          white-space: nowrap;
          transition: color .3s ease;
        }
        .lp-marquee-item:hover { color: rgba(201,168,76,.72) }

        /* ── CTA submit ── */
        .lp-submit {
          background: #C9A84C;
          color: #080808;
          font-weight: 700;
          font-size: .74rem;
          letter-spacing: .17em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
          transition: background .35s, transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s;
        }
        .lp-submit:hover {
          background: #B89038;
          transform: translateY(-2px);
          box-shadow: 0 10px 34px rgba(201,168,76,.28);
        }

        /* ── Action buttons ── */
        .lp-wa-btn {
          display: flex; align-items: center; justify-content: center; gap: .65rem;
          padding: 1.15rem;
          background: #25D366;
          color: #fff; font-weight: 600; font-size: .8rem;
          text-decoration: none; letter-spacing: .07em;
          transition: background .3s, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s;
        }
        .lp-wa-btn:hover {
          background: #1DB954;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,.32);
        }
        .lp-ghost-btn {
          display: flex; align-items: center; justify-content: center; gap: .65rem;
          padding: 1.15rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.5); font-weight: 500; font-size: .8rem;
          text-decoration: none; letter-spacing: .07em;
          transition: border-color .35s, color .35s, transform .4s cubic-bezier(.16,1,.3,1);
        }
        .lp-ghost-btn:hover {
          border-color: rgba(201,168,76,.45);
          color: rgba(255,255,255,.82);
          transform: translateY(-1px);
        }

        /* ── FAB glow ── */
        @keyframes lp-wa-glow {
          0%,100% { box-shadow: 0 4px 22px rgba(37,211,102,.38) }
          50%     { box-shadow: 0 6px 36px rgba(37,211,102,.62), 0 0 0 7px rgba(37,211,102,.07) }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lp-badge-breathe  { animation: none !important }
          .lp-marquee-track  { animation: none !important }
          .lp-course-card:hover, .lp-hl:hover { transform: none !important }
          .lp-btn-next:hover { transform: none !important }
          .lp-wa-btn:hover, .lp-ghost-btn:hover, .lp-submit:hover { transform: none !important }
        }
      `}</style>

      {/* ═══════════════════ CINEMATIC INTRO ═══════════════════ */}
      {introVisible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
          {/* Ambient gold glow */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '55vw', height: '55vw', maxWidth: 480, maxHeight: 480, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(201,168,76,.07) 0%, transparent 68%)', pointerEvents: 'none' }} />
          {/* Gold seam at center */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - .5px)', height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,.52) 18%, rgba(201,168,76,.52) 82%, transparent 100%)' }} />
          {/* Top curtain */}
          <div className="lp-curtain-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '51%', background: '#080808' }} />
          {/* Bottom curtain */}
          <div className="lp-curtain-bot" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '51%', background: '#080808' }} />
          {/* Center logo */}
          <div className="lp-intro-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.95rem', zIndex: 2 }}>
            <p className="lp-intro-over" style={{ fontSize: '.5rem', letterSpacing: '.36em', textTransform: 'uppercase', color: 'rgba(201,168,76,.68)', fontFamily: 'Inter, sans-serif' }}>Est. 1997 &middot; Belagavi, Karnataka</p>
            <div className="lp-intro-kle-outer">
              <h1 className="lp-intro-kle" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(5.5rem,18vw,10.5rem)', color: '#fff', lineHeight: .9, letterSpacing: '-.03em', display: 'block' }}>KLE</h1>
            </div>
            <div className="lp-intro-line" style={{ width: 64, height: 1, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
            <p className="lp-intro-sub" style={{ fontSize: '.58rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.36)' }}>Hotel Management</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="lp-hero" style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        {/* Background */}
        <div className="lp-hero-bg" style={{ position: 'absolute', inset: '-18% 0', willChange: 'transform' }}>
          <img src="/images/campus.jpg" alt="KLE Campus" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', animation: 'lp-hero-zoom 16s ease-out forwards' }} loading="eager" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(8,8,8,.72) 0%, rgba(8,8,8,.32) 32%, rgba(8,8,8,.82) 65%, rgba(8,8,8,1) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,.04) 0%, transparent 65%)' }} />
        </div>
        {/* One-time light sweep */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '18%', background: 'linear-gradient(108deg, transparent 0%, rgba(255,255,255,.013) 50%, transparent 100%)', animation: 'lp-sweep 3.6s ease-in-out 1.5s both' }} />
        </div>
        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', width: '100%', padding: '0 1.25rem' }}>
          {/* Urgency badge */}
          <div className="lp-tag lp-badge-breathe" style={{ opacity: 0, display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.4rem 1.05rem', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.28)', marginBottom: '1.6rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', display: 'inline-block' }} />
            <span style={{ fontSize: '.54rem', letterSpacing: '.24em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Admissions Open — 2026 Batch</span>
          </div>
          {/* Headline word-by-word */}
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, lineHeight: 1.04, fontSize: 'clamp(2.6rem,8vw,5.4rem)', color: '#fff', marginBottom: '1.5rem' }}>
            {['Your', 'Career', 'in'].map((w, i) => (
              <span key={i} className="lp-word-outer" style={{ marginRight: '.26em' }}>
                <span className="lp-word">{w}</span>
              </span>
            ))}
            <br />
            {[['Hospitality', true], ['Starts', false], ['Here', false]].map(([w, gold], i) => (
              <span key={i} className="lp-word-outer" style={{ marginRight: '.22em' }}>
                <em className="lp-word" style={{ fontStyle: 'italic', color: gold ? '#C9A84C' : '#fff' }}>{w as string}</em>
              </span>
            ))}
          </h1>
          {/* Gold divider */}
          <div className="lp-divider" style={{ opacity: 0, width: 48, height: 1, background: 'linear-gradient(90deg, #C9A84C, transparent)', marginBottom: '1.15rem', transformOrigin: 'left' }} />
          {/* Subtext */}
          <p className="lp-sub" style={{ opacity: 0, fontSize: 'clamp(.88rem,2.4vw,1rem)', fontWeight: 300, color: 'rgba(255,255,255,.5)', maxWidth: 400, lineHeight: 1.9, marginBottom: '2.2rem' }}>
            KLE Graduate School of Hotel Management, Belagavi — empowering students to lead the global hospitality industry since 1997.
          </p>
          {/* CTA */}
          <div className="lp-cta-btn" style={{ opacity: 0, marginBottom: '4.5rem' }}>
            <button className="lp-submit" style={{ width: 'auto', padding: '.95rem 2.4rem' }} onClick={scrollToForm}>
              Apply for 2026 Batch <ArrowRight size={14} />
            </button>
          </div>
        </div>
        {/* Stats bar */}
        <div style={{ position: 'relative', zIndex: 10, background: 'rgba(5,5,5,.84)', backdropFilter: 'blur(32px)', borderTop: '1px solid rgba(201,168,76,.1)' }}>
          <div className="lp-stats-grid" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            {STATS.map((s, i) => (
              <div key={i} className="lp-stat" style={{ opacity: 0, padding: '1.25rem .75rem', textAlign: 'center', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,.05)' : 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.85rem', fontWeight: 300, color: '#C9A84C', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '.5rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.27)', marginTop: '.3rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Scroll indicator */}
        <motion.div style={{ position: 'absolute', bottom: 112, left: '50%', x: '-50%', zIndex: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4, duration: 1.2 }}>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={16} style={{ color: 'rgba(201,168,76,.3)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═════════════════ MULTI-STEP FORM ═════════════════ */}
      <section id="lead-form" style={{ position: 'relative', padding: '5.5rem 1.25rem 5.5rem', background: '#0C0C0C' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5rem', background: 'linear-gradient(to bottom, #080808, transparent)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 420, margin: '0 auto' }}>
          {/* Overline */}
          <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '.52rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,.58)', fontWeight: 500 }}>Admission 2026</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.9rem,5vw,2.6rem)', lineHeight: 1.1, marginTop: '.5rem' }}>
              Begin Your <em style={{ color: '#C9A84C' }}>Journey</em>
            </h2>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '2.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: currentStepNum === i ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: currentStepNum >= i ? '#C9A84C' : 'rgba(255,255,255,.14)',
                transition: 'all .55s cubic-bezier(.16,1,.3,1)',
              }} />
            ))}
          </div>

          {/* Step container */}
          <div style={{ position: 'relative', minHeight: 310, overflow: 'hidden' }}>
            <AnimatePresence custom={dir} mode="wait">

              {/* ── STEP 1: NAME ── */}
              {step === 1 && (
                <motion.div key="s1" custom={dir} variants={sv} initial="enter" animate="center" exit="exit" transition={st} style={{ width: '100%' }}>
                  <p style={{ fontSize: '.54rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.1rem', fontWeight: 500 }}>Step 1 of 3 &nbsp;&middot;&nbsp; About You</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,5vw,2.25rem)', lineHeight: 1.2, marginBottom: '2rem', color: '#fff' }}>
                    What's your<br />name?
                  </h3>
                  <input
                    ref={nameRef}
                    className="lp-step-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && advanceName()}
                    placeholder="Your full name"
                    autoComplete="name"
                    style={{ marginBottom: '2.5rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="lp-btn-next" onClick={advanceName} disabled={!name.trim()} aria-label="Continue">
                      <ArrowRight size={20} color="#080808" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: PHONE ── */}
              {step === 2 && (
                <motion.div key="s2" custom={dir} variants={sv} initial="enter" animate="center" exit="exit" transition={st} style={{ width: '100%' }}>
                  <p style={{ fontSize: '.54rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.1rem', fontWeight: 500 }}>Step 2 of 3 &nbsp;&middot;&nbsp; Contact</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,5vw,2.25rem)', lineHeight: 1.2, marginBottom: '2rem' }}>
                    Hi {name.split(' ')[0]},<br />your WhatsApp?
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '.7rem', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 300, color: 'rgba(255,255,255,.35)', flexShrink: 0 }}>+91</span>
                    <input
                      ref={phoneRef}
                      className="lp-step-input"
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneError(''); }}
                      onKeyDown={e => e.key === 'Enter' && advancePhone()}
                      placeholder="10-digit number"
                      inputMode="numeric"
                      autoComplete="tel"
                      style={{ flex: 1 }}
                    />
                  </div>
                  {phoneError && (
                    <p style={{ fontSize: '.74rem', color: '#f87171', marginBottom: '.5rem' }}>{phoneError}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                    <button className="lp-btn-next" onClick={advancePhone} disabled={phone.length !== 10} aria-label="Continue">
                      <ArrowRight size={20} color="#080808" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: COURSE ── */}
              {step === 3 && (
                <motion.div key="s3" custom={dir} variants={sv} initial="enter" animate="center" exit="exit" transition={st} style={{ width: '100%' }}>
                  <p style={{ fontSize: '.54rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.1rem', fontWeight: 500 }}>Step 3 of 3 &nbsp;&middot;&nbsp; Your Interest</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.65rem,4.8vw,2.1rem)', lineHeight: 1.2, marginBottom: '1.75rem' }}>
                    Which program,<br />{name.split(' ')[0]}?
                  </h3>
                  {submitting ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
                      <motion.div
                        style={{ width: 32, height: 32, border: '2px solid rgba(201,168,76,.2)', borderTopColor: '#C9A84C', borderRadius: '50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: .7, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.52rem' }}>
                      {COURSES.map(c => (
                        <button key={c.val} className="lp-course-card" onClick={() => selectCourse(c.val)}>
                          <span style={{ fontSize: '.9rem', fontWeight: 500, color: '#fff', display: 'block' }}>{c.label}</span>
                          <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.38)', marginTop: '.16rem', display: 'block' }}>{c.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── DONE ── */}
              {step === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: .93 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .62, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: .14 }}>
                    <CheckCircle size={52} style={{ color: '#C9A84C', margin: '0 auto 1.5rem', display: 'block' }} />
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: .7, ease: [0.16, 1, 0.3, 1] }} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: '1.9rem', marginBottom: '.7rem' }}>
                    You&apos;re in, {name.split(' ')[0]}!
                  </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .7, ease: [0.16, 1, 0.3, 1] }} style={{ color: 'rgba(255,255,255,.44)', fontSize: '.88rem', lineHeight: 1.76, marginBottom: '1rem' }}>
                    Your details are saved. Our admissions team will contact <strong style={{ color: '#fff' }}>+91&#8209;{phone}</strong> within 24 hours.
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7, duration: .8 }} style={{ fontSize: '.64rem', color: 'rgba(201,168,76,.48)', letterSpacing: '.06em' }}>
                    Opening WhatsApp for instant assistance...
                  </motion.p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Trust micro-line */}
          {step !== 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem', marginTop: '1.75rem' }}>
              <Shield size={11} style={{ color: 'rgba(201,168,76,.45)' }} />
              <p style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.22)' }}>Your info is private &nbsp;&middot;&nbsp; No spam &nbsp;&middot;&nbsp; 100% free</p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════ TRUST STRIP ════════════════════ */}
      <section style={{ position: 'relative', padding: '5rem 1.25rem 4.5rem', background: '#111111' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4.5rem', background: 'linear-gradient(to bottom, #0C0C0C, transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '.54rem', letterSpacing: '.26em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Why 2000+ Alumni Chose KLE</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.65rem,4vw,2.4rem)', marginTop: '.62rem', lineHeight: 1.15 }}>
              Built for the <em style={{ color: '#C9A84C' }}>Real World</em>
            </h2>
          </div>
          <div className="lp-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '.62rem' }}>
            {[
              'AICTE approved · Affiliated to KLE University since 1997',
              '6–12 month paid industrial training at Taj, ITC, Marriott & 50+ five-star properties',
              'Expert faculty with first-hand hotel operations experience at India\'s top properties',
              '100% placement assistance — international opportunities available upon graduation',
            ].map((h, i) => (
              <div key={i} className="lp-hl">
                <CheckCircle size={15} style={{ color: '#C9A84C', flexShrink: 0, marginTop: 3 }} />
                <p style={{ fontSize: '.88rem', fontWeight: 400, color: 'rgba(255,255,255,.76)', lineHeight: 1.6 }}>{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════ PARTNERS MARQUEE ═════════════════ */}
      <section style={{ padding: '2.75rem 0', background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', overflow: 'hidden' }}>
        <p style={{ textAlign: 'center', fontSize: '.5rem', letterSpacing: '.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)', marginBottom: '1.35rem' }}>Placement Partners</p>
        <div style={{ overflow: 'hidden' }}>
          <div className="lp-marquee-track">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} className="lp-marquee-item">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ACTION SECTION ═══════════════════ */}
      <section style={{ padding: '4.5rem 1.25rem 5.5rem', background: '#0A0A0A' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2.75rem' }}>
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want admission details for KLE Hotel Management, Belagavi.')}`} target="_blank" rel="noopener noreferrer" className="lp-wa-btn">
              <MessageSquare size={17} />
              Chat on WhatsApp
            </a>
            <a href="https://www.klehotelmanagement.edu.in" target="_blank" rel="noopener noreferrer" className="lp-ghost-btn">
              <ExternalLink size={14} />
              Explore Full Website
            </a>
          </div>
          <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center' }}>
            <p style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.16)', marginBottom: '.42rem' }}>Or call us directly</p>
            <a href="tel:+919731595657" style={{ fontSize: '1.05rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 500, letterSpacing: '.02em' }}>+91 97315 95657</a>
            <p style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.18)', marginTop: '.32rem' }}>JNMC Campus, Nehru Nagar, Belagavi — 590 010</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer style={{ padding: '1.35rem 1.25rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,.04)', textAlign: 'center' }}>
        <p style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.14)', letterSpacing: '.04em' }}>
          &copy; {new Date().getFullYear()} KLE Graduate School of Hotel Management &amp; Catering Technology, Belagavi. Part of KLE Society since 1916.
        </p>
      </footer>

      {/* ═══════════════════ FLOATING FAB ═══════════════════ */}
      <AnimatePresence>
        {showFloat && (
          <motion.a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to know about KLE Hotel Management admissions.')}`}
            target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, scale: .45 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: .94 }}
            style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, width: 56, height: 56, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'lp-wa-glow 3.2s ease-in-out infinite', textDecoration: 'none' }}
            aria-label="Chat on WhatsApp"
          >
            <MessageSquare size={24} color="#fff" />
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
