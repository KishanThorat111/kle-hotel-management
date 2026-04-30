import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { X, Phone, User, ChevronRight, GraduationCap, HelpCircle, Info } from 'lucide-react';
import { track } from '@/lib/track';

const WA = '916364504056';
const STORAGE_KEY = 'kle_enquiry_submitted';
const DELAY_MS = 7000; // 7 seconds after page load

function buildWaMessage(name: string, phone: string, interest: string): string {
  const interestMsgs: Record<string, string> = {
    Admission: "I'd like to know about the 2026 batch admissions — eligibility, fees & process.",
    Support: "I'm an existing student and need support. Please assist me.",
    General: "I'd like to know more about KLE Hotel Management — courses, campus & facilities.",
  };
  return encodeURIComponent(
    `Hello KLE Hotel Management! 👋\n\n` +
    `*${interestMsgs[interest] ?? interestMsgs.General}*\n\n` +
    `📋 *My Details:*\n` +
    `• Name: ${name}\n` +
    `• Mobile: +91 ${phone}\n\n` +
    `Looking forward to your response. Thank you!`
  );
}

const WA_DIRECT_MSG = encodeURIComponent(
  'Hello KLE Hotel Management! 👋\n\nI found your website and would like to know more about the 2026 batch admissions. Please guide me.'
);

const INTERESTS = [
  { id: 'Admission', icon: GraduationCap, label: 'Admission',   desc: 'BSc / Diploma 2026' },
  { id: 'Support',   icon: HelpCircle,   label: 'Support',      desc: 'Student helpdesk' },
  { id: 'General',   icon: Info,         label: 'General Info', desc: 'About the institute' },
];

async function submitEnquiry(data: {
  name: string; phone: string; interest: string; source: string;
}) {
  try {
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function EnquiryPopup() {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const [visible, setVisible]     = useState(false);
  const [step, setStep]           = useState<'form' | 'done'>('form');
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [interest, setInterest]   = useState('Admission');
  const [nameErr, setNameErr]      = useState('');
  const [phoneErr, setPhoneErr]    = useState('');
  const [submitErr, setSubmitErr]  = useState('');
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [source, setSource]       = useState('popup');
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dismiss = useCallback(() => {
    if (countRef.current) clearInterval(countRef.current);
    gsap.to(cardRef.current, {
      y: 40, opacity: 0, scale: 0.96,
      duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        gsap.to(overlayRef.current, {
          opacity: 0, duration: 0.25,
          onComplete: () => setVisible(false),
        });
      },
    });
  }, []);

  // Auto-show after 7s (if not already submitted)
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => {
      setSource('popup');
      setVisible(true);
      track('popup_open', { source: 'auto' });
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Listen for Apply Now event from Navigation
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string }>).detail ?? {};
      const src = detail.source ?? 'apply_now';
      setSource(src);
      setStep('form');
      setVisible(true);
      track('popup_open', { source: src });
    };
    window.addEventListener('kle:open-popup', handler);
    return () => window.removeEventListener('kle:open-popup', handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    gsap.fromTo(overlayRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(cardRef.current,
      { y: 60, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    );
  }, [visible]);

  const validate = () => {
    let ok = true;
    setNameErr(''); setPhoneErr('');
    if (!name.trim()) { setNameErr('Please enter your name'); ok = false; }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setPhoneErr('Enter a valid 10-digit number'); ok = false; }
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitErr('');
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const ok = await submitEnquiry({ name: name.trim(), phone: cleanPhone, interest, source });
    setLoading(false);
    if (!ok) {
      setSubmitErr('Something went wrong. Please try again or use WhatsApp below.');
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, '1');
    track('form_submit', { interest, source });
    setStep('done');
    setCountdown(3);

    const cleanName = name.trim();
    const waMsg = buildWaMessage(cleanName, cleanPhone, interest);
    const waUrl = `https://wa.me/${WA}?text=${waMsg}`;

    // Countdown ticker
    let secs = 3;
    countRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0 && countRef.current) clearInterval(countRef.current);
    }, 1000);

    // Auto-open WhatsApp after 3s
    setTimeout(() => {
      window.open(waUrl, '_blank');
      dismiss();
    }, 3000);
  };

  const openWaDirect = () => {
    track('wa_click', { source: 'popup_direct' });
    window.open(`https://wa.me/${WA}?text=${WA_DIRECT_MSG}`, '_blank');
  };

  const openWaDone = () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const waMsg = buildWaMessage(name.trim(), cleanPhone, interest);
    track('wa_click', { source: 'popup_done' });
    window.open(`https://wa.me/${WA}?text=${waMsg}`, '_blank');
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9990] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(8,17,35,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) dismiss(); }}
    >
      <div
        ref={cardRef}
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: '#0D1B3E', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        {/* Gold top border */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
        >
          <X size={14} />
        </button>

        <div className="p-6 sm:p-8">
          {step === 'form' ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(201,168,76,0.7)', fontFamily: 'Inter, sans-serif' }}>
                  KLE Hotel Management
                </p>
                <h2 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FAF7F0' }}>
                  {source === 'apply_now' ? 'Apply for Admission' : 'How can we help you?'}
                </h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                  {source === 'apply_now'
                    ? 'Fill your details and our admissions team will call you today.'
                    : 'Fill in your details and we\'ll reach out within minutes.'}
                </p>
              </div>

              {/* Interest selector */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {INTERESTS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setInterest(id)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg text-center transition-all"
                    style={{
                      border: `1px solid ${interest === id ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      background: interest === id ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <Icon size={16} style={{ color: interest === id ? '#C9A84C' : 'rgba(255,255,255,0.35)' }} />
                    <span className="text-[10px] font-medium leading-tight" style={{ color: interest === id ? '#FAF7F0' : 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Name field */}
              <div className="mb-3">
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${nameErr ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <User size={15} style={{ color: 'rgba(201,168,76,0.6)', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => { setName(e.target.value); setNameErr(''); }}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#FAF7F0', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                {nameErr && <p className="text-xs mt-1 ml-1" style={{ color: '#f87171' }}>{nameErr}</p>}
              </div>

              {/* Phone field */}
              <div className="mb-5">
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${phoneErr ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <Phone size={15} style={{ color: 'rgba(201,168,76,0.6)', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>+91</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={phone}
                    maxLength={10}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneErr(''); }}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: '#FAF7F0', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                {phoneErr && <p className="text-xs mt-1 ml-1" style={{ color: '#f87171' }}>{phoneErr}</p>}
              </div>

              {/* Submit error */}
              {submitErr && (
                <p className="text-xs mb-3 px-1 text-center" style={{ color: '#f87171', fontFamily: 'Inter, sans-serif' }}>
                  {submitErr}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-medium text-sm transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #EDD68A)',
                  color: '#081123',
                  fontFamily: 'Inter, sans-serif',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Submitting…' : <>Get Instant Help <ChevronRight size={15} /></>}
              </button>

              {/* WhatsApp direct */}
              <button
                type="button"
                onClick={openWaDirect}
                className="w-full flex items-center justify-center gap-2 mt-3 py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 active:opacity-75"
                style={{
                  background: 'rgba(37,211,102,0.12)',
                  border: '1px solid rgba(37,211,102,0.3)',
                  color: '#25D366',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* WhatsApp SVG icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat Directly on WhatsApp
              </button>
            </>
          ) : (
            /* Done state */
            <div className="py-4 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.35)' }}
              >
                {/* WhatsApp check icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FAF7F0' }}>
                Enquiry Received!
              </h3>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                Thank you, <span style={{ color: '#C9A84C' }}>{name}</span>! We'll contact you soon.
              </p>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
                Opening WhatsApp in {countdown > 0 ? `${countdown}s` : 'a moment'}…
              </p>
              {/* Manual open button — visible if popup blocker fires */}
              <button
                type="button"
                onClick={openWaDone}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Open WhatsApp Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
