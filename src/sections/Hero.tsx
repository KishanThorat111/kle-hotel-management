import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, MapPin, Award } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';

gsap.registerPlugin(ScrollTrigger);

const heroStats = [
  { value: 25, suffix: '+', label: 'Years of Excellence' },
  { value: 5000, suffix: '+', label: 'Alumni Worldwide' },
  { value: 100, suffix: '%', label: 'Placement Support' },
  { value: 50, suffix: '+', label: 'Industry Partners' },
];

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Parallax
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 1.2 },
      });

      // Content entrance
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo('.hero-badge', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        .fromTo('.hero-heading', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
        .fromTo('.hero-sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .fromTo('.hero-ctas', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .fromTo('.hero-stat', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, '-=0.3');
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 w-full h-[115%] -top-[7.5%]">
        <img
          src="/images/campus.jpg"
          alt="KLE Campus"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'left center' }}
          loading="eager"
        />
        {/* Multi-layer overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(8,17,35,0.88) 0%, rgba(13,27,62,0.75) 40%, rgba(13,27,62,0.6) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,17,35,0.95) 0%, transparent 50%)' }}
        />
      </div>

      {/* Hero Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col justify-center min-h-screen px-5 md:px-10 lg:px-20"
        style={{ paddingTop: '96px', paddingBottom: '140px' }}
      >
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="hero-badge opacity-0 flex items-center gap-2 mb-7">
            <span className="section-label-navy">KLE Graduate School</span>
            <span
              className="hidden sm:flex items-center gap-1 text-[10px] tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              <MapPin className="w-3 h-3" />
              Belagavi, Karnataka
            </span>
          </div>

          {/* Headline */}
          <h1
            className="hero-heading opacity-0 font-light leading-[1.05]"
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              color: '#FFFFFF',
            }}
          >
            Your Place in the{' '}
            <br className="hidden md:block" />
            <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>World of Hospitality</em>
          </h1>

          {/* Divider */}
          <div
            className="hero-heading opacity-0 mt-7 mb-6"
            style={{ width: '64px', height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }}
          />

          {/* Subtext */}
          <p
            className="hero-sub opacity-0 max-w-xl text-base md:text-lg font-light leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.68)' }}
          >
            KLE Graduate School of Hotel Management and Catering Technology, Belagavi — empowering students to lead the global hospitality industry since 1997.
          </p>

          {/* CTAs */}
          <div className="hero-ctas opacity-0 flex flex-wrap items-center gap-4 mt-10">
            <motion.button
              onClick={() => document.querySelector('#admission')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => document.querySelector('#programs')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline-navy"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Programs
            </motion.button>
          </div>

          {/* Accreditation badge */}
          <div
            className="hero-ctas opacity-0 flex items-center gap-2 mt-8"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <Award className="w-4 h-4" style={{ color: '#C9A84C' }} />
            <span className="text-xs tracking-wide">AICTE Approved · Affiliated to KLE University</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{
          background: 'rgba(8, 17, 35, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(201, 168, 76, 0.15)',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {heroStats.map((stat, i) => (
              <div
                key={i}
                className="hero-stat opacity-0 py-5 px-6 flex flex-col gap-1"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <div className="flex items-end gap-0.5">
                  <span
                    className="text-2xl md:text-3xl font-light"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#C9A84C' }}
                  >
                    <AnimatedCounter end={stat.value} duration={2} />
                  </span>
                  <span className="text-lg mb-0.5" style={{ color: '#C9A84C' }}>
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute right-8 bottom-28 z-10 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: 'rgba(201,168,76,0.5)' }} />
        </motion.div>
        <span
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(201,168,76,0.4)', writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
