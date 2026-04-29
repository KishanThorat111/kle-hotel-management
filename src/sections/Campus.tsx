import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { MapPin, Globe, Users, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  { icon: MapPin, title: 'Prime Location', desc: 'JNMC Campus, Nehru Nagar, Belagavi-590 010, Karnataka' },
  { icon: Globe, title: 'Global Internships', desc: 'Opportunities at 5-star hotels, cruise lines, and abroad placements' },
  { icon: Users, title: 'Expert Faculty', desc: 'Industry veterans from Taj, ITC, Marriott, and Oberoi Hotels' },
  { icon: Award, title: 'KLE Excellence', desc: 'Part of the prestigious KLE Society — Karnataka\'s premier education group' },
];

export default function Campus() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Parallax
      gsap.to(parallaxRef.current, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      // Text
      gsap.fromTo(
        section.querySelectorAll('.campus-reveal'),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' },
        }
      );

      // Cards
      gsap.fromTo(
        section.querySelectorAll('.highlight-card'),
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section.querySelector('.highlights-grid'), start: 'top 80%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="campus"
      className="relative overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Full-width image with overlay */}
      <div className="relative overflow-hidden" style={{ height: '75vh', minHeight: '500px' }}>
        <div ref={parallaxRef} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <img
            src="/images/campus.jpg"
            alt="KLE Campus"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)'
          }} />
        </div>

        {/* Centered overlay text */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <p className="campus-reveal text-[10px] tracking-[0.4em] uppercase mb-5 opacity-0"
            style={{ color: '#C9A84C' }}>
            Life at KLE
          </p>
          <h2 className="campus-reveal text-4xl md:text-6xl lg:text-7xl font-light max-w-3xl opacity-0"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FAF7F0' }}>
            A Campus That <span className="italic" style={{ color: '#C9A84C' }}>Inspires</span>
          </h2>
          <div className="campus-reveal mt-6 w-16 h-px opacity-0"
            style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
          <p className="campus-reveal mt-6 max-w-xl text-base font-light leading-relaxed opacity-0"
            style={{ color: 'rgba(250,247,240,0.6)' }}>
            Set within the prestigious JNMC Campus in Belagavi, KLE Hotel Management offers an immersive environment where you don't just study hospitality — you live it.
          </p>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
      </div>

      {/* Highlights */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-24">
        <div className="highlights-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={i}
                className="highlight-card opacity-0 p-8 flex flex-col gap-5"
                style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.08)' }}
                whileHover={{ borderColor: 'rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.03)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: '#C9A84C' }} />
                </div>
                <h4 className="text-lg font-light"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FAF7F0' }}>
                  {h.title}
                </h4>
                <p className="text-sm font-light leading-relaxed"
                  style={{ color: 'rgba(250,247,240,0.45)' }}>
                  {h.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
