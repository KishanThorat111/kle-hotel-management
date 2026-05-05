import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ChefHat, Coffee, ConciergeBell, Sparkles, Cake, CalendarCheck } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

gsap.registerPlugin(ScrollTrigger);

const SUBJECT_ICONS = [ChefHat, Coffee, ConciergeBell, Sparkles, Cake, CalendarCheck];

export default function Curriculum() {
  const { curriculum: c } = useContent();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.curr-reveal'),
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 68%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="py-24 md:py-36 overflow-hidden"
      style={{ background: '#0D1B3E' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* Left: subjects + highlights */}
          <div>
            <div className="curr-reveal opacity-0">
              <span className="section-label-navy">{c.section_label}</span>
            </div>
            <h2
              className="curr-reveal opacity-0 mt-4 font-light leading-tight text-white"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}
            >
              {c.heading_main}{' '}
              <em style={{ color: '#C9A84C' }}>{c.heading_em}</em>
            </h2>
            <div
              className="curr-reveal opacity-0 mt-5 mb-7"
              style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }}
            />
            <p
              className="curr-reveal opacity-0 text-base leading-relaxed mb-10"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {c.description}
            </p>

            {/* Subjects list */}
            <div className="space-y-3">
              {c.subjects.map((s, i) => {
                const Icon = SUBJECT_ICONS[i] ?? ChefHat;
                return (
                  <motion.div
                    key={i}
                    className="curr-reveal opacity-0 flex items-start gap-4 p-4"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(201,168,76,0.15)',
                    }}
                    whileHover={{ backgroundColor: 'rgba(201,168,76,0.06)', borderColor: 'rgba(201,168,76,0.3)' }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 shrink-0 mt-0.5"
                      style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Highlights grid */}
            <div className="curr-reveal opacity-0 mt-10">
              <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: 'rgba(201,168,76,0.7)' }}>
                {c.features_label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {c.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C9A84C' }} />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: image */}
          <div className="curr-reveal opacity-0 relative lg:sticky lg:top-24">
            <div
              className="overflow-hidden"
              style={{ aspectRatio: '3/4', maxHeight: '600px', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <img
                src={c.image}
                alt="Students in culinary training"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(8,17,35,0.7) 0%, transparent 50%)' }}
              />
            </div>

            {/* Quote overlay */}
            <div
              className="absolute bottom-6 left-6 right-6 p-5"
              style={{ background: 'rgba(8,17,35,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <p
                className="text-lg font-light italic text-white"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                "{c.quote}"
              </p>
              <p className="text-xs mt-2" style={{ color: 'rgba(201,168,76,0.7)' }}>
                {c.quote_attribution}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
