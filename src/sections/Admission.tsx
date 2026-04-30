import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, MessageSquare, GraduationCap, Phone, Mail, MapPin, ClipboardList } from 'lucide-react';
import { track } from '@/lib/track';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Submit Application',
    desc: 'Fill the online application form with personal details, academic records, and program preference.',
  },
  {
    number: '02',
    icon: CheckCircle,
    title: 'Document Verification',
    desc: '10th & 12th mark sheets, Transfer Certificate, Aadhaar card, and passport-size photographs.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Counseling Interview',
    desc: 'Personal interaction with faculty to assess aptitude, interest, and communication skills.',
  },
  {
    number: '04',
    icon: GraduationCap,
    title: 'Admission Confirmation',
    desc: 'Fee submission and issue of admission letter. Begin your journey into hospitality!',
  },
];

const eligibility = [
  'Minimum 10+2 (any stream) from a recognized board',
  'Minimum 50% aggregate marks (45% for SC/ST)',
  'Age: 17–23 years as on July 1st of admission year',
  'English proficiency is essential',
  'Physical fitness and good communication skills',
];

export default function Admission() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.adm-reveal'),
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 68%', toggleActions: 'play none none reverse' },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const openWhatsApp = () => {
    const msg = encodeURIComponent('Hello, I am interested in admission at KLE Graduate School of Hotel Management, Belagavi. Please guide me through the process.');
    window.open(`https://wa.me/916364504056?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const openApplyForm = () => {
    track('apply_click', { source: 'admission_section' });
    window.dispatchEvent(new CustomEvent('kle:open-popup', { detail: { source: 'apply_now' } }));
  };

  return (
    <section
      ref={sectionRef}
      id="admission"
      className="py-24 md:py-36 overflow-hidden"
      style={{ background: '#0D1B3E' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="adm-reveal opacity-0 text-center max-w-2xl mx-auto mb-16">
          <span className="section-label-navy">Admissions Open</span>
          <h2
            className="mt-4 font-light leading-tight text-white"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            Begin Your Journey in{' '}
            <em style={{ color: '#C9A84C' }}>Hospitality</em>
          </h2>
          <div
            className="mx-auto mt-5"
            style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }}
          />
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Join the next batch at KLE Graduate School of Hotel Management — Belagavi's premier hotel management institute.
          </p>
        </div>

        {/* Steps */}
        <div className="adm-reveal opacity-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="p-6 relative"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}
                whileHover={{ background: 'rgba(201,168,76,0.06)', borderColor: 'rgba(201,168,76,0.35)' }}
                transition={{ duration: 0.25 }}
              >
                {/* Step number */}
                <p
                  className="absolute top-4 right-5 text-5xl font-light"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'rgba(201,168,76,0.1)', lineHeight: 1 }}
                >
                  {s.number}
                </p>
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3
                  className="text-lg font-light mb-2 text-white"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {s.desc}
                </p>
                {i < 3 && (
                  <div
                    className="hidden lg:block absolute top-1/2 -right-px w-4 h-px"
                    style={{ background: 'rgba(201,168,76,0.3)' }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom section: eligibility + CTA */}
        <div className="adm-reveal opacity-0 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Eligibility */}
          <div
            className="p-8"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs tracking-widest uppercase mb-5" style={{ color: 'rgba(201,168,76,0.7)' }}>
              Eligibility Criteria
            </p>
            <ul className="space-y-3">
              {eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#C9A84C' }} />
                  {e}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA block */}
          <div className="flex flex-col justify-between gap-6">
            <div
              className="p-8"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'rgba(201,168,76,0.7)' }}>
                Get In Touch
              </p>
              <div className="space-y-4">
                <a
                  href="tel:+919731595657"
                  className="flex items-center gap-3 text-sm group"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  <Phone className="w-4 h-4 shrink-0" style={{ color: '#C9A84C' }} />
                  <span className="group-hover:text-white transition-colors">+91 97315 95657</span>
                </a>
                <a
                  href="mailto:info@klehotelmanagement.edu.in"
                  className="flex items-center gap-3 text-sm group"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: '#C9A84C' }} />
                  <span className="group-hover:text-white transition-colors">info@klehotelmanagement.edu.in</span>
                </a>
                <div className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#C9A84C' }} />
                  <span>JNMC Campus, Nehru Nagar, Belagavi - 590 010, Karnataka</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={openApplyForm}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 text-xs font-semibold tracking-widest uppercase transition-all duration-300"
                style={{ background: '#C9A84C', color: '#fff' }}
                whileHover={{ scale: 1.02, background: '#A8872E' }}
                whileTap={{ scale: 0.98 }}
              >
                <ClipboardList className="w-4 h-4" />
                Apply for Admission
              </motion.button>
              <motion.button
                onClick={openWhatsApp}
                className="flex-1 btn-primary justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp Us
              </motion.button>
              <a
                href="tel:08312444348"
                className="flex-1 btn-outline-navy justify-center"
              >
                Call Admissions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
