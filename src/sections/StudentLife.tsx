import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { img } from '@/lib/cdn';
import { useContent } from '@/contexts/ContentContext';

gsap.registerPlugin(ScrollTrigger);


export default function StudentLife() {
  const { student_life: c } = useContent();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.sl-reveal'),
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 68%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="student-life" className="py-24 md:py-36 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="sl-reveal opacity-0 text-center max-w-2xl mx-auto mb-16">
          <span className="section-label">{c.section_label}</span>
          <h2
            className="mt-4 font-light leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0D1B3E' }}
          >
            {c.heading_main}{' '}
            <em style={{ color: '#C9A84C' }}>{c.heading_em}</em>
          </h2>
          <div className="gold-line-center mt-5" />
          <p className="mt-5 text-base leading-relaxed" style={{ color: '#6B7280' }}>
            {c.description}
          </p>
        </div>

        {/* Mosaic image grid */}
        <div className="sl-reveal opacity-0 grid grid-cols-12 gap-3 mb-20" style={{ height: '460px' }}>
          <div className="col-span-12 md:col-span-6 relative overflow-hidden">
            <img
              src={img('chef-students')}
              alt="Culinary training"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              style={{ objectPosition: 'left center' }}
            />
            <div className="absolute bottom-3 left-3 px-3 py-1.5" style={{ background: 'rgba(13,27,62,0.8)' }}>
              <p className="text-[10px] tracking-widest uppercase text-white">{c.caption_1}</p>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden">
              <img
                src={img('fb-service')}
                alt="F&B training"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ objectPosition: 'left center' }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-1" style={{ background: 'rgba(13,27,62,0.8)' }}>
                <p className="text-[9px] tracking-widest uppercase text-white">{c.caption_2}</p>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <img
                src={img('campus')}
                alt="Campus life"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ objectPosition: 'left center' }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-1" style={{ background: 'rgba(13,27,62,0.8)' }}>
                <p className="text-[9px] tracking-widest uppercase text-white">{c.caption_3}</p>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <img
                src={img('front-office')}
                alt="Front office practice"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ objectPosition: 'left center' }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-1" style={{ background: 'rgba(13,27,62,0.8)' }}>
                <p className="text-[9px] tracking-widest uppercase text-white">{c.caption_4}</p>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <img
                src={img('accommodation')}
                alt="Hostel life"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                style={{ objectPosition: 'left center' }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-1" style={{ background: 'rgba(13,27,62,0.8)' }}>
                <p className="text-[9px] tracking-widest uppercase text-white">{c.caption_5}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Experiences grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {c.experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="sl-reveal opacity-0 p-6"
              style={{ border: '1px solid #E5E3DC' }}
              whileHover={{ borderColor: '#C9A84C', y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <p
                className="text-3xl font-light mb-4"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#C9A84C' }}
              >
                {exp.number}
              </p>
              <h3
                className="text-lg font-light mb-2"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#0D1B3E' }}
              >
                {exp.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                {exp.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
