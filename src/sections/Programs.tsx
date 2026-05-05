import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';

gsap.registerPlugin(ScrollTrigger);

export default function Programs() {
  const content = useContent();
  const header = content.programs_header ?? {};
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.program-card'),
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="programs"
      className="py-24 md:py-36 overflow-hidden"
      style={{ background: '#F4F3F0' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <span className="section-label">{header.section_label ?? 'Our Programs'}</span>
            <h2
              className="mt-4 font-light leading-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0D1B3E' }}
            >
              {header.heading_main ?? 'Degrees That Open'}{' '}
              <em style={{ color: '#C9A84C' }}>{header.heading_em ?? 'Hotel Doors'}</em>
            </h2>
            <div className="gold-line mt-5" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            {header.subtitle ?? '3-year undergraduate programs with 6-month industrial training in leading hotel chains.'}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.programs.map((prog, i) => (
            <motion.div
              key={i}
              className="program-card opacity-0 group relative overflow-hidden bg-white flex flex-col"
              style={{ border: '1px solid #E5E3DC' }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35 }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: '220px' }}>
                <img
                  src={prog.image}
                  alt={prog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: 'left center' }}
                />
                {/* Gold overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(201,168,76,0.12)' }}
                />
                {/* Duration badge */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5"
                  style={{ background: '#0D1B3E' }}
                >
                  <Clock className="w-3 h-3" style={{ color: '#C9A84C' }} />
                  <span className="text-[10px] tracking-wide font-medium text-white">{prog.duration}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: '#C9A84C' }}>
                  {prog.subtitle}
                </p>
                <h3
                  className="text-xl font-light mb-3 leading-snug"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#0D1B3E' }}
                >
                  {prog.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#6B7280' }}>
                  {prog.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {prog.tags.map((tag, ti) => (
                    <span
                      key={ti}
                      className="px-2 py-1 text-[9px] tracking-widest uppercase"
                      style={{ background: '#F4F3F0', color: '#4B5563' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div
                  className="flex items-center gap-1.5 mt-5 pt-4 text-xs font-semibold tracking-widest uppercase group/cta"
                  style={{ color: '#0D1B3E', borderTop: '1px solid #E5E3DC' }}
                >
                  <span>Learn More</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-1" />
                </div>
              </div>

              {/* Gold bottom accent on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"
                style={{ background: '#C9A84C' }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            {header.bottom_note ?? 'All programs include 6-month industrial training + AICTE approved · Affiliated to KLE University'}
          </p>
        </div>
      </div>
    </section>
  );
}
