import { useState, useEffect, useRef, type FormEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, CheckCircle, MessageSquare, ExternalLink,
  ChefHat, Coffee, ConciergeBell, Sparkles,
  ArrowRight, Shield, TrendingUp, Globe, Star,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WA = '916364504056';

const STATS = [
  { value: '26+', label: 'Years', sub: 'of Excellence' },
  { value: '2000+', label: 'Alumni', sub: 'Placed Globally' },
  { value: '50+', label: 'Hotel', sub: 'Partners' },
  { value: '100%', label: 'Placement', sub: 'Assistance' },
];

const PROGRAMS = [
  { image: '/images/campus.jpg',       title: 'Hotel Management',     sub: 'Operations & Leadership',    Icon: ConciergeBell, val: 'B.Sc Hotel Management' },
  { image: '/images/front-office.jpg', title: 'Food Production',      sub: 'Culinary & Gastronomy',      Icon: ChefHat,       val: 'B.Sc Food Production' },
  { image: '/images/team.jpg',         title: 'Food & Beverage',      sub: 'Service & Management',       Icon: Coffee,        val: 'B.Sc Food & Beverage' },
  { image: '/images/campus.jpg',       title: 'Tourism Management',   sub: 'Travel & Hospitality',       Icon: Sparkles,      val: 'B.Sc Tourism Management' },
];

const HIGHLIGHTS = [
  'AICTE approved program with 26+ years of industry excellence',
  '6–12 month industrial training at 5-star properties in India & abroad',
  'Expert faculty with real-world hotel experience from Taj, ITC, Marriott',
];

const COURSES = [
  'B.Sc Hotel Management',
  'B.Sc Food Production',
  'B.Sc Food & Beverage',
  'B.Sc Tourism Management',
  'Diploma in Hotel Management',
];

const PARTNERS = [
  'Taj Hotels', 'ITC Hotels', 'Marriott', 'Hyatt', 'Hilton',
  'Oberoi', 'Leela', 'Radisson', 'AccorHotels', 'Club Mahindra',
  'OYO Rooms', 'Lemon Tree',
];

const METRICS = [
  { label: '100%', sub: 'Placement rate', Icon: TrendingUp },
  { label: 'Global',  sub: 'Opportunities', Icon: Globe },
  { label: '5-Star',  sub: 'Partners',      Icon: Star },
];

export default function LandingPage() {
  const [form, setForm] = useState({ name: '', phone: '', course: '', city: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showFloat, setShowFloat] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const startHero = (delay: number) => {
        gsap.fromTo('.lp-word',
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.065, ease: 'power4.out', delay }
        );
        const tl = gsap.timeline({ delay: delay + 0.22 });
        tl.fromTo('.lp-tag',     { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power4.out' }, 0)
          .fromTo('.lp-divider', { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power4.out', transformOrigin: 'left' }, 0.6)
          .fromTo('.lp-sub',     { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' }, 0.72)
          .fromTo('.lp-cta-btn', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }, 0.96)
          .fromTo('.lp-stat',    { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: 'power3.out' }, 1.22);
      };

      if (reduced) {
        setIntroVisible(false);
        startHero(0.2);
      } else {
        // Set initial hidden states for intro elements
        gsap.set('.lp-intro-kle',  { yPercent: 108 });
        gsap.set(['.lp-intro-over', '.lp-intro-sub'], { opacity: 0, y: 8 });
        gsap.set('.lp-intro-line', { scaleX: 0, transformOrigin: 'center' });

        const intro = gsap.timeline({
          onComplete: () => {
            startHero(0.15);
            setTimeout(() => setIntroVisible(false), 400);
          },
        });
        intro
          .to('.lp-intro-over',    { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.28)
          .to('.lp-intro-kle',     { yPercent: 0, duration: 1.0, ease: 'power4.out' }, 0.52)
          .to('.lp-intro-line',    { scaleX: 1, duration: 0.72, ease: 'power4.out' }, 1.14)
          .to('.lp-intro-sub',     { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 1.42)
          .to('.lp-intro-content', { opacity: 0, duration: 0.38, ease: 'power2.in' }, 2.52)
          .to('.lp-curtain-top',   { y: '-101%', duration: 0.92, ease: 'expo.inOut' }, 2.64)
          .to('.lp-curtain-bot',   { y: '101%',  duration: 0.92, ease: 'expo.inOut' }, 2.64);
      }

      if (!reduced) {
        // Hero bg parallax
        gsap.to('.lp-hero-bg', {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: { trigger: '.lp-hero', start: 'top top', end: 'bottom top', scrub: 1.6 },
        });

        // Trust image parallax
        gsap.to('.lp-trust-img', {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: { trigger: '.lp-trust-sec', start: 'top bottom', end: 'bottom top', scrub: 1.3 },
        });

        // Placement image parallax
        gsap.to('.lp-place-img', {
          yPercent: 13,
          ease: 'none',
          scrollTrigger: { trigger: '.lp-place-sec', start: 'top bottom', end: 'bottom top', scrub: 1.3 },
        });
      }

      // Section reveals
      gsap.utils.toArray<HTMLElement>('.lp-reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 0.95, ease: 'power4.out', clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.lp-stagger').forEach((wrap) => {
        gsap.fromTo(Array.from(wrap.children),
          { opacity: 0, y: 26 },
          {
            opacity: 1, y: 0, duration: 0.88, stagger: 0.11, ease: 'power4.out', clearProps: 'transform',
            scrollTrigger: { trigger: wrap, start: 'top 85%', toggleActions: 'play none none none' },
          }
        );
      });
    }, pageRef);

    const onScroll = () => setShowFloat(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { ctx.revert(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const pickProgram = (val: string) => {
    setForm(f => ({ ...f, course: val }));
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToForm = () =>
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const leads = JSON.parse(localStorage.getItem('kle_leads') || '[]');
      leads.push({ ...form, ts: new Date().toISOString(), src: 'landing' });
      localStorage.setItem('kle_leads', JSON.stringify(leads));
    } catch {/* private browsing */}
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      window.open(
        `https://wa.me/${WA}?text=${encodeURIComponent(`Hi, I'm ${form.name}. I'm interested in ${form.course || 'Hotel Management'} at KLE. My number is ${form.phone}. City: ${form.city || 'Not specified'}.`)}`,
        '_blank'
      );
    }, 1600);
  };

  return (
    <div ref={pageRef} style={{ background: '#0A0A0A', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
      {/* ─────────────────── CINEMATIC INTRO ─────────────────── */}
      {introVisible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
          {/* Ambient radial glow at center — only visible between curtains as they part */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: '60vw', height: '60vw', maxWidth: '520px', maxHeight: '520px',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(ellipse, rgba(201,168,76,.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {/* Gold seam hairline — flashes as curtains part */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(50% - 0.5px)', height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,.55) 18%, rgba(201,168,76,.55) 82%, transparent 100%)',
          }} />
          {/* Top curtain */}
          <div className="lp-curtain-top" style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '51%',
            background: '#0A0A0A',
          }} />
          {/* Bottom curtain */}
          <div className="lp-curtain-bot" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '51%',
            background: '#0A0A0A',
          }} />
          {/* Center logo content — sits above both curtains */}
          <div className="lp-intro-content" style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '1.1rem', zIndex: 2,
          }}>
            {/* Overline */}
            <p className="lp-intro-over" style={{
              fontSize: '.52rem', letterSpacing: '.34em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,.7)', fontFamily: 'Inter, sans-serif', fontWeight: 400,
            }}>Est. 1997 &middot; Belagavi, Karnataka</p>
            {/* KLE — clipped overflow for slide-up reveal */}
            <div className="lp-intro-kle-outer">
              <h1 className="lp-intro-kle" style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontWeight: 300,
                fontSize: 'clamp(5.5rem, 18vw, 10.5rem)',
                color: '#fff',
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
                display: 'block',
              }}>KLE</h1>
            </div>
            {/* Gold line */}
            <div className="lp-intro-line" style={{
              width: '64px', height: '1px',
              background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
            }} />
            {/* Subtitle */}
            <p className="lp-intro-sub" style={{
              fontSize: '.65rem', letterSpacing: '.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.4)', fontFamily: 'Inter, sans-serif', fontWeight: 300,
            }}>Hotel Management</p>
          </div>
        </div>
      )}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }

        /* ── Intro curtains ── */
        .lp-curtain-top, .lp-curtain-bot { will-change: transform; }
        .lp-intro-kle-outer { overflow: hidden; line-height: 0.92; }

        /* ── Intro ambient glow ── */
        @keyframes lp-intro-glow {
          0%,100% { opacity: 0 }
          50%     { opacity: 1 }
        }

        /* ── Hero image slow zoom ── */
        @keyframes lp-hero-zoom {
          from { transform: scale(1) }
          to   { transform: scale(1.058) }
        }

        /* ── Badge breathing glow ── */
        @keyframes lp-badge-breathe {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0);  border-color: rgba(201,168,76,.3) }
          50%     { box-shadow: 0 0 22px 5px rgba(201,168,76,.1); border-color: rgba(201,168,76,.7) }
        }
        .lp-badge-breathe { animation: lp-badge-breathe 3.8s ease-in-out infinite }

        /* ── Hero light sweep (once on load) ── */
        @keyframes lp-sweep {
          from { transform: translateX(-100%) skewX(-10deg) }
          to   { transform: translateX(550%)  skewX(-10deg) }
        }

        /* ── WhatsApp FAB glow pulse ── */
        @keyframes lp-wa-glow {
          0%,100% { box-shadow: 0 4px 22px rgba(37,211,102,.38) }
          50%     { box-shadow: 0 4px 36px rgba(37,211,102,.6), 0 0 0 7px rgba(37,211,102,.07) }
        }

        /* ── Word reveal ── */
        .lp-word-outer { display: inline-block; overflow: hidden; vertical-align: bottom }
        .lp-word       { display: inline-block }

        /* ── Inputs ── */
        .lp-inp {
          width: 100%;
          padding: .95rem 1.15rem;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.08);
          color: #fff;
          font-size: .88rem;
          font-family: Inter, sans-serif;
          font-weight: 300;
          outline: none;
          transition: border-color .35s ease, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease;
          -webkit-appearance: none; appearance: none;
          border-radius: 0;
        }
        .lp-inp:focus {
          border-color: rgba(201,168,76,.62) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(201,168,76,.07);
        }
        .lp-inp::placeholder { color: rgba(255,255,255,.22) }
        .lp-inp option       { background: #1A1A1A; color: #fff }

        /* ── Program cards ── */
        .lp-prog {
          overflow: hidden;
          position: relative;
          aspect-ratio: 4/5;
          cursor: pointer;
          border-radius: 2px;
          transition: transform .65s cubic-bezier(.16,1,.3,1), box-shadow .65s cubic-bezier(.16,1,.3,1);
        }
        .lp-prog:hover {
          transform: scale(1.028);
          box-shadow: 0 26px 60px rgba(0,0,0,.72), 0 0 0 1px rgba(201,168,76,.26);
        }
        .lp-prog img {
          width: 100%; height: 100%; object-fit: cover; object-position: left center; display: block;
          transition: transform .8s cubic-bezier(.16,1,.3,1);
          filter: brightness(.9);
        }
        .lp-prog:hover img { transform: scale(1.08); filter: brightness(.95) }
        .lp-prog .ov {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,.94) 0%, rgba(0,0,0,.32) 52%, rgba(0,0,0,.08) 100%);
          transition: background .45s ease;
        }
        .lp-prog:hover .ov {
          background: linear-gradient(to top, rgba(0,0,0,.97) 0%, rgba(0,0,0,.5) 52%, rgba(201,168,76,.06) 100%);
        }
        .lp-prog .gb {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, #C9A84C, transparent);
          transform: scaleX(0); transform-origin: center;
          transition: transform .55s cubic-bezier(.16,1,.3,1);
        }
        .lp-prog:hover .gb { transform: scaleX(1) }

        /* ── Highlight rows ── */
        .lp-hl {
          display: flex; align-items: flex-start; gap: 1.15rem;
          padding: 1.3rem 1.2rem;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(201,168,76,.07);
          border-radius: 2px;
          transition: border-color .4s ease, transform .45s cubic-bezier(.16,1,.3,1), background .4s ease;
        }
        .lp-hl:hover {
          border-color: rgba(201,168,76,.35);
          transform: translateX(5px);
          background: rgba(201,168,76,.025);
        }

        /* ── Partner tags ── */
        .lp-ptag {
          padding: .34rem .95rem;
          border: 1px solid rgba(255,255,255,.07);
          font-size: .68rem;
          color: rgba(255,255,255,.36);
          cursor: default;
          transition: border-color .4s ease, color .4s ease, transform .4s cubic-bezier(.16,1,.3,1);
        }
        .lp-ptag:hover {
          border-color: rgba(201,168,76,.42);
          color: rgba(255,255,255,.75);
          transform: translateY(-2px);
        }

        /* ── Submit button ── */
        .lp-submit {
          width: 100%;
          padding: 1.2rem;
          background: #C9A84C;
          color: #0A0A0A;
          font-weight: 700;
          font-size: .76rem;
          letter-spacing: .16em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .55rem;
          transition: background .35s ease, transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s ease;
          border-radius: 0;
        }
        .lp-submit:hover:not(:disabled) {
          background: #B89038;
          transform: translateY(-2px);
          box-shadow: 0 10px 34px rgba(201,168,76,.3);
        }
        .lp-submit:active:not(:disabled) {
          transform: scale(.98) translateY(0);
          box-shadow: none;
        }
        .lp-submit:disabled { opacity: .55; cursor: default }

        /* ── Responsive ── */
        @media (min-width: 600px) {
          .lp-stats    { grid-template-columns: repeat(4,1fr) !important }
          .lp-stat     { border-bottom: none !important }
          .lp-trust-grid { grid-template-columns: 1fr 1fr !important }
          .lp-prog-grid  { grid-template-columns: repeat(2,1fr) !important }
          .lp-act        { flex-direction: row !important }
        }
        @media (min-width: 1024px) {
          .lp-prog-grid { grid-template-columns: repeat(4,1fr) !important }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lp-badge-breathe { animation: none !important }
          .lp-prog { transition: box-shadow .3s ease !important }
          .lp-prog img { transition: none !important }
          .lp-hl  { transition: border-color .3s, background .3s !important; transform: none !important }
          .lp-ptag { transition: border-color .3s, color .3s !important; transform: none !important }
          .lp-submit { transition: background .25s !important; transform: none !important }
          .lp-inp:focus { transform: none !important }
        }
      `}</style>

      {/* ─────────────────── HERO ─────────────────── */}
      <section className="lp-hero" style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        {/* Background — CSS zoom + GSAP parallax */}
        <div className="lp-hero-bg" style={{ position: 'absolute', inset: '-18% 0', willChange: 'transform' }}>
          <img
            src="/images/campus.jpg"
            alt="KLE Campus"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', animation: 'lp-hero-zoom 14s ease-out forwards' }}
            loading="eager"
          />
          {/* Depth gradient layers */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,.62) 0%, rgba(10,10,10,.3) 28%, rgba(10,10,10,.84) 70%, rgba(10,10,10,1) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(201,168,76,.04) 0%, transparent 68%)' }} />
        </div>

        {/* Light sweep — fires once */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: '24%',
            background: 'linear-gradient(108deg, transparent 0%, rgba(255,255,255,.016) 50%, transparent 100%)',
            animation: 'lp-sweep 3.2s ease-in-out 1.4s both',
          }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '960px', margin: '0 auto', width: '100%', padding: '0 1.25rem' }}>
          {/* Urgency badge */}
          <div
            className="lp-tag lp-badge-breathe"
            style={{
              opacity: 0,
              display: 'inline-flex', alignItems: 'center', gap: '.55rem',
              padding: '.44rem 1.15rem',
              background: 'rgba(201,168,76,.06)',
              border: '1px solid rgba(201,168,76,.32)',
              marginBottom: '1.8rem',
            }}
          >
            <span style={{ fontSize: '.58rem', letterSpacing: '.24em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>
              Admissions Open Now
            </span>
          </div>

          {/* Headline — word-by-word reveal */}
          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontWeight: 300,
            lineHeight: 1.06,
            fontSize: 'clamp(2.4rem, 7.5vw, 5.2rem)',
            color: '#fff',
            marginBottom: '1.5rem',
          }}>
            {['Welcome', 'to'].map((w, i) => (
              <span key={i} className="lp-word-outer" style={{ marginRight: '.28em' }}>
                <span className="lp-word">{w}</span>
              </span>
            ))}
            <br />
            {['KLE', 'Hotel', 'Management'].map((w, i) => (
              <span key={i} className="lp-word-outer" style={{ marginRight: '.24em' }}>
                <em className="lp-word" style={{ fontStyle: 'italic', color: '#C9A84C' }}>{w}</em>
              </span>
            ))}
          </h1>

          {/* Gold divider */}
          <div className="lp-divider" style={{ opacity: 0, width: 52, height: 1, background: 'linear-gradient(90deg, #C9A84C, transparent)', marginBottom: '1.25rem', transformOrigin: 'left' }} />

          {/* Subtext */}
          <p className="lp-sub" style={{
            opacity: 0,
            fontSize: 'clamp(.88rem, 2.4vw, 1.05rem)',
            fontWeight: 300,
            color: 'rgba(255,255,255,.55)',
            maxWidth: '440px',
            lineHeight: 1.88,
            marginBottom: '2.4rem',
          }}>
            Your place in the world of hospitality. Industry-ready graduates with 100% placement support since 1997.
          </p>

          {/* CTA */}
          <div className="lp-cta-btn" style={{ opacity: 0, marginBottom: '4.5rem' }}>
            <button
              className="lp-submit"
              style={{ width: 'auto', padding: '1rem 2.6rem' }}
              onClick={scrollToForm}
            >
              Explore Opportunities <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: 'relative', zIndex: 10, background: 'rgba(6,6,6,.78)', backdropFilter: 'blur(32px)', borderTop: '1px solid rgba(201,168,76,.14)' }}>
          <div
            className="lp-stats"
            style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)' }}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                className="lp-stat"
                style={{
                  opacity: 0,
                  padding: '1.3rem .75rem',
                  textAlign: 'center',
                  borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,.05)' : 'none',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none',
                }}
              >
                <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.95rem', fontWeight: 300, color: '#C9A84C', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '.52rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginTop: '.32rem' }}>{s.label} {s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: 'absolute', bottom: 148, left: '50%', x: '-50%', zIndex: 10 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.2 }}
        >
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={17} style={{ color: 'rgba(201,168,76,.36)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────────── TRUST ─────────────────── */}
      <section className="lp-trust-sec" style={{ position: 'relative', padding: '5.5rem 1.25rem 5rem', background: '#111111' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5rem', background: 'linear-gradient(to bottom, #0A0A0A, transparent)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px', margin: '0 auto' }}>
          {/* Header */}
          <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center', marginBottom: '2.75rem' }}>
            <span style={{ fontSize: '.6rem', letterSpacing: '.26em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Why Choose Us</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,4vw,2.7rem)', marginTop: '.65rem', lineHeight: 1.15 }}>
              Build Your Career in <em style={{ color: '#C9A84C' }}>Hospitality</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,.42)', marginTop: '.9rem', fontSize: '.88rem', lineHeight: 1.78, maxWidth: '430px', margin: '.9rem auto 0' }}>
              Industry-ready training, real hotel experience, and expert faculty who have worked at 5-star properties.
            </p>
          </div>

          {/* Image + highlights */}
          <div className="lp-trust-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {/* Parallax image */}
            <div className="lp-reveal" style={{ opacity: 0, position: 'relative', overflow: 'hidden', aspectRatio: '16/9', borderRadius: '2px' }}>
              <div className="lp-trust-img" style={{ position: 'absolute', inset: '-16% 0', willChange: 'transform' }}>
                <img src="/images/team.jpg" alt="KLE Students" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(.9)', transform: 'scaleX(-1)' }} loading="lazy" />
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,.84) 0%, rgba(10,10,10,.38) 52%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: '1.6rem', left: '1.75rem' }}>
                <p style={{ fontSize: '.56rem', letterSpacing: '.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '.5rem' }}>Real Training</p>
                <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.2rem,2.6vw,1.7rem)', fontWeight: 300, lineHeight: 1.25 }}>Learn from<br />Industry Experts</p>
              </div>
            </div>

            <div className="lp-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="lp-hl">
                  <CheckCircle size={16} style={{ color: '#C9A84C', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontWeight: 400, fontSize: '.88rem', color: 'rgba(255,255,255,.82)', lineHeight: 1.6 }}>{h}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── PROGRAMS ─────────────────── */}
      <section style={{ position: 'relative', padding: '5.5rem 1.25rem 5rem', background: '#0A0A0A' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5rem', background: 'linear-gradient(to bottom, #111111, transparent)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px', margin: '0 auto' }}>
          <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center', marginBottom: '2.25rem' }}>
            <span style={{ fontSize: '.6rem', letterSpacing: '.26em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Programs</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,4vw,2.7rem)', marginTop: '.65rem' }}>
              Choose Your <em style={{ color: '#C9A84C' }}>Specialization</em>
            </h2>
            <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.28)', marginTop: '.45rem' }}>Tap any program to apply directly</p>
          </div>

          <div className="lp-prog-grid lp-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.7rem' }}>
            {PROGRAMS.map((p, i) => {
              const Icon = p.Icon;
              return (
                <div key={i} className="lp-prog" onClick={() => pickProgram(p.val)}>
                  <img src={p.image} alt={p.title} loading="lazy" />
                  <div className="ov" />
                  <div className="gb" />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.2rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.32rem', marginBottom: '.32rem' }}>
                      <Icon size={11} style={{ color: '#C9A84C' }} />
                      <span style={{ fontSize: '.54rem', letterSpacing: '.15em', textTransform: 'uppercase', color: '#C9A84C' }}>3-Year Program</span>
                    </div>
                    <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.2 }}>{p.title}</p>
                    <p style={{ fontSize: '.66rem', color: 'rgba(255,255,255,.44)', marginTop: '.22rem' }}>{p.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────── PLACEMENT ─────────────────── */}
      <section className="lp-place-sec" style={{ position: 'relative', padding: '5.5rem 1.25rem 5rem', background: '#111111' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5rem', background: 'linear-gradient(to bottom, #0A0A0A, transparent)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px', margin: '0 auto' }}>
          <div className="lp-reveal" style={{ opacity: 0 }}>
            <span style={{ fontSize: '.6rem', letterSpacing: '.26em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Training &amp; Placements</span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,4vw,2.7rem)', marginTop: '.65rem', lineHeight: 1.12 }}>
              Careers That Begin <em style={{ color: '#C9A84C' }}>Before Graduation</em>
            </h2>
            <div style={{ width: 48, height: 1, background: 'linear-gradient(90deg,#C9A84C,transparent)', margin: '.95rem 0 1.15rem' }} />
            <p style={{ color: 'rgba(255,255,255,.46)', fontSize: '.88rem', lineHeight: 1.82, maxWidth: '510px', marginBottom: '2rem' }}>
              Our 6–12 month industrial training program places students directly with India's finest hotel chains. International opportunities. 100% placement assistance for every graduate.
            </p>
          </div>

          {/* Parallax placement image */}
          <div className="lp-reveal" style={{ opacity: 0, position: 'relative', overflow: 'hidden', aspectRatio: '16/9', marginBottom: '1.6rem', borderRadius: '2px' }}>
            <div className="lp-place-img" style={{ position: 'absolute', inset: '-14% 0', willChange: 'transform' }}>
              <img src="/images/front-office.jpg" alt="Industrial Training" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', filter: 'brightness(.88)' }} loading="lazy" />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.28)' }} />
            <div style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', padding: '.75rem 1.2rem', background: '#C9A84C' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.55rem', fontWeight: 300, color: '#0A0A0A', lineHeight: 1 }}>50+</p>
              <p style={{ fontSize: '.52rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,.55)', marginTop: '.2rem' }}>Hotel Partners</p>
            </div>
          </div>

          {/* 3-metric grid */}
          <div className="lp-reveal" style={{ opacity: 0, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, marginBottom: '1.6rem' }}>
            {METRICS.map((m, i) => {
              const Icon = m.Icon;
              return (
                <div key={i} style={{
                  padding: '1.55rem .75rem',
                  background: 'rgba(201,168,76,.025)',
                  border: '1px solid rgba(201,168,76,.1)',
                  textAlign: 'center',
                  transition: 'border-color .35s, background .35s',
                }}>
                  <Icon size={17} style={{ color: '#C9A84C', margin: '0 auto .55rem', display: 'block' }} />
                  <p style={{ fontSize: '.78rem', fontWeight: 600, color: '#fff' }}>{m.label}</p>
                  <p style={{ fontSize: '.54rem', color: 'rgba(255,255,255,.3)', marginTop: '.22rem', letterSpacing: '.07em', textTransform: 'uppercase' }}>{m.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Partner tags */}
          <div className="lp-reveal" style={{ opacity: 0 }}>
            <p style={{ fontSize: '.55rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.22)', marginBottom: '.65rem' }}>Placement Partners</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.42rem' }}>
              {PARTNERS.map((p, i) => <span key={i} className="lp-ptag">{p}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── LEAD FORM ─────────────────── */}
      <section id="lead-form" style={{ position: 'relative', padding: '5.5rem 1.25rem 5rem', background: '#0A0A0A' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5rem', background: 'linear-gradient(to bottom, #111111, transparent)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" exit={{ opacity: 0, y: -12, transition: { duration: .28 } }}>
                {/* Form header */}
                <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center', marginBottom: '2.25rem' }}>
                  <div
                    className="lp-badge-breathe"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                      padding: '.4rem 1.1rem',
                      background: 'rgba(201,168,76,.07)',
                      border: '1px solid rgba(201,168,76,.32)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <span style={{ fontSize: '.58rem', letterSpacing: '.22em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>Limited Seats — Admissions Open</span>
                  </div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: 'clamp(1.75rem,4vw,2.5rem)', lineHeight: 1.12 }}>
                    Get <em style={{ color: '#C9A84C' }}>Admission Details</em>
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.38)', marginTop: '.7rem', fontSize: '.84rem', lineHeight: 1.72 }}>
                    Fill in your details — our team will reach you within 24 hours.
                  </p>
                </div>

                {/* Form card */}
                <motion.form
                  className="lp-reveal"
                  onSubmit={handleSubmit}
                  style={{
                    opacity: 0,
                    background: 'rgba(255,255,255,.022)',
                    border: '1px solid rgba(201,168,76,.18)',
                    padding: '2.4rem 1.85rem',
                    boxShadow: '0 0 80px rgba(201,168,76,.04)',
                  }}
                  animate={{ boxShadow: ['0 0 0px rgba(201,168,76,0)', '0 0 48px rgba(201,168,76,.06)', '0 0 0px rgba(201,168,76,0)'] }}
                  transition={{ duration: 4.5, repeat: Infinity, delay: 2.2 }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '.64rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.38)', marginBottom: '.45rem' }}>Full Name</label>
                      <input className="lp-inp" type="text" name="name" value={form.name} onChange={change} placeholder="Your full name" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.64rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.38)', marginBottom: '.45rem' }}>
                        Phone Number <span style={{ color: '#C9A84C' }}>*</span>
                      </label>
                      <input className="lp-inp" type="tel" name="phone" value={form.phone} onChange={change} placeholder="10-digit mobile number" required maxLength={10} inputMode="numeric" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.64rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.38)', marginBottom: '.45rem' }}>Course Interest</label>
                      <select className="lp-inp" name="course" value={form.course} onChange={change} style={{ cursor: 'pointer', color: form.course ? '#fff' : 'rgba(255,255,255,.24)' }}>
                        <option value="">Select a program</option>
                        {COURSES.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.64rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.38)', marginBottom: '.45rem' }}>City</label>
                      <input className="lp-inp" type="text" name="city" value={form.city} onChange={change} placeholder="Your city" />
                    </div>

                    {error && (
                      <p style={{ color: '#f87171', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <span>⚠</span> {error}
                      </p>
                    )}

                    <button type="submit" className="lp-submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <motion.span
                            style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,.3)', borderTopColor: '#0A0A0A', borderRadius: '50%', display: 'inline-block' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: .65, repeat: Infinity, ease: 'linear' }}
                          />
                          Processing...
                        </>
                      ) : (
                        <>Get Admission Details <ArrowRight size={14} /></>
                      )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem', paddingTop: '.25rem' }}>
                      <Shield size={11} style={{ color: 'rgba(201,168,76,.55)', flexShrink: 0 }} />
                      <p style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.24)', textAlign: 'center' }}>
                        100% Placement Assistance · No spam · Your info is safe
                      </p>
                    </div>
                  </div>
                </motion.form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: .92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  textAlign: 'center', padding: '4rem 2rem',
                  background: 'rgba(255,255,255,.022)',
                  border: '1px solid rgba(201,168,76,.26)',
                  boxShadow: '0 0 80px rgba(201,168,76,.05)',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: .15 }}
                >
                  <CheckCircle size={54} style={{ color: '#C9A84C', margin: '0 auto 1.6rem', display: 'block' }} />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .3, duration: .7, ease: [0.16,1,0.3,1] }}
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, fontSize: '1.9rem', marginBottom: '.75rem' }}
                >
                  Thank you{form.name ? `, ${form.name}` : ''}!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .48, duration: .7, ease: [0.16,1,0.3,1] }}
                  style={{ color: 'rgba(255,255,255,.48)', fontSize: '.88rem', lineHeight: 1.78, marginBottom: '1.25rem' }}
                >
                  We received your enquiry. Our admissions team will contact{' '}
                  {form.phone ? <strong style={{ color: '#fff' }}>+91-{form.phone}</strong> : 'you'}{' '}
                  within 24 hours.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: .72, duration: .8 }}
                  style={{ fontSize: '.68rem', color: 'rgba(201,168,76,.55)', letterSpacing: '.06em' }}
                >
                  Redirecting to WhatsApp for instant assistance...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─────────────────── ACTION BUTTONS ─────────────────── */}
      <section style={{ position: 'relative', padding: '2.25rem 1.25rem 5.5rem', background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div className="lp-reveal lp-act" style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello, I want admission details for KLE Hotel Management, Belagavi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.65rem',
                padding: '1.15rem',
                background: '#25D366',
                color: '#fff', fontWeight: 600, fontSize: '.8rem', textDecoration: 'none', letterSpacing: '.07em',
                transition: 'background .3s, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#20BA5A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(37,211,102,.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#25D366'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
            >
              <MessageSquare size={17} />
              Chat on WhatsApp
            </a>
            <a
              href="https://www.klehotelmanagement.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.65rem',
                padding: '1.15rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,.14)',
                color: 'rgba(255,255,255,.55)', fontWeight: 500, fontSize: '.8rem', textDecoration: 'none', letterSpacing: '.07em',
                transition: 'border-color .35s, color .35s, transform .4s cubic-bezier(.16,1,.3,1)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,.45)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.85)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.55)'; (e.currentTarget as HTMLElement).style.transform = '' }}
            >
              <ExternalLink size={15} />
              Visit Official Website
            </a>
          </div>

          {/* Direct contact */}
          <div className="lp-reveal" style={{ opacity: 0, textAlign: 'center', marginTop: '2.75rem' }}>
            <p style={{ fontSize: '.66rem', color: 'rgba(255,255,255,.18)', marginBottom: '.45rem', letterSpacing: '.04em' }}>Or call us directly</p>
            <a href="tel:+919731595657" style={{ fontSize: '1.08rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 500, letterSpacing: '.02em' }}>
              +91 97315 95657
            </a>
            <p style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.18)', marginTop: '.35rem', letterSpacing: '.02em' }}>
              JNMC Campus, Nehru Nagar, Belagavi — 590 010
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer style={{ padding: '1.4rem 1.25rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
        <p style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.16)', letterSpacing: '.05em' }}>
          &copy; {new Date().getFullYear()} KLE Graduate School of Hotel Management &amp; Catering Technology, Belagavi. Part of KLE Society since 1916.
        </p>
      </footer>

      {/* ─────────────────── FLOATING WHATSAPP ─────────────────── */}
      <AnimatePresence>
        {showFloat && (
          <motion.a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I want to know about KLE Hotel Management admissions.')}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: .45 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .45 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: .94 }}
            style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
              width: 56, height: 56, borderRadius: '50%',
              background: '#25D366',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'lp-wa-glow 3.2s ease-in-out infinite',
              textDecoration: 'none',
            }}
            aria-label="Chat on WhatsApp"
          >
            <MessageSquare size={24} color="#fff" />
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
