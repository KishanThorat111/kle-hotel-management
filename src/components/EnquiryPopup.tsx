import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { X, Phone, User, ChevronRight, MessageCircle, GraduationCap, HelpCircle } from 'lucide-react';

const WA = '916364504056';
const STORAGE_KEY = 'kle_enquiry_submitted';
const DELAY_MS = 7000; // 7 seconds after page load

const INTERESTS = [
  { id: 'Admission',   icon: GraduationCap, label: 'Admission Enquiry',  desc: 'BSc / Diploma programs' },
  { id: 'Support',     icon: HelpCircle,    label: 'Need Support',        desc: 'Existing student help' },
  { id: 'General',     icon: MessageCircle, label: 'General Info',        desc: 'About the institute' },
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
  const [loading, setLoading]     = useState(false);

  const dismiss = useCallback(() => {
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

  useEffect(() => {
    // Don't show if already submitted this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
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
    await submitEnquiry({ name: name.trim(), phone: phone.replace(/\D/g, '').slice(-10), interest, source: 'popup' });
    sessionStorage.setItem(STORAGE_KEY, '1');
    setLoading(false);
    setStep('done');

    // Auto-open WhatsApp after 2.5s
    setTimeout(() => {
      const msg = encodeURIComponent(
        `Hello KLE Hotel Management! 👋\n\nI'm ${name.trim()} and I'm interested in: *${interest}*.\nMy number: +91 ${phone.replace(/\D/g, '').slice(-10)}\n\nPlease guide me.`
      );
      window.open(`https://wa.me/${WA}?text=${msg}`, '_blank');
      dismiss();
    }, 2500);
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
                  How can we help you?
                </h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                  Fill in your details and we'll reach out within minutes.
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
              <a
                href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello KLE Hotel Management! I need information about admissions.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-3 py-2 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}
              >
                <MessageCircle size={13} />
                Or chat directly on WhatsApp
              </a>
            </>
          ) : (
            /* Done state */
            <div className="py-4 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.35)' }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14L11 19L22 8" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FAF7F0' }}>
                Enquiry Received!
              </h3>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                Thank you, <span style={{ color: '#C9A84C' }}>{name}</span>!
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
                Opening WhatsApp for you…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
