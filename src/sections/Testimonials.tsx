import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Priya Desai',
    role: 'F&B Supervisor, Taj Hotels',
    batch: 'Batch of 2020',
    quote: 'KLE Hotel Management gave me the foundation I needed to crack placements at Taj. The practical training was so thorough that my first day at work felt familiar.',
    image: '/images/team.jpg',
  },
  {
    name: 'Arjun Naik',
    role: 'Senior Chef, ITC Hotels, Bangalore',
    batch: 'Batch of 2018',
    quote: 'The culinary labs at KLE are world-class. By the time I graduated, I had already cooked over 200 professional recipes. That confidence is priceless.',
    image: '/images/chef-students.jpg',
  },
  {
    name: 'Sneha Kulkarni',
    role: 'Front Office Manager, JW Marriott',
    batch: 'Batch of 2021',
    quote: 'The faculty brought real hotel experience into the classroom. I learned guest handling, PMS systems, and revenue management — all before my internship.',
    image: '/images/front-office.jpg',
  },
  {
    name: 'Rahul Patil',
    role: 'Housekeeping Executive, Oberoi Group',
    batch: 'Batch of 2019',
    quote: 'The placement cell at KLE is extremely supportive. They connected me with Oberoi Group and prepared me with mock interviews and grooming sessions.',
    image: '/images/accommodation.jpg',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.test-reveal'),
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 68%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const goTo = (next: number, dir: number) => {
    setDirection(dir);
    setCurrent((next + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  const t = testimonials[current];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-24 md:py-36 overflow-hidden"
      style={{ background: '#F4F3F0' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="test-reveal opacity-0 text-center max-w-xl mx-auto mb-16">
          <span className="section-label">Student Stories</span>
          <h2
            className="mt-4 font-light leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0D1B3E' }}
          >
            Words from Our{' '}
            <em style={{ color: '#C9A84C' }}>Alumni</em>
          </h2>
          <div className="gold-line-center mt-5" />
        </div>

        {/* Testimonial card */}
        <div className="test-reveal opacity-0 max-w-4xl mx-auto">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-5 gap-0"
              style={{ background: '#FFFFFF', border: '1px solid #E5E3DC' }}
            >
              {/* Image */}
              <div className="md:col-span-2 overflow-hidden" style={{ minHeight: '280px' }}>
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Content */}
              <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <Quote className="w-8 h-8 mb-5" style={{ color: '#C9A84C', opacity: 0.4 }} />
                  <p
                    className="text-lg md:text-xl font-light leading-relaxed"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#0D1B3E' }}
                  >
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E5E3DC' }}>
                  <p className="font-semibold text-sm" style={{ color: '#0D1B3E' }}>{t.name}</p>
                  <p className="text-xs mt-1" style={{ color: '#C9A84C' }}>{t.role}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{t.batch}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className="transition-all duration-300"
                  style={{
                    width: i === current ? '28px' : '8px',
                    height: '8px',
                    background: i === current ? '#C9A84C' : '#E5E3DC',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goTo(current - 1, -1)}
                className="w-10 h-10 flex items-center justify-center transition-colors"
                style={{ border: '1px solid #E5E3DC', color: '#0D1B3E' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E3DC'; }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goTo(current + 1, 1)}
                className="w-10 h-10 flex items-center justify-center transition-colors"
                style={{ border: '1px solid #E5E3DC', color: '#0D1B3E' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E3DC'; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
