import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Globe2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '25+', label: 'Years of Excellence' },
  { value: '5000+', label: 'Successful Alumni' },
  { value: '100%', label: 'Placement Support' },
];

const pillars = [
  {
    icon: GraduationCap,
    title: 'Academic Excellence',
    desc: 'NEP-aligned curriculum, industry faculty, and hands-on practical training in fully equipped labs.',
  },
  {
    icon: Globe2,
    title: 'Global Exposure',
    desc: 'International internship opportunities, cultural exchange, and placements with 5-star brands worldwide.',
  },
  {
    icon: Building2,
    title: 'Industry Integration',
    desc: 'Partnerships with Taj, Marriott, ITC, Oberoi, Hyatt and 50+ leading hospitality companies.',
  },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.about-reveal'),
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' },
        }
      );
      gsap.fromTo(
        section.querySelectorAll('.pillar-item'),
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out',
          scrollTrigger: { trigger: section.querySelector('.pillars-row'), start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative py-24 md:py-36 bg-white overflow-hidden">
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{ background: 'linear-gradient(to left, #F4F3F0 0%, transparent 100%)', opacity: 0.5 }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 md:mb-28">
          <div className="about-reveal opacity-0 relative">
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', maxHeight: '560px' }}>
              <img
                src="/images/team.jpg"
                alt="KLE Faculty and Students"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
                loading="lazy"
              />
              <div
                className="absolute -bottom-4 -right-4 w-full h-full"
                style={{ border: '2px solid #C9A84C', zIndex: -1 }}
              />
            </div>
            <div
              className="absolute -bottom-6 left-6 px-6 py-5 shadow-lg"
              style={{ background: '#0D1B3E', minWidth: '180px' }}
            >
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'rgba(201,168,76,0.7)' }}>Est.</p>
              <p className="text-4xl font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FFFFFF' }}>1997</p>
              <p className="text-[10px] tracking-wider uppercase mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Belagavi, Karnataka</p>
            </div>
          </div>

          <div>
            <div className="about-reveal opacity-0">
              <span className="section-label">About KLE Hotel Management</span>
            </div>
            <h2
              className="about-reveal opacity-0 mt-5 font-light leading-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0D1B3E' }}
            >
              A Legacy of <em style={{ color: '#C9A84C' }}>Hospitality Excellence</em> Since 1997
            </h2>
            <div className="about-reveal opacity-0 gold-line mt-6 mb-6" />
            <p className="about-reveal opacity-0 text-base leading-relaxed" style={{ color: '#4B5563' }}>
              KLE Graduate School of Hotel Management & Catering Technology is a premier institution at JNMC Campus, Nehru Nagar, Belagavi. Part of the prestigious KLE Society — one of Karnataka's largest educational groups with 270+ institutions since 1916.
            </p>
            <p className="about-reveal opacity-0 text-base leading-relaxed mt-4" style={{ color: '#4B5563' }}>
              We provide world-class hospitality education through an industry-integrated curriculum, expert faculty with leading hotel experience, and 100% placement assistance to every student.
            </p>
            <div className="about-reveal opacity-0 flex flex-wrap gap-8 mt-10">
              {stats.map((s, i) => (
                <div key={i} style={{ borderLeft: '2px solid #C9A84C', paddingLeft: '1rem' }}>
                  <p className="text-3xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#C9A84C' }}>{s.value}</p>
                  <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="about-reveal opacity-0 mt-8 px-5 py-3 inline-block" style={{ background: '#F4F3F0', borderLeft: '3px solid #C9A84C' }}>
              <p className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: '#0D1B3E' }}>Learn · Prosper · Excel</p>
            </div>
          </div>
        </div>

        <div className="pillars-row grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div key={i} className="pillar-item opacity-0 p-8 card-edu" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
                <div className="w-11 h-11 flex items-center justify-center mb-5" style={{ background: '#FBF4E3', color: '#C9A84C' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-light mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#0D1B3E' }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
