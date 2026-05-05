import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, MessageSquare, GraduationCap, Phone, Mail, MapPin, ClipboardList } from 'lucide-react';
import { track } from '@/lib/track';
import { useContent } from '@/contexts/ContentContext';

gsap.registerPlugin(ScrollTrigger);

const STEP_ICONS = [FileText, CheckCircle, MessageSquare, GraduationCap];

export default function Admission() {
  const { admission: c, contact } = useContent();
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
    const msg = encodeURIComponent(c.whatsapp_message);
    const phone = (contact.whatsapp || '').replace(/[^0-9]/g, '') || '916364504056';
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
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
          <span className="section-label-navy">{c.section_label}</span>
          <h2
            className="mt-4 font-light leading-tight text-white"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            {c.heading_main}{' '}
            <em style={{ color: '#C9A84C' }}>{c.heading_em}</em>
          </h2>
          <div
            className="mx-auto mt-5"
            style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }}
          />
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {c.description}
          </p>
        </div>

        {/* Steps */}
        <div className="adm-reveal opacity-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {c.steps.map((s, i) => {
            const Icon = STEP_ICONS[i] ?? FileText;
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
                {i < c.steps.length - 1 && (
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
              {c.eligibility_label}
            </p>
            <ul className="space-y-3">
              {c.eligibility.map((e, i) => (
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
                {c.contact_label}
              </p>
              <div className="space-y-4">
                <a
                  href={`tel:${contact.phone || '+919731595657'}`}
                  className="flex items-center gap-3 text-sm group"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  <Phone className="w-4 h-4 shrink-0" style={{ color: '#C9A84C' }} />
                  <span className="group-hover:text-white transition-colors">{contact.phone || '+91 97315 95657'}</span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-sm group"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  <Mail className="w-4 h-4 shrink-0" style={{ color: '#C9A84C' }} />
                  <span className="group-hover:text-white transition-colors">{contact.email}</span>
                </a>
                <div className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#C9A84C' }} />
                  <span>{contact.address}</span>
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
                {c.cta_apply}
              </motion.button>
              <motion.button
                onClick={openWhatsApp}
                className="flex-1 btn-primary justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare className="w-4 h-4" />
                {c.cta_whatsapp}
              </motion.button>
              <a
                href={`tel:${c.call_number}`}
                className="flex-1 btn-outline-navy justify-center"
              >
                {c.cta_call}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
