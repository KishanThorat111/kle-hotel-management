import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CheckCircle2, TrendingUp, Globe2, Briefcase } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '100%', label: 'Placement Assistance', icon: CheckCircle2 },
  { value: '50+', label: 'Partner Brands', icon: Briefcase },
  { value: '6-12', label: 'Month Internship', icon: TrendingUp },
  { value: 'Global', label: 'International Placements', icon: Globe2 },
];

const partners = [
  'Taj Hotels & Resorts', 'ITC Hotels', 'Marriott International', 'Hyatt Hotels',
  'Oberoi Group', 'Radisson Hotels', 'Leela Palaces', 'JW Marriott',
  'Novotel', 'Holiday Inn', 'The Westin', 'Crowne Plaza',
];

const careerPaths = [
  'Executive Chef', 'F&B Manager', 'Front Office Manager', 'Hotel Operations Manager',
  'Guest Relations Executive', 'Revenue Manager', 'Event Coordinator', 'Housekeeping Manager',
];

export default function Placements() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.place-reveal'),
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
    <section ref={sectionRef} id="placements" className="py-24 md:py-36 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: content */}
          <div>
            <div className="place-reveal opacity-0">
              <span className="section-label">Industrial Training & Placements</span>
            </div>
            <h2
              className="place-reveal opacity-0 mt-4 font-light leading-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.9rem, 4vw, 3rem)', color: '#0D1B3E' }}
            >
              Careers That Begin{' '}
              <em style={{ color: '#C9A84C' }}>Before Graduation</em>
            </h2>
            <div className="place-reveal opacity-0 gold-line mt-5 mb-5" />
            <p className="place-reveal opacity-0 text-base leading-relaxed" style={{ color: '#4B5563' }}>
              Our intensive 6 to 12-month industrial training program places students in India's finest hotel chains and international properties — ensuring every graduate enters the industry job-ready with real-world experience.
            </p>

            {/* Stats grid */}
            <div className="place-reveal opacity-0 grid grid-cols-2 gap-4 mt-8">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="p-5 flex items-start gap-3"
                    style={{ background: '#FAFAF8', border: '1px solid #E5E3DC' }}
                  >
                    <div className="mt-0.5" style={{ color: '#C9A84C' }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#0D1B3E' }}>{s.value}</p>
                      <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Career paths */}
            <div className="place-reveal opacity-0 mt-8">
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#0D1B3E' }}>
                Career Opportunities
              </p>
              <div className="flex flex-wrap gap-2">
                {careerPaths.map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-xs"
                    style={{ background: '#F4F3F0', color: '#4B5563', border: '1px solid #E5E3DC' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: image + partners */}
          <div className="place-reveal opacity-0">
            <div className="relative">
              <div className="overflow-hidden" style={{ aspectRatio: '4/5', maxHeight: '540px' }}>
                <img
                  src="/images/front-office.jpg"
                  alt="Student in front office training"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating badge */}
              <div
                className="absolute -left-5 bottom-10 px-6 py-5 shadow-xl"
                style={{ background: '#C9A84C', maxWidth: '200px' }}
              >
                <p className="text-3xl font-light text-white" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>50+</p>
                <p className="text-[10px] tracking-widest uppercase text-white/80 mt-1">Partner Hotels & Brands</p>
              </div>
            </div>

            {/* Partner brands marquee */}
            <div className="mt-8 overflow-hidden">
              <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: '#9CA3AF' }}>Our Placement Partners</p>
              <div className="flex flex-wrap gap-2">
                {partners.map((p, i) => (
                  <span key={i} className="text-xs px-3 py-1.5" style={{ color: '#6B7280', border: '1px solid #E5E3DC' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
