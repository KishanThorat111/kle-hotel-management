import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ChefHat, Coffee, ConciergeBell, Sparkles, Cake, CalendarCheck } from 'lucide-react';
import { img } from '@/lib/cdn';

gsap.registerPlugin(ScrollTrigger);

const subjects = [
  { icon: ChefHat, name: 'Food Production & Cooking', detail: 'Classical & modern culinary arts, nutrition, menu planning' },
  { icon: Coffee, name: 'Food & Beverage Service', detail: 'Restaurant operations, bar management, fine dining etiquette' },
  { icon: ConciergeBell, name: 'Front Office Operations', detail: 'PMS systems, reservations, guest relations, check-in/out' },
  { icon: Sparkles, name: 'Housekeeping Management', detail: 'Room care, laundry, public area maintenance standards' },
  { icon: Cake, name: 'Bakery & Confectionery', detail: 'Bread making, pastry, chocolate work, dessert arts' },
  { icon: CalendarCheck, name: 'Event Management', detail: 'Banquet planning, MICE, conference coordination' },
];

const highlights = [
  'NEP 2020 aligned curriculum',
  '6–12 month industrial training',
  'Practical lab sessions daily',
  'Industry expert guest lectures',
  'International exposure visits',
  'Career mentorship program',
];

export default function Curriculum() {
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
              <span className="section-label-navy">Curriculum Highlights</span>
            </div>
            <h2
              className="curr-reveal opacity-0 mt-4 font-light leading-tight text-white"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}
            >
              A Curriculum Built for{' '}
              <em style={{ color: '#C9A84C' }}>Industry Readiness</em>
            </h2>
            <div
              className="curr-reveal opacity-0 mt-5 mb-7"
              style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }}
            />
            <p
              className="curr-reveal opacity-0 text-base leading-relaxed mb-10"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Our NEP 2020-aligned, 3-year program combines academic theory with intensive practical training — preparing students for immediate employment in premium hospitality roles.
            </p>

            {/* Subjects list */}
            <div className="space-y-3">
              {subjects.map((s, i) => {
                const Icon = s.icon;
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
                Program Features
              </p>
              <div className="grid grid-cols-2 gap-2">
                {highlights.map((h, i) => (
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
                src={img('chef-students')}
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
                "Theory without practice is incomplete. We ensure students learn by doing."
              </p>
              <p className="text-xs mt-2" style={{ color: 'rgba(201,168,76,0.7)' }}>
                — Department of Culinary Arts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
