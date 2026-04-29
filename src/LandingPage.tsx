import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, MessageSquare, ChevronDown, Shield, ExternalLink } from 'lucide-react';
import Lenis from 'lenis';

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
  'Taj Hotels','ITC Hotels','Marriott','Hyatt','Hilton',
  'Oberoi Group','Leela Palaces','Radisson','JW Marriott',
  'Novotel','The Westin','Crowne Plaza',
];
const STATS = [
  { label: 'Years',     target: 26,   suffix: '+' },
  { label: 'Alumni',    target: 2000, suffix: '+' },
  { label: 'Partners',  target: 50,   suffix: '+' },
  { label: 'Placement', target: 100,  suffix: '%' },
];

async function saveLead(data: { name: string; phone: string; course: string }) {
  const payload = { ...data, ts: new Date().toISOString(), src: 'landing' };
  try {
    const s = JSON.parse(localStorage.getItem('kle_leads') || '[]');
    s.push(payload); localStorage.setItem('kle_leads', JSON.stringify(s));
  } catch { /* private */ }
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload),
      });
    } catch { /* non-blocking */ }
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

  const pageRef        = useRef<HTMLDivElement>(null);
  const heroRef        = useRef<HTMLElement>(null);
  const formRef        = useRef<HTMLElement>(null);
  const nameRef        = useRef<HTMLInputElement>(null);
  const phoneRef       = useRef<HTMLInputElement>(null);
  const cursorDotRef   = useRef<HTMLDivElement>(null);
  const cursorRingRef  = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const grainRef       = useRef<HTMLDivElement>(null);

  /* ── Focus ── */
  useEffect(() => {
    if (step === 1 && !introVisible) setTimeout(() => nameRef.current?.focus(), 380);
    if (step === 2)                  setTimeout(() => phoneRef.current?.focus(), 380);
  }, [step, introVisible]);

  /* ── Grain texture (set via JS to avoid SVG-in-CSS encoding issues) ── */
  useEffect(() => {
    if (!grainRef.current) return;
    const svg = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>" +
      "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/></filter>" +
      "<rect width='300' height='300' filter='url(#g)' opacity='0.45'/>" +
      "</svg>"
    );
    grainRef.current.style.backgroundImage = `url("data:image/svg+xml,${svg}")`;
  }, []);

  /* ── Custom cursor (pointer: fine / desktop only) ── */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot  = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    const mx = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rp = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const dotX  = gsap.quickSetter(dot,  'x', 'px') as (v: number) => void;
    const dotY  = gsap.quickSetter(dot,  'y', 'px') as (v: number) => void;
    const ringX = gsap.quickSetter(ring, 'x', 'px') as (v: number) => void;
    const ringY = gsap.quickSetter(ring, 'y', 'px') as (v: number) => void;

    const onMove = (e: MouseEvent) => { mx.x = e.clientX; mx.y = e.clientY; dotX(e.clientX); dotY(e.clientY); };
    const onDown = () => gsap.to(dot,  { scale: 2.8, duration: 0.12, ease: 'power2.out', overwrite: true });
    const onUp   = () => gsap.to(dot,  { scale: 1,   duration: 0.5,  ease: 'elastic.out(1,0.45)', overwrite: true });

    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      rp.x = lerp(rp.x, mx.x, 0.1); rp.y = lerp(rp.y, mx.y, 0.1);
      ringX(rp.x); ringY(rp.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => {
      gsap.to(ring, { scale: 1.7, borderColor: 'rgba(201,168,76,.85)', duration: 0.36, ease: 'power2.out' });
      gsap.to(dot,  { scale: 0.25, duration: 0.25, ease: 'power2.out' });
    };
    const onLeave = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(255,255,255,.38)', duration: 0.4, ease: 'power2.out' });
      gsap.to(dot,  { scale: 1, duration: 0.4,  ease: 'elastic.out(1,0.45)' });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    const iels = document.querySelectorAll('button,a,input,[data-cursor]');
    iels.forEach(el => { el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave); });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      iels.forEach(el => { el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave); });
    };
  }, []);

  /* ── Lenis smooth scroll + velocity warp + progress bar ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    } as ConstructorParameters<typeof Lenis>[0]);

    lenis.on('scroll', ScrollTrigger.update);

    lenis.on('scroll', (e: { velocity: number; progress: number }) => {
      /* Progress bar */
      if (progressBarRef.current)
        progressBarRef.current.style.width = `${(e.progress ?? 0) * 100}%`;
      /* Velocity warp on main content */
      const vel = e.velocity ?? 0;
      const skew = Math.min(Math.max(vel * 0.028, -1.4), 1.4);
      gsap.to('.lp-vel-warp', { skewY: skew, duration: 0.35, ease: 'none', overwrite: 'auto' });
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => setShowFloat(window.scrollY > 240);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* ── Hero mouse parallax ── */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia('(pointer: coarse)').matches) return;
    const qBgX = gsap.quickTo('.lp-hero-bg',      'x', { duration: 1.6, ease: 'power2.out' });
    const qBgY = gsap.quickTo('.lp-hero-bg',      'y', { duration: 1.6, ease: 'power2.out' });
    const qCX  = gsap.quickTo('.lp-hero-content', 'x', { duration: 1.1, ease: 'power2.out' });
    const qCY  = gsap.quickTo('.lp-hero-content', 'y', { duration: 1.1, ease: 'power2.out' });
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) / rect.width;
      const y = (e.clientY - rect.top  - rect.height / 2) / rect.height;
      qBgX(x * -32); qBgY(y * -20);
      qCX (x *  10); qCY (y *   7);
    };
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  /* ── Magnetic buttons ── */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.lp-magnetic'));
    const cleanups: (() => void)[] = [];
    els.forEach(el => {
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width/2) * 0.38, y: (e.clientY - r.top - r.height/2) * 0.38, duration: 0.55, ease: 'power2.out' });
      };
      const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); });
    });
    return () => cleanups.forEach(fn => fn());
  }, [introVisible]);

  /* ── GSAP: intro + hero reveal + scroll triggers + stat counters ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const startHero = (delay: number) => {
        gsap.fromTo('.lp-word',
          { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.12, stagger: 0.072, ease: 'power4.out', delay }
        );
        gsap.timeline({ delay: delay + 0.25 })
          .fromTo('.lp-tag',     { opacity: 0, y: 12  }, { opacity: 1, y: 0, duration: 0.7,  ease: 'power4.out' }, 0)
          .fromTo('.lp-divider', { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.78, ease: 'power4.out', transformOrigin: 'left' }, 0.62)
          .fromTo('.lp-sub',     { opacity: 0, y: 18  }, { opacity: 1, y: 0, duration: 0.88, ease: 'power4.out' }, 0.76)
          .fromTo('.lp-cta-btn', { opacity: 0, y: 14  }, { opacity: 1, y: 0, duration: 0.78, ease: 'power4.out' }, 1.02)
          .fromTo('.lp-stat',    { opacity: 0, y: 10  }, { opacity: 1, y: 0, duration: 0.58, stagger: 0.1, ease: 'power3.out' }, 1.3);
      };

      if (reduced) {
        setIntroVisible(false); startHero(0.2);
      } else {
        gsap.set('.lp-intro-kle', { yPercent: 108 });
        gsap.set(['.lp-intro-over', '.lp-intro-sub'], { opacity: 0, y: 8 });
        gsap.set('.lp-intro-line', { scaleX: 0, transformOrigin: 'center' });
        gsap.timeline({
          onComplete: () => { startHero(0.14); setTimeout(() => setIntroVisible(false), 380); },
        })
          .to('.lp-intro-over',    { opacity: 1, y: 0,     duration: 0.6,  ease: 'power3.out' }, 0.28)
          .to('.lp-intro-kle',     { yPercent: 0,          duration: 1.0,  ease: 'power4.out' }, 0.52)
          .to('.lp-intro-line',    { scaleX: 1,            duration: 0.72, ease: 'power4.out' }, 1.15)
          .to('.lp-intro-sub',     { opacity: 1, y: 0,     duration: 0.6,  ease: 'power3.out' }, 1.44)
          .to('.lp-intro-content', { opacity: 0,           duration: 0.38, ease: 'power2.in'  }, 2.55)
          .to('.lp-curtain-top',   { y: '-101%',           duration: 0.92, ease: 'expo.inOut' }, 2.66)
          .to('.lp-curtain-bot',   { y: '101%',            duration: 0.92, ease: 'expo.inOut' }, 2.66);
        gsap.to('.lp-hero-bg', {
          yPercent: 18, ease: 'none',
          scrollTrigger: { trigger: '.lp-hero', start: 'top top', end: 'bottom top', scrub: 1.8 },
        });
      }

      /* Clip-path section reveals */
      gsap.utils.toArray<HTMLElement>('.lp-clip').forEach(el =>
        gsap.fromTo(el,
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: 1.0, ease: 'power4.inOut', clearProps: 'clipPath',
            scrollTrigger: { trigger: el, start: 'top 87%' } }
        )
      );

      /* Fade+y reveals */
      gsap.utils.toArray<HTMLElement>('.lp-reveal').forEach(el =>
        gsap.fromTo(el, { opacity: 0, y: 32 }, {
          opacity: 1, y: 0, duration: 0.95, ease: 'power4.out', clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        })
      );

      /* Stagger children reveals */
      gsap.utils.toArray<HTMLElement>('.lp-stagger').forEach(wrap =>
        gsap.fromTo(Array.from(wrap.children), { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.86, stagger: 0.11, ease: 'power4.out', clearProps: 'transform',
          scrollTrigger: { trigger: wrap, start: 'top 87%', toggleActions: 'play none none none' },
        })
      );

      /* Animated stat counters */
      STATS.forEach(({ target, suffix }, i) => {
        const el = document.querySelector<HTMLElement>(`.lp-stat-num-${i}`);
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2.0, ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: () => { el.textContent = String(Math.round(obj.val)) + suffix; },
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        });
      });

    }, pageRef);
    return () => ctx.revert();
  }, []);

  /* Handlers */
  const advanceName = () => { if (!name.trim()) return; setDir(1); setStep(2); };
  const advancePhone = () => {
    if (!/^\d{10}$/.test(phone)) { setPhoneError('Enter a valid 10-digit number'); return; }
    setPhoneError(''); setDir(1); setStep(3);
  };
  const selectCourse = async (val: string) => {
    setSubmitting(true);
    await saveLead({ name: name.trim(), phone, course: val });
    setSubmitting(false); setDir(1); setStep('done');
    setTimeout(() => window.open(
      `https://wa.me/${WA}?text=${encodeURIComponent(`Hi! I'm ${name.trim()}. Interested in ${val} at KLE Hotel Management, Belagavi. My number is ${phone}.`)}`,
      '_blank'
    ), 1800);
  };
  const scrollToForm = () => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });

  const sv = {
    enter: (d: number) => ({ x: d > 0 ? 64 : -64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -64 : 64, opacity: 0 }),
  };
  const st = { duration: 0.46, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] };
  const currentStepNum = step === 'done' ? 3 : (step as number);

  /* ─────────────────────────── JSX ─────────────────────────── */
  return (
    <div ref={pageRef} className="lp-page" style={{ background: '#080808', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 300, overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

        /* Hide native cursor on fine-pointer devices */
        @media (pointer: fine) { .lp-page, .lp-page * { cursor: none !important } }

        /* ── Custom cursor ── */
        .lp-cursor-dot {
          position: fixed; width: 7px; height: 7px; border-radius: 50%;
          background: #C9A84C; pointer-events: none; z-index: 99999;
          transform: translate(-50%,-50%); will-change: transform;
          mix-blend-mode: difference;
        }
        .lp-cursor-ring {
          position: fixed; width: 38px; height: 38px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.38); pointer-events: none;
          z-index: 99998; transform: translate(-50%,-50%); will-change: transform;
        }
        @media (pointer: coarse) { .lp-cursor-dot, .lp-cursor-ring { display: none } }

        /* ── Scroll progress bar ── */
        .lp-progress-bar {
          position: fixed; top: 0; left: 0; height: 2px; width: 0%;
          background: linear-gradient(90deg, #C9A84C 0%, #FFD987 60%, #C9A84C 100%);
          z-index: 99997; pointer-events: none;
          box-shadow: 0 0 12px rgba(201,168,76,.55);
          transition: none;
        }

        /* ── Film grain ── */
        .lp-grain {
          position: fixed; inset: -100%; width: 300%; height: 300%;
          z-index: 9997; pointer-events: none; opacity: 0.028;
          background-repeat: repeat; background-size: 300px 300px;
          animation: lp-grain-move 0.45s steps(1) infinite; will-change: transform;
        }
        @keyframes lp-grain-move {
          0%,100% { transform: translate(0,0) }
          20%  { transform: translate(-5%,-5%) }
          40%  { transform: translate(5%,5%) }
          60%  { transform: translate(-3%,3%) }
          80%  { transform: translate(3%,-3%) }
        }

        /* ── Velocity warp wrapper ── */
        .lp-vel-warp { will-change: transform; transform-origin: center top }
        @media (prefers-reduced-motion: reduce) { .lp-vel-warp { transform: none !important } }

        /* ── Curtains ── */
        .lp-curtain-top, .lp-curtain-bot { will-change: transform }
        .lp-intro-kle-outer { overflow: hidden; line-height: .9 }

        /* ── Hero zoom ── */
        @keyframes lp-hero-zoom { from { transform: scale(1) } to { transform: scale(1.07) } }

        /* ── Sweep ── */
        @keyframes lp-sweep {
          from { transform: translateX(-100%) skewX(-12deg) }
          to   { transform: translateX(700%) skewX(-12deg) }
        }

        /* ── Badge breathe ── */
        @keyframes lp-badge-breathe {
          0%,100% { box-shadow: none; border-color: rgba(201,168,76,.25) }
          50% { box-shadow: 0 0 24px 4px rgba(201,168,76,.1); border-color: rgba(201,168,76,.72) }
        }
        .lp-badge-breathe { animation: lp-badge-breathe 4s ease-in-out infinite }

        /* ── Word reveal ── */
        .lp-word-outer { display: inline-block; overflow: hidden; vertical-align: bottom }
        .lp-word { display: inline-block }

        /* ── Stats responsive ── */
        @media (min-width: 600px) {
          .lp-stats-grid { grid-template-columns: repeat(4,1fr) !important }
          .lp-stat { border-bottom: none !important }
        }

        /* ── Form spotlight (CSS var updated via JS) ── */
        .lp-form-section {
          --mx: 50%; --my: 50%;
        }

        /* ── Step input ── */
        .lp-step-input {
          width: 100%; background: transparent; border: none;
          border-bottom: 1.5px solid rgba(255,255,255,.16);
          color: #fff; font-family: Inter, sans-serif; font-size: 1.3rem; font-weight: 300;
          padding: .65rem 0; outline: none; transition: border-color .4s ease; -webkit-appearance: none;
        }
        .lp-step-input:focus { border-bottom-color: #C9A84C }
        .lp-step-input::placeholder { color: rgba(255,255,255,.18); font-size: .98rem }

        /* ── Next button ── */
        .lp-btn-next {
          width: 52px; height: 52px; border-radius: 50%; background: #C9A84C;
          border: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease;
        }
        .lp-btn-next:hover:not(:disabled) { transform: scale(1.14); box-shadow: 0 7px 32px rgba(201,168,76,.48) }
        .lp-btn-next:disabled { opacity: .24 }

        /* ── Course cards ── */
        .lp-course-card {
          width: 100%; text-align: left; padding: 1.05rem 1.25rem;
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          color: #fff;
          transition: border-color .35s ease, background .35s ease, transform .48s cubic-bezier(.16,1,.3,1);
          position: relative; overflow: hidden;
        }
        .lp-course-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(201,168,76,.04) 100%);
          transform: translateX(-100%); transition: transform .5s cubic-bezier(.16,1,.3,1);
        }
        .lp-course-card:hover::after { transform: translateX(0) }
        .lp-course-card:hover { border-color: rgba(201,168,76,.6); background: rgba(201,168,76,.065); transform: translateX(6px) }

        /* ── Highlight rows ── */
        .lp-hl {
          display: flex; align-items: flex-start; gap: 1rem; padding: 1.2rem 1.15rem;
          background: rgba(255,255,255,.022); border: 1px solid rgba(201,168,76,.06);
          transition: border-color .4s ease, background .4s ease, transform .48s cubic-bezier(.16,1,.3,1);
        }
        .lp-hl:hover { border-color: rgba(201,168,76,.36); transform: translateX(5px); background: rgba(201,168,76,.028) }

        /* ── Partners marquee ── */
        @keyframes lp-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .lp-marquee-track {
          display: flex; width: max-content;
          animation: lp-marquee 28s linear infinite; will-change: transform;
        }
        .lp-marquee-track:hover { animation-play-state: paused }
        .lp-marquee-item {
          padding: 0 2.75rem; font-size: .64rem; letter-spacing: .15em;
          text-transform: uppercase; color: rgba(255,255,255,.24); white-space: nowrap; transition: color .3s ease;
        }
        .lp-marquee-item:hover { color: rgba(201,168,76,.7) }

        /* ── Submit CTA ── */
        .lp-submit {
          background: #C9A84C; color: #080808; font-weight: 700; font-size: .74rem;
          letter-spacing: .18em; text-transform: uppercase; border: none;
          display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
          transition: background .35s, transform .48s cubic-bezier(.16,1,.3,1), box-shadow .48s;
          position: relative; overflow: hidden;
        }
        .lp-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%);
          transform: translateX(-100%); transition: transform .6s ease;
        }
        .lp-submit:hover::before { transform: translateX(100%) }
        .lp-submit:hover { background: #B89038; transform: translateY(-2px); box-shadow: 0 12px 38px rgba(201,168,76,.32) }

        /* ── Action buttons ── */
        .lp-wa-btn {
          display: flex; align-items: center; justify-content: center; gap: .65rem;
          padding: 1.15rem; background: #25D366; color: #fff; font-weight: 600; font-size: .8rem;
          text-decoration: none; letter-spacing: .07em;
          transition: background .3s, transform .48s cubic-bezier(.16,1,.3,1), box-shadow .48s;
        }
        .lp-wa-btn:hover { background: #1DB954; transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,211,102,.36) }
        .lp-ghost-btn {
          display: flex; align-items: center; justify-content: center; gap: .65rem;
          padding: 1.15rem; background: transparent; border: 1px solid rgba(255,255,255,.12);
          color: rgba(255,255,255,.5); font-weight: 500; font-size: .8rem;
          text-decoration: none; letter-spacing: .07em;
          transition: border-color .35s, color .35s, transform .48s cubic-bezier(.16,1,.3,1);
        }
        .lp-ghost-btn:hover { border-color: rgba(201,168,76,.45); color: rgba(255,255,255,.82); transform: translateY(-1px) }

        /* ── FAB ── */
        @keyframes lp-wa-glow {
          0%,100% { box-shadow: 0 4px 22px rgba(37,211,102,.38) }
          50% { box-shadow: 0 6px 40px rgba(37,211,102,.65), 0 0 0 8px rgba(37,211,102,.07) }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lp-badge-breathe, .lp-marquee-track { animation: none !important }
          .lp-course-card:hover, .lp-hl:hover, .lp-btn-next:hover,
          .lp-wa-btn:hover, .lp-ghost-btn:hover, .lp-submit:hover { transform: none !important }
          .lp-grain { animation: none !important }
        }
      `}</style>

      {/* ── Film grain ── */}
      <div ref={grainRef} className="lp-grain" aria-hidden="true" />

      {/* ── Custom cursor ── */}
      <div ref={cursorDotRef}  className="lp-cursor-dot"  aria-hidden="true" />
      <div ref={cursorRingRef} className="lp-cursor-ring" aria-hidden="true" />

      {/* ── Scroll progress bar ── */}
      <div ref={progressBarRef} className="lp-progress-bar" aria-hidden="true" />

      {/* ═══════════════════ CINEMATIC INTRO ═══════════════════ */}
      {introVisible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '60vw', height: '60vw', maxWidth: 520, maxHeight: 520, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse, rgba(201,168,76,.07) 0%, transparent 68%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(50% - .5px)', height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,.5) 18%, rgba(201,168,76,.5) 82%, transparent 100%)' }} />
          <div className="lp-curtain-top" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '51%', background: '#080808' }} />
          <div className="lp-curtain-bot" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '51%', background: '#080808' }} />
          <div className="lp-intro-content" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.9rem', zIndex: 2 }}>
            <p className="lp-intro-over" style={{ fontSize: '.5rem', letterSpacing: '.36em', textTransform: 'uppercase', color: 'rgba(201,168,76,.7)', fontFamily: 'Inter, sans-serif' }}>Est. 1997 &middot; Belagavi, Karnataka</p>
            <div className="lp-intro-kle-outer">
              <h1 className="lp-intro-kle" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(5.5rem,18vw,10.5rem)', color: '#fff', lineHeight: .9, letterSpacing: '-.03em' }}>KLE</h1>
            </div>
            <div className="lp-intro-line" style={{ width: 64, height: 1, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
            <p className="lp-intro-sub" style={{ fontSize: '.58rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.34)' }}>Hotel Management</p>
          </div>
        </div>
      )}

      {/* ════════════ VELOCITY WARP WRAPPER (all scrollable content) ════════════ */}
      <div className="lp-vel-warp">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section ref={heroRef} className="lp-hero" style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <div className="lp-hero-bg" style={{ position: 'absolute', inset: '-20% 0', willChange: 'transform' }}>
          <img src="/images/campus.jpg" alt="KLE Campus" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', animation: 'lp-hero-zoom 18s ease-out forwards' }} loading="eager" fetchPriority="high" />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(8,8,8,.72) 0%, rgba(8,8,8,.28) 30%, rgba(8,8,8,.84) 66%, rgba(8,8,8,1) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,.045) 0%, transparent 65%)' }} />
        </div>
        {/* Light sweep */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '20%', background: 'linear-gradient(108deg, transparent 0%, rgba(255,255,255,.012) 50%, transparent 100%)', animation: 'lp-sweep 3.8s ease-in-out 1.5s both' }} />
        </div>
        {/* Content */}
        <div className="lp-hero-content" style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', width: '100%', padding: '0 1.25rem', willChange: 'transform' }}>
          <div className="lp-tag lp-badge-breathe" style={{ opacity: 0, display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.4rem 1.05rem', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.28)', marginBottom: '1.6rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', display: 'inline-block' }} />
            <span style={{ fontSize: '.54rem', letterSpacing: '.24em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Admissions Open — 2026 Batch</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, lineHeight: 1.04, fontSize: 'clamp(2.6rem,8vw,5.4rem)', color: '#fff', marginBottom: '1.5rem' }}>
            {['Your','Career','in'].map((w, i) => (
              <span key={i} className="lp-word-outer" style={{ marginRight: '.26em' }}>
                <span className="lp-word">{w}</span>
              </span>
            ))}
            <br />
            {[['Hospitality', true],['Starts', false],['Here', false]].map(([w, gold], i) => (
              <span key={i} className="lp-word-outer" style={{ marginRight: '.22em' }}>
                <em className="lp-word" style={{ fontStyle: 'italic', color: gold ? '#C9A84C' : '#fff' }}>{w as string}</em>
              </span>
            ))}
          </h1>
          <div className="lp-divider" style={{ opacity: 0, width: 48, height: 1, background: 'linear-gradient(90deg, #C9A84C, transparent)', marginBottom: '1.15rem', transformOrigin: 'left' }} />
          <p className="lp-sub" style={{ opacity: 0, fontSize: 'clamp(.88rem,2.4vw,1rem)', fontWeight: 300, color: 'rgba(255,255,255,.5)', maxWidth: 400, lineHeight: 1.9, marginBottom: '2.2rem' }}>
            KLE Graduate School of Hotel Management, Belagavi — empowering students to lead the global hospitality industry since 1997.
          </p>
          <div className="lp-cta-btn" style={{ opacity: 0, marginBottom: '4.5rem' }}>
            <button className="lp-submit lp-magnetic" style={{ width: 'auto', padding: '.95rem 2.4rem' }} onClick={scrollToForm}>
              Apply for 2026 Batch <ArrowRight size={14} />
            </button>
          </div>
        </div>
        {/* Stats bar */}
        <div style={{ position: 'relative', zIndex: 10, background: 'rgba(4,4,4,.88)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(201,168,76,.1)' }}>
          <div className="lp-stats-grid" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}>
            {STATS.map((s, i) => (
              <div key={i} className="lp-stat" style={{ opacity: 0, padding: '1.25rem .75rem', textAlign: 'center', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,.05)' : 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                <p className={`lp-stat-num-${i}`} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.9rem', fontWeight: 300, color: '#C9A84C', lineHeight: 1 }}>0{s.suffix}</p>
                <p style={{ fontSize: '.5rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.27)', marginTop: '.3rem' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Scroll chevron */}
        <motion.div style={{ position: 'absolute', bottom: 116, left: '50%', x: '-50%', zIndex: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.6, duration: 1.2 }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={16} style={{ color: 'rgba(201,168,76,.3)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═════════════════ MULTI-STEP FORM ═════════════════ */}
      <section
        ref={formRef} id="lead-form" className="lp-form-section"
        style={{ position: 'relative', padding: '5.5rem 1.25rem 5.5rem', background: '#0C0C0C' }}
        onMouseMove={e => {
          if (!formRef.current) return;
          const r = formRef.current.getBoundingClientRect();
          formRef.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
          formRef.current.style.setProperty('--my', `${e.clientY - r.top}px`);
        }}
      >
        {/* Fade-in top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5rem', background: 'linear-gradient(to bottom, #080808, transparent)', pointerEvents: 'none', zIndex: 1 }} />
        {/* Mouse spotlight */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(700px circle at var(--mx, 50%) var(--my, 50%), rgba(201,168,76,.038), transparent 60%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 420, margin: '0 auto' }}>
          <div className="lp-clip" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '.52rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,.58)', fontWeight: 500 }}>Admission 2026</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.9rem,5vw,2.6rem)', lineHeight: 1.1, marginTop: '.5rem' }}>
              Begin Your <em style={{ color: '#C9A84C' }}>Journey</em>
            </h2>
          </div>
          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: '2.75rem' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                width: currentStepNum === i ? 22 : 6, height: 6, borderRadius: 3,
                background: currentStepNum >= i ? '#C9A84C' : 'rgba(255,255,255,.14)',
                transition: 'all .55s cubic-bezier(.16,1,.3,1)',
              }} />
            ))}
          </div>
          {/* Steps */}
          <div style={{ position: 'relative', minHeight: 310, overflow: 'hidden' }}>
            <AnimatePresence custom={dir} mode="wait">
              {step === 1 && (
                <motion.div key="s1" custom={dir} variants={sv} initial="enter" animate="center" exit="exit" transition={st} style={{ width: '100%' }}>
                  <p style={{ fontSize: '.54rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.1rem', fontWeight: 500 }}>Step 1 of 3 &nbsp;&middot;&nbsp; About You</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,5vw,2.25rem)', lineHeight: 1.2, marginBottom: '2rem' }}>What&apos;s your<br />name?</h3>
                  <input ref={nameRef} className="lp-step-input" type="text" value={name}
                    onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && advanceName()}
                    placeholder="Your full name" autoComplete="name" style={{ marginBottom: '2.5rem' }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="lp-btn-next lp-magnetic" onClick={advanceName} disabled={!name.trim()} aria-label="Continue">
                      <ArrowRight size={20} color="#080808" />
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" custom={dir} variants={sv} initial="enter" animate="center" exit="exit" transition={st} style={{ width: '100%' }}>
                  <p style={{ fontSize: '.54rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.1rem', fontWeight: 500 }}>Step 2 of 3 &nbsp;&middot;&nbsp; Contact</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,5vw,2.25rem)', lineHeight: 1.2, marginBottom: '2rem' }}>
                    Hi {name.split(' ')[0]},<br />your WhatsApp?
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '.7rem', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 300, color: 'rgba(255,255,255,.35)', flexShrink: 0 }}>+91</span>
                    <input ref={phoneRef} className="lp-step-input" type="tel" value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g,'').slice(0,10)); setPhoneError(''); }}
                      onKeyDown={e => e.key === 'Enter' && advancePhone()}
                      placeholder="10-digit number" inputMode="numeric" autoComplete="tel" style={{ flex: 1 }} />
                  </div>
                  {phoneError && <p style={{ fontSize: '.74rem', color: '#f87171', marginBottom: '.5rem' }}>{phoneError}</p>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                    <button className="lp-btn-next lp-magnetic" onClick={advancePhone} disabled={phone.length !== 10} aria-label="Continue">
                      <ArrowRight size={20} color="#080808" />
                    </button>
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" custom={dir} variants={sv} initial="enter" animate="center" exit="exit" transition={st} style={{ width: '100%' }}>
                  <p style={{ fontSize: '.54rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.1rem', fontWeight: 500 }}>Step 3 of 3 &nbsp;&middot;&nbsp; Your Interest</p>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.65rem,4.8vw,2.1rem)', lineHeight: 1.2, marginBottom: '1.75rem' }}>
                    Which program,<br />{name.split(' ')[0]}?
                  </h3>
                  {submitting ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
                      <motion.div style={{ width: 32, height: 32, border: '2px solid rgba(201,168,76,.2)', borderTopColor: '#C9A84C', borderRadius: '50%' }}
                        animate={{ rotate: 360 }} transition={{ duration: .7, repeat: Infinity, ease: 'linear' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.52rem' }}>
                      {COURSES.map(c => (
                        <button key={c.val} className="lp-course-card" onClick={() => selectCourse(c.val)}>
                          <span style={{ fontSize: '.9rem', fontWeight: 500, color: '#fff', display: 'block' }}>{c.label}</span>
                          <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.36)', marginTop: '.16rem', display: 'block' }}>{c.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {step === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .64, ease: [0.16,1,0.3,1] }} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 18, delay: .14 }}>
                    <CheckCircle size={52} style={{ color: '#C9A84C', margin: '0 auto 1.5rem', display: 'block' }} />
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: .7, ease: [0.16,1,0.3,1] }}
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: '1.9rem', marginBottom: '.7rem' }}>
                    You&apos;re in, {name.split(' ')[0]}!
                  </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45, duration: .7, ease: [0.16,1,0.3,1] }}
                    style={{ color: 'rgba(255,255,255,.44)', fontSize: '.88rem', lineHeight: 1.76, marginBottom: '1rem' }}>
                    Your details are saved. Our admissions team will contact <strong style={{ color: '#fff' }}>+91&#8209;{phone}</strong> within 24 hours.
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7, duration: .8 }}
                    style={{ fontSize: '.64rem', color: 'rgba(201,168,76,.48)', letterSpacing: '.06em' }}>
                    Opening WhatsApp for instant assistance...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
          <div className="lp-clip" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '.54rem', letterSpacing: '.26em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Why 2000+ Alumni Chose KLE</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.65rem,4vw,2.4rem)', marginTop: '.62rem', lineHeight: 1.15 }}>
              Built for the <em style={{ color: '#C9A84C' }}>Real World</em>
            </h2>
          </div>
          <div className="lp-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '.62rem' }}>
            {[
              'AICTE approved · Affiliated to KLE University since 1997',
              '6–12 month paid industrial training at Taj, ITC, Marriott & 50+ five-star properties',
              "Expert faculty with first-hand hotel operations experience at India's top properties",
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
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want admission details for KLE Hotel Management, Belagavi.')}`} target="_blank" rel="noopener noreferrer" className="lp-wa-btn lp-magnetic">
              <MessageSquare size={17} /> Chat on WhatsApp
            </a>
            <a href="https://www.klehotelmanagement.edu.in" target="_blank" rel="noopener noreferrer" className="lp-ghost-btn">
              <ExternalLink size={14} /> Explore Full Website
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
          &copy; {new Date().getFullYear()} KLE Graduate School of Hotel Management &amp; Catering Technology, Belagavi.
        </p>
      </footer>

      </div>{/* end lp-vel-warp */}

      {/* ═══════════════════ FLOATING FAB ═══════════════════ */}
      <AnimatePresence>
        {showFloat && (
          <motion.a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to know about KLE Hotel Management admissions.')}`}
            target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, scale: .45 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .45 }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: .92 }}
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
