import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ChefHat, UtensilsCrossed, Bed, CalendarDays } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ChefHat,
    title: 'Professional Kitchen Labs',
    desc: 'State-of-the-art kitchen equipment including commercial ranges, convection ovens, and pastry stations.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Training Restaurant',
    desc: 'Live training restaurant where students gain real service experience in a fine-dining environment.',
  },
  {
    icon: Bed,
    title: 'Student Hostel',
    desc: 'On-campus accommodation with modern facilities, Wi-Fi, and 24-hour security at JNMC Campus.',
  },
  {
    icon: CalendarDays,
    title: 'Convention Center',
    desc: 'Multipurpose event hall for workshops, cultural programs, and industry interaction meets.',
  },
];

export default function Facilities() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.fac-reveal'),
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 68%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="facilities" className="py-24 md:py-36 overflow-hidden" style={{ background: '#F4F3F0' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="fac-reveal opacity-0 text-center max-w-2xl mx-auto mb-16">
          <span className="section-label">Campus & Facilities</span>
          <h2
            className="mt-4 font-light leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0D1B3E' }}
          >
            Equipped for the{' '}
            <em style={{ color: '#C9A84C' }}>Real World</em>
          </h2>
          <div className="gold-line-center mt-5" />
          <p className="mt-5 text-base leading-relaxed" style={{ color: '#6B7280' }}>
            Industry-standard training facilities at the JNMC Campus, designed to replicate actual hotel environments.
          </p>
        </div>

        {/* Image grid */}
        <div className="fac-reveal opacity-0 grid grid-cols-12 gap-4 mb-16">
          {/* Large left image */}
          <div className="col-span-12 md:col-span-7 overflow-hidden relative" style={{ height: '420px' }}>
            <img
              src="/images/culinary-kitchen.jpg"
              alt="Professional Kitchen Lab"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div
              className="absolute bottom-4 left-4 px-4 py-2"
              style={{ background: 'rgba(13,27,62,0.85)' }}
            >
              <p className="text-xs tracking-widest uppercase text-white">Kitchen Laboratory</p>
            </div>
          </div>

          {/* Right column: two stacked images */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
            <div className="overflow-hidden relative" style={{ flex: 1, minHeight: '200px' }}>
              <img
                src="/images/accommodation.jpg"
                alt="Student Hostel"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5"
                style={{ background: 'rgba(13,27,62,0.85)' }}
              >
                <p className="text-[10px] tracking-widest uppercase text-white">Hostel & Accommodation</p>
              </div>
            </div>
            <div className="overflow-hidden relative" style={{ flex: 1, minHeight: '200px' }}>
              <img
                src="/images/campus.jpg"
                alt="KLE Campus"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5"
                style={{ background: 'rgba(13,27,62,0.85)' }}
              >
                <p className="text-[10px] tracking-widest uppercase text-white">JNMC Campus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                className="fac-reveal opacity-0 p-6 bg-white"
                style={{ border: '1px solid #E5E3DC' }}
                whileHover={{ y: -4, borderColor: '#C9A84C' }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4"
                  style={{ background: '#FBF4E3', color: '#C9A84C' }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3
                  className="text-lg font-light mb-2"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#0D1B3E' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
