import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LogOut, Download, Search, Trash2, Phone, User,
  RefreshCw, MessageCircle, TrendingUp, Calendar, Users, Inbox, X,
  LayoutDashboard, Edit3, Image, Shield, Globe, Check,
  Upload, Copy, AlertTriangle, Eye, EyeOff, ChevronDown, BarChart2, MousePointer, Activity,
  Sun, Moon, ExternalLink, Info, Sparkles, Menu,
} from 'lucide-react';
import { DEFAULT_CONTENT } from '@/lib/siteContent';
import type { HeroContent, AboutContent, ProgramItem, ContactContent,
  PlacementsContent, FacilitiesContent, CurriculumContent, StudentLifeContent,
  TestimonialsContent, AdmissionContent, FooterContent, ProgramsHeader } from '@/lib/siteContent';
import { broadcastCmsUpdate } from '@/lib/cmsBroadcast';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab            = 'dashboard' | 'enquiries' | 'content' | 'media' | 'security' | 'analytics';
type ContentSection = 'hero' | 'about' | 'programs' | 'contact'
  | 'placements' | 'facilities' | 'curriculum' | 'student_life' | 'testimonials' | 'admission' | 'footer';
type SaveStatus     = 'idle' | 'saving' | 'saved' | 'error';

interface Enquiry {
  id: number; name: string; phone: string;
  interest: string; source: string; created_at: string;
}
interface Stats {
  total: number; today: number; week: number;
  by_interest: { interest: string; cnt: number }[];
}
interface R2Image { key: string; size: number; uploaded: string; url: string; }
interface ToastItem { id: string; type: 'success' | 'error' | 'info'; msg: string; }
interface Analytics {
  total: number; today: number; week: number;
  by_event: { event_type: string; cnt: number }[];
  daily: { day: string; cnt: number }[];
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getStoredToken(): string {
  try {
    const t = sessionStorage.getItem('kle_admin_token') ?? '';
    const e = sessionStorage.getItem('kle_admin_expiry') ?? '';
    if (t && e && new Date(e) > new Date()) return t;
  } catch { /* ignore */ }
  return '';
}
function storeToken(token: string, expiresAt: string) {
  sessionStorage.setItem('kle_admin_token', token);
  sessionStorage.setItem('kle_admin_expiry', expiresAt);
}
function clearToken() {
  sessionStorage.removeItem('kle_admin_token');
  sessionStorage.removeItem('kle_admin_expiry');
}

// ─── Utility functions ────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const s = /[Zz+\-]\d*$/.test(iso) ? iso : iso.replace(' ', 'T') + 'Z';
  const d = new Date(s);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}
function csvSafe(v: unknown): string {
  const s = String(v ?? '').replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(s)) return `"'${s}"`;
  return `"${s}"`;
}
function exportCSV(data: Enquiry[]) {
  const header = 'ID,Name,Phone,Interest,Source,Date';
  const rows = data.map(e =>
    [e.id, csvSafe(e.name), csvSafe(e.phone), csvSafe(e.interest), csvSafe(e.source), csvSafe(e.created_at)].join(',')
  );
  const blob = new Blob([['\uFEFF', header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `kle-enquiries-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}
function waLink(e: Enquiry): string {
  const msg = encodeURIComponent(
    `Hello ${e.name}! 👋 This is KLE Hotel Management.\n\nWe received your *${e.interest}* enquiry. How can we assist you?`
  );
  return `https://wa.me/91${e.phone}?text=${msg}`;
}
function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}
async function compressToWebP(file: File): Promise<Blob> {
  const MAX = 2000, Q = 0.85;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const ou  = URL.createObjectURL(file);
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
      }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(ou);
      cv.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), 'image/webp', Q);
    };
    img.onerror = () => { URL.revokeObjectURL(ou); reject(new Error('Load failed')); };
    img.src = ou;
  });
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface UploadResult {
  url: string;
  originalBytes: number;
  compressedBytes: number;
  filename: string;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported file type. Use JPG, PNG, WebP, or GIF.`;
  }
  return null;
}

async function uploadFile(file: File, token: string, onPct: (n: number) => void): Promise<UploadResult> {
  const err = validateFile(file);
  if (err) throw new Error(err);

  onPct(15);
  const blob = await compressToWebP(file);
  onPct(55);
  const name     = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  const filename = `${name}-${Date.now()}.webp`;
  const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/webp', 'Authorization': `Bearer ${token}` },
    body: blob,
  });
  onPct(90);
  const data = await res.json() as { ok: boolean; url?: string; error?: string };
  if (!data.ok) throw new Error(data.error ?? 'Upload failed');
  onPct(100);
  return {
    url: data.url!,
    originalBytes: file.size,
    compressedBytes: blob.size,
    filename,
  };
}

// ─── Design tokens (CSS variable refs — actual values injected per theme) ─────
const G = {
  bg:             'var(--g-bg)',
  card:           'var(--g-card)',
  cardAlt:        'var(--g-card-alt)',
  border:         'var(--g-border)',
  borderGold:     'var(--g-border-gold)',
  gold:           'var(--g-gold)',
  goldDim:        'var(--g-gold-dim)',
  goldFill:       'var(--g-gold-fill)',
  goldFillStrong: 'var(--g-gold-fill-strong)',
  goldHover:      'var(--g-gold-hover)',
  goldGradEnd:    'var(--g-gold-grad-end)',
  text:           'var(--g-text)',
  textDim:        'var(--g-text-dim)',
  textMuted:      'var(--g-text-muted)',
  field:          'var(--g-field)',
  fieldSubtle:    'var(--g-field-subtle)',
  rowAlt:         'var(--g-row-alt)',
  shadow:         'var(--g-shadow)',
  onGold:         '#081123',  // text on gold buttons (constant in both themes)
} as const;

type ThemeName = 'light' | 'dark';
const THEMES: Record<ThemeName, Record<string, string>> = {
  light: {
    '--g-bg':               '#F5F3ED',
    '--g-card':             '#FFFFFF',
    '--g-card-alt':         '#F0EDE3',
    '--g-border':           'rgba(13,27,62,0.10)',
    '--g-border-gold':      'rgba(168,135,46,0.30)',
    '--g-gold':             '#A8872E',
    '--g-gold-dim':         'rgba(168,135,46,0.75)',
    '--g-gold-fill':        'rgba(168,135,46,0.10)',
    '--g-gold-fill-strong': 'rgba(168,135,46,0.18)',
    '--g-gold-hover':       'rgba(168,135,46,0.06)',
    '--g-gold-grad-end':    '#D4B860',
    '--g-text':             '#0D1B3E',
    '--g-text-dim':         'rgba(13,27,62,0.70)',
    '--g-text-muted':       'rgba(13,27,62,0.45)',
    '--g-field':            '#FAFAF5',
    '--g-field-subtle':     '#F6F4EC',
    '--g-row-alt':          'rgba(13,27,62,0.025)',
    '--g-shadow':           '0 2px 12px rgba(13,27,62,0.06)',
  },
  dark: {
    '--g-bg':               '#060D1F',
    '--g-card':             '#0D1B3E',
    '--g-card-alt':         '#0A1428',
    '--g-border':           'rgba(255,255,255,0.08)',
    '--g-border-gold':      'rgba(201,168,76,0.20)',
    '--g-gold':             '#C9A84C',
    '--g-gold-dim':         'rgba(201,168,76,0.60)',
    '--g-gold-fill':        'rgba(201,168,76,0.10)',
    '--g-gold-fill-strong': 'rgba(201,168,76,0.16)',
    '--g-gold-hover':       'rgba(201,168,76,0.05)',
    '--g-gold-grad-end':    '#EDD68A',
    '--g-text':             '#FAF7F0',
    '--g-text-dim':         'rgba(255,255,255,0.55)',
    '--g-text-muted':       'rgba(255,255,255,0.30)',
    '--g-field':            'rgba(255,255,255,0.04)',
    '--g-field-subtle':     'rgba(255,255,255,0.03)',
    '--g-row-alt':          'rgba(255,255,255,0.015)',
    '--g-shadow':           '0 4px 24px rgba(0,0,0,0.4)',
  },
};

// ─── Theme persistence + context ──────────────────────────────────────────────
const THEME_KEY = 'kle_admin_theme';
function getStoredTheme(): ThemeName {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch { /* ignore */ }
  return 'light';
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
      {items.map(t => (
        <div key={t.id} className="px-4 py-3 rounded-xl text-sm font-medium max-w-xs"
          style={{
            background: t.type === 'success' ? 'rgba(37,211,102,0.18)' : t.type === 'error' ? 'rgba(239,68,68,0.18)' : 'rgba(201,168,76,0.18)',
            border: `1px solid ${t.type === 'success' ? 'rgba(37,211,102,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(201,168,76,0.4)'}`,
            color: t.type === 'success' ? '#25D366' : t.type === 'error' ? '#f87171' : G.gold,
            backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            fontFamily: 'Inter, sans-serif',
          }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: G.textDim, fontFamily: 'Inter, sans-serif' }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: G.textMuted }}>{hint}</p>}
    </div>
  );
}
function TInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
      style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text, fontFamily: 'Inter, sans-serif' }} />
  );
}
function TTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-vertical"
      style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text, fontFamily: 'Inter, sans-serif' }} />
  );
}
function SaveBtn({ status, onClick }: { status: SaveStatus; onClick: () => void }) {
  const cfg = {
    idle:   { color: G.gold,      label: 'Save Changes' },
    saving: { color: G.goldDim,   label: 'Saving…' },
    saved:  { color: '#25D366',   label: '✓ Saved!' },
    error:  { color: '#f87171',   label: '✗ Error' },
  }[status];
  return (
    <button onClick={onClick} disabled={status === 'saving'}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
      style={{ background: `linear-gradient(135deg, ${cfg.color}, color-mix(in srgb, ${cfg.color} 70%, transparent))`, color: G.onGold, opacity: status === 'saving' ? 0.7 : 1 }}>
      {cfg.label}
    </button>
  );
}
function StatusBadge({ customised, updatedAt }: { customised: boolean; updatedAt?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ background: customised ? '#25D366' : G.goldDim }} />
      <span className="text-xs" style={{ color: G.textMuted, fontFamily: 'Inter, sans-serif' }}>
        {customised ? `CMS active · Updated ${updatedAt ?? ''}` : 'Using hardcoded defaults'}
      </span>
    </div>
  );
}
function PublishHint() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg mb-5"
      style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
      <Info size={13} style={{ color: G.gold, flexShrink: 0, marginTop: 2 }} />
      <p className="text-xs leading-relaxed" style={{ color: G.textDim }}>
        Edit the fields below and press <strong style={{ color: G.text }}>Save Changes</strong>. Updates appear on the public website instantly — use <strong style={{ color: G.text }}>View Live</strong> in the top bar to verify.
      </p>
    </div>
  );
}

// ─── Image picker / upload field ──────────────────────────────────────────────
function ImageField({ label, value, onChange, token, images, onRefreshImages }: {
  label: string; value: string; onChange: (url: string) => void;
  token: string; images: R2Image[]; onRefreshImages: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadPct, setUploadPct]   = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploading(true); setUploadPct(0);
    try {
      const res = await uploadFile(files[0], token, setUploadPct);
      onChange(res.url); onRefreshImages();
    } catch (err) { alert((err as Error).message); }
    finally { setUploading(false); setUploadPct(0); }
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: G.textDim }}>{label}</label>
      <div className="flex gap-3 items-start">
        {value && <img src={value} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" style={{ border: `1px solid ${G.borderGold}` }} />}
        <div className="flex-1 space-y-2">
          <TInput value={value} onChange={onChange} placeholder="https://…" />
          <div className="flex gap-2">
            <button onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: G.goldFill, border: `1px solid ${G.borderGold}`, color: G.gold }}>
              <Image size={11} />Choose from Media
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: G.field, border: `1px solid ${G.border}`, color: G.textDim }}>
              <Upload size={11} />Upload New
            </button>
          </div>
          {uploading && (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: G.border }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${uploadPct}%`, background: G.gold }} />
            </div>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />

      {showPicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,13,31,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowPicker(false)}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}
            style={{ background: G.card, border: `1px solid ${G.borderGold}`, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: G.border }}>
              <h3 className="text-sm font-medium" style={{ color: G.text }}>Choose Image</h3>
              <button onClick={() => setShowPicker(false)} style={{ color: G.textMuted }}><X size={16} /></button>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map(img => (
                <button key={img.key} onClick={() => { onChange(img.url); setShowPicker(false); }}
                  className="relative group rounded-lg overflow-hidden aspect-video"
                  style={{ border: `1px solid ${G.border}` }}>
                  <img src={img.url} alt={img.key} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(8,17,35,0.7)' }}>
                    <Check size={20} style={{ color: G.gold }} />
                  </div>
                </button>
              ))}
              {images.length === 0 && (
                <p className="col-span-full text-center py-8 text-sm" style={{ color: G.textMuted }}>No images uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gold }: { icon: LucideIcon; label: string; value: number | string; gold?: boolean }) {
  return (
    <div className="rounded-xl p-5 flex items-center gap-4"
      style={{ background: G.card, border: `1px solid ${gold ? G.borderGold : G.border}` }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: gold ? G.goldFill : G.field }}>
        <Icon size={18} style={{ color: gold ? G.gold : G.textMuted }} />
      </div>
      <div>
        <p className="text-xs mb-0.5" style={{ color: G.textMuted, fontFamily: 'Inter, sans-serif' }}>{label}</p>
        <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: gold ? G.gold : G.text }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pin: string) => Promise<string | null> }) {
  const [pin, setPin]   = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!pin.trim()) { setErr('Enter the admin PIN'); return; }
    setBusy(true);
    const error = await onLogin(pin);
    setBusy(false);
    if (error) { setErr(error); setPin(''); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: G.bg }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: G.card, border: `1px solid ${G.borderGold}` }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${G.gold},transparent)`, marginBottom: 32, borderRadius: 1 }} />
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ border: `1px solid ${G.borderGold}`, background: G.goldHover }}>
            <Shield size={28} style={{ color: G.gold }} />
          </div>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: G.text }}>
            Admin Panel
          </h1>
          <p className="text-xs tracking-widest uppercase" style={{ color: G.textMuted }}>
            KLE Hotel Management · Secure Access
          </p>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg"
            style={{ background: G.field, border: `1px solid ${err ? 'rgba(239,68,68,0.5)' : G.border}` }}>
            <Shield size={14} style={{ color: G.goldDim, flexShrink: 0 }} />
            <input type={show ? 'text' : 'password'} placeholder="Enter admin PIN" value={pin}
              autoComplete="off"
              onChange={e => { setPin(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="flex-1 bg-transparent outline-none text-sm tracking-widest"
              style={{ color: G.text, fontFamily: 'Inter, sans-serif' }} />
            <button onClick={() => setShow(s => !s)} style={{ color: G.textMuted }}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {err && (
            <p className="text-xs text-center mt-2 flex items-center justify-center gap-1" style={{ color: '#f87171' }}>
              <AlertTriangle size={11} />{err}
            </p>
          )}
        </div>
        <button onClick={submit} disabled={busy}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{ background: `linear-gradient(135deg, ${G.gold}, ${G.goldGradEnd})`, color: G.onGold, opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Verifying…' : 'Access Dashboard'}
        </button>
        <p className="text-xs text-center mt-4" style={{ color: G.textMuted }}>
          5 failed attempts → 15-minute lockout
        </p>
      </div>
    </div>
  );
}

// ─── Top Bar (theme toggle, view live, help) ──────────────────────────────────
function TopBar({ theme, onTheme, tab, onMenu }: {
  theme: ThemeName; onTheme: (t: ThemeName) => void; tab: Tab; onMenu: () => void;
}) {
  const tabLabels: Record<Tab, string> = {
    dashboard: 'Dashboard', enquiries: 'Enquiries', analytics: 'Analytics',
    content: 'Website Content', media: 'Media Library', security: 'Security',
  };
  const openLive = () => {
    // Cache-bust so the website tab is forced to refetch fresh content
    window.open(`/?_t=${Date.now()}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 py-3"
      style={{
        background: G.card,
        borderBottom: `1px solid ${G.border}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenu}
          className="lg:hidden p-2 rounded-lg flex-shrink-0"
          aria-label="Open menu"
          style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }}>
          <Menu size={16} />
        </button>
        <span className="text-xs tracking-widest uppercase truncate" style={{ color: G.goldDim, fontFamily: 'Inter, sans-serif' }}>
          {tabLabels[tab]}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme toggle */}
        <div className="flex items-center rounded-lg p-0.5"
          style={{ background: G.field, border: `1px solid ${G.border}` }}>
          {(['light', 'dark'] as const).map(t => (
            <button key={t} onClick={() => onTheme(t)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
              title={t === 'light' ? 'Light theme' : 'Dark theme'}
              style={{
                background: theme === t ? G.goldFill : 'transparent',
                color: theme === t ? G.gold : G.textMuted,
                border: theme === t ? `1px solid ${G.borderGold}` : '1px solid transparent',
              }}>
              {t === 'light' ? <Sun size={12} /> : <Moon size={12} />}
              <span className="hidden sm:inline capitalize">{t}</span>
            </button>
          ))}
        </div>
        {/* View live */}
        <button onClick={openLive}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
          title="Open the public website with the latest changes"
          style={{ background: G.goldFill, border: `1px solid ${G.borderGold}`, color: G.gold }}>
          <ExternalLink size={12} />
          <span className="hidden sm:inline">View Live</span>
        </button>
      </div>
    </header>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; icon: LucideIcon; label: string; sub: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard',  sub: 'Overview'      },
  { id: 'enquiries', icon: Inbox,           label: 'Enquiries',  sub: 'Messages'      },
  { id: 'analytics', icon: BarChart2,       label: 'Analytics',  sub: 'Visitor Stats' },
  { id: 'content',   icon: Edit3,           label: 'Content',    sub: 'Edit Website'  },
  { id: 'media',     icon: Image,           label: 'Media',      sub: 'Images & R2'   },
  { id: 'security',  icon: Shield,          label: 'Security',   sub: 'Auth & PIN'    },
];

function Sidebar({ active, onTab, onLogout, enquiryCount, open, onClose }: {
  active: Tab; onTab: (t: Tab) => void; onLogout: () => void; enquiryCount: number;
  open: boolean; onClose: () => void;
}) {
  const handlePick = (t: Tab) => { onTab(t); onClose(); };
  return (
    <>
      {/* Backdrop on mobile when drawer open */}
      {open && (
        <div onClick={onClose}
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        />
      )}
      <aside
        className={`flex-shrink-0 w-60 flex flex-col fixed lg:sticky inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: G.bg, borderRight: `1px solid ${G.border}`, minHeight: '100vh', top: 0 }}>
      {/* Brand */}
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: G.border }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: G.goldFillStrong, border: `1px solid ${G.borderGold}` }}>
            <span className="text-xs font-bold" style={{ color: G.gold, fontFamily: 'Inter, sans-serif' }}>KLE</span>
          </div>
          <div>
            <p className="text-sm font-medium leading-tight" style={{ color: G.text, fontFamily: 'Cormorant Garamond, serif' }}>Admin Panel</p>
            <p className="text-[10px]" style={{ color: G.textMuted }}>Hotel Management</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg" aria-label="Close menu"
          style={{ color: G.textMuted }}>
          <X size={14} />
        </button>
      </div>
      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => handlePick(n.id)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all relative"
            style={{
              background: active === n.id ? G.goldFill : 'transparent',
              border: `1px solid ${active === n.id ? G.borderGold : 'transparent'}`,
            }}>
            <n.icon size={16} style={{ color: active === n.id ? G.gold : G.textMuted }} />
            <div>
              <p className="text-xs font-medium leading-tight" style={{ color: active === n.id ? G.text : G.textDim }}>{n.label}</p>
              <p className="text-[10px]" style={{ color: G.textMuted }}>{n.sub}</p>
            </div>
            {n.id === 'enquiries' && enquiryCount > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold min-w-5 h-5 rounded-full flex items-center justify-center px-1"
                style={{ background: G.gold, color: G.onGold }}>{enquiryCount}</span>
            )}
          </button>
        ))}
      </nav>
      {/* Bottom links */}
      <div className="p-3 border-t" style={{ borderColor: G.border }}>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 w-full"
          style={{ color: G.textMuted }}>
          <Globe size={14} /><span className="text-xs">View Website</span>
        </a>
        <button onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg w-full"
          style={{ color: 'rgba(239,68,68,0.7)' }}>
          <LogOut size={14} /><span className="text-xs">Sign Out</span>
        </button>
      </div>
      </aside>
    </>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ total, stats, recentEnquiries }: {
  total: number; stats: Stats | null; recentEnquiries: Enquiry[];
}) {
  const expiresAt = sessionStorage.getItem('kle_admin_expiry') ?? '';
  const expiresIn = expiresAt ? Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 3600000)) : 0;
  const [showHelp, setShowHelp] = useState(() => {
    try { return localStorage.getItem('kle_admin_seen_help') !== '1'; } catch { return true; }
  });
  const dismissHelp = () => {
    setShowHelp(false);
    try { localStorage.setItem('kle_admin_seen_help', '1'); } catch { /* ignore */ }
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Dashboard</h2>
        <p className="text-xs" style={{ color: G.textMuted }}>Session active \u00b7 Expires in ~{expiresIn}h</p>
      </div>

      {showHelp && (
        <div className="rounded-xl p-5 mb-6 flex items-start gap-3"
          style={{ background: G.goldHover, border: `1px solid ${G.borderGold}` }}>
          <Sparkles size={18} style={{ color: G.gold, flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-2" style={{ color: G.text }}>Welcome to your admin panel</p>
            <ul className="text-xs space-y-1 list-disc list-inside" style={{ color: G.textDim }}>
              <li><strong style={{ color: G.text }}>Content</strong> \u2014 edit Hero, About, Programs, and Contact text shown on your website.</li>
              <li><strong style={{ color: G.text }}>Media</strong> \u2014 upload images (auto-compressed and stored on Cloudflare R2).</li>
              <li><strong style={{ color: G.text }}>Enquiries</strong> \u2014 see who has filled the popup form and reply on WhatsApp.</li>
              <li><strong style={{ color: G.text }}>View Live</strong> (top right) \u2014 opens the public website with your latest changes.</li>
            </ul>
          </div>
          <button onClick={dismissHelp} className="p-1" style={{ color: G.textMuted }} title="Got it">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}      label="Total Enquiries" value={total}                              gold />
        <StatCard icon={Calendar}   label="Today"           value={stats?.today ?? 0} />
        <StatCard icon={TrendingUp} label="This Week"       value={stats?.week ?? 0} />
        <StatCard icon={Inbox}      label="Top Interest"    value={stats?.by_interest?.[0]?.interest ?? '—'} />
      </div>
      {stats?.by_interest && stats.by_interest.length > 0 && (
        <div className="rounded-xl p-5 mb-8 flex flex-wrap gap-3" style={{ background: G.card, border: `1px solid ${G.border}` }}>
          <p className="w-full text-xs font-medium mb-1" style={{ color: G.goldDim }}>ENQUIRY BREAKDOWN</p>
          {stats.by_interest.map(b => (
            <div key={b.interest} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: G.goldFill, border: `1px solid ${G.borderGold}` }}>
              <span className="text-xs" style={{ color: G.gold }}>{b.interest}</span>
              <span className="text-xs font-bold" style={{ color: G.text }}>{b.cnt}</span>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
        <div className="px-5 py-3" style={{ background: G.cardAlt, borderBottom: `1px solid ${G.border}` }}>
          <span className="text-xs tracking-widest uppercase" style={{ color: G.goldDim }}>Recent Enquiries</span>
        </div>
        <div className="overflow-x-auto">
        {recentEnquiries.slice(0, 5).map((e, i) => (
          <div key={e.id} className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-5 py-3 items-center min-w-[480px]"
            style={{ background: i % 2 === 0 ? G.card : G.rowAlt, borderBottom: `1px solid ${G.border}` }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: G.goldFill, border: `1px solid ${G.borderGold}` }}>
                <User size={11} style={{ color: G.gold }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: G.text }}>{e.name}</p>
                <p className="text-[10px]" style={{ color: G.textMuted }}>+91 {e.phone}</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full w-fit" style={{ background: G.goldFill, color: G.gold }}>{e.interest}</span>
            <span className="text-[10px]" style={{ color: G.textMuted }}>{formatDate(e.created_at)}</span>
          </div>
        ))}
        {recentEnquiries.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: G.textMuted, background: G.card }}>No enquiries yet.</p>
        )}
        </div>
      </div>
    </div>
  );
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────
function EnquiriesTab({ enquiries, stats, total, page, loading, deleting, search,
  onSearch, onDelete, onRefresh, onPage }: {
  enquiries: Enquiry[]; stats: Stats | null; total: number; page: number;
  loading: boolean; deleting: number | null; search: string;
  onSearch: (s: string) => void; onDelete: (id: number) => void;
  onRefresh: () => void; onPage: (p: number) => void;
}) {
  const filtered = search.trim()
    ? enquiries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search) ||
        e.interest.toLowerCase().includes(search.toLowerCase()))
    : enquiries;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Enquiries</h2>
          <p className="text-xs" style={{ color: G.textMuted }}>{total} total · {stats?.today ?? 0} today</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
            style={{ background: G.field, border: `1px solid ${G.border}`, color: G.textDim }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Refresh
          </button>
          <button onClick={() => exportCSV(enquiries)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
            style={{ background: G.goldFill, border: `1px solid ${G.borderGold}`, color: G.gold }}>
            <Download size={12} />Export CSV
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <Search size={14} style={{ color: G.textMuted }} />
        <input type="text" placeholder="Search name, phone, interest…" value={search}
          onChange={e => onSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm min-w-0" style={{ color: G.text }} />
        {search && <button onClick={() => onSearch('')} style={{ color: G.textMuted }}><X size={14} /></button>}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
        <div className="overflow-x-auto">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-3 min-w-[720px]"
          style={{ background: G.cardAlt, borderBottom: `1px solid ${G.border}` }}>
          {['Name', 'Phone', 'Interest', 'Date', 'Actions'].map(h => (
            <span key={h} className="text-[10px] tracking-widest uppercase" style={{ color: G.goldDim }}>{h}</span>
          ))}
        </div>
        {loading && enquiries.length === 0
          ? <div className="py-16 text-center text-sm" style={{ color: G.textMuted, background: G.card }}>Loading…</div>
          : filtered.length === 0
          ? <div className="py-16 text-center text-sm" style={{ color: G.textMuted, background: G.card }}>No enquiries found.</div>
          : filtered.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-4 items-center min-w-[720px]"
              style={{ background: i % 2 === 0 ? G.card : G.rowAlt, borderBottom: `1px solid ${G.border}` }}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: G.goldFill, border: `1px solid ${G.borderGold}` }}>
                  <User size={11} style={{ color: G.gold }} />
                </div>
                <span className="text-sm font-medium truncate" style={{ color: G.text }}>{e.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={10} style={{ color: G.textMuted }} />
                <span className="text-xs" style={{ color: G.textDim }}>+91 {e.phone}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full w-fit" style={{ background: G.goldFill, color: G.gold }}>{e.interest}</span>
              <span className="text-[11px]" style={{ color: G.textMuted }}>{formatDate(e.created_at)}</span>
              <div className="flex gap-2">
                <a href={waLink(e)} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)' }}>
                  <MessageCircle size={13} style={{ color: '#25d366' }} />
                </a>
                <button onClick={() => onDelete(e.id)} disabled={deleting === e.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <Trash2 size={13} style={{ color: 'rgba(239,68,68,0.6)' }} />
                </button>
              </div>
            </div>
          ))
        }
        </div>
      </div>
      {total > 50 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: G.textMuted }}>
            {Math.min((page - 1) * 50 + 1, total)}–{Math.min(page * 50, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => onPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
              style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text }}>Previous</button>
            <button disabled={page * 50 >= total} onClick={() => onPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
              style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero Editor ──────────────────────────────────────────────────────────────
function HeroEditor({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [data, setData]             = useState<HeroContent>(DEFAULT_CONTENT.hero);
  const [status, setStatus]         = useState<SaveStatus>('idle');
  const [customised, setCustomised] = useState(false);
  const [updatedAt, setUpdatedAt]   = useState('');

  useEffect(() => {
    fetch('/api/content/hero')
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok: boolean; data?: HeroContent } | null) => {
        if (d?.ok && d.data) { setData(d.data); setCustomised(true); }
      }).catch(() => null);
  }, []);

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/content/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const d = await res.json() as { ok: boolean };
      if (d.ok) {
        setStatus('saved'); setCustomised(true);
        setUpdatedAt(new Date().toLocaleTimeString('en-IN'));
        addToast('Hero section saved!', 'success');
        broadcastCmsUpdate();
      } else { setStatus('error'); addToast('Save failed', 'error'); }
    } catch { setStatus('error'); addToast('Network error', 'error'); }
    finally { setTimeout(() => setStatus('idle'), 2500); }
  };

  const updStat = (i: number, key: keyof HeroContent['stats'][0], val: string) => {
    const stats = [...data.stats];
    stats[i] = { ...stats[i], [key]: key === 'value' ? (Number(val) || val) : val };
    setData({ ...data, stats });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Hero Section</h3>
          <StatusBadge customised={customised} updatedAt={updatedAt} />
        </div>
        <SaveBtn status={status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Top Badge Label" hint="Small label above heading">
          <TInput value={data.badge_label ?? ''} onChange={v => setData({ ...data, badge_label: v })} placeholder="KLE Graduate School" />
        </Field>
        <Field label="Location Pill">
          <TInput value={data.location_label ?? ''} onChange={v => setData({ ...data, location_label: v })} placeholder="Belagavi, Karnataka" />
        </Field>
        <Field label="Main Heading">
          <TInput value={data.heading} onChange={v => setData({ ...data, heading: v })} placeholder="Your Place in the World of Hospitality" />
        </Field>
        <Field label="Accreditation Badge">
          <TInput value={data.accreditation} onChange={v => setData({ ...data, accreditation: v })} />
        </Field>
        <Field label="Subtitle">
          <TTextarea value={data.subtitle} onChange={v => setData({ ...data, subtitle: v })} rows={3} />
        </Field>
        <div className="space-y-4">
          <Field label="Primary CTA Button">
            <TInput value={data.cta_primary} onChange={v => setData({ ...data, cta_primary: v })} placeholder="Apply Now" />
          </Field>
          <Field label="Secondary CTA Button">
            <TInput value={data.cta_secondary} onChange={v => setData({ ...data, cta_secondary: v })} placeholder="Explore Programs" />
          </Field>
        </div>
        <div className="md:col-span-2">
          <ImageField label="Background Image" value={data.bg_image} onChange={v => setData({ ...data, bg_image: v })}
            token={token} images={images} onRefreshImages={onRefreshImages} />
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-medium mb-3" style={{ color: G.goldDim }}>STATS BAR (4 cards)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.stats.map((s, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
                <TInput value={String(s.value)} onChange={v => updStat(i, 'value', v)} placeholder="25" />
                <TInput value={s.suffix}        onChange={v => updStat(i, 'suffix', v)} placeholder="+" />
                <TInput value={s.label}         onChange={v => updStat(i, 'label', v)}  placeholder="Years" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── About Editor ─────────────────────────────────────────────────────────────
function AboutEditor({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [data, setData]             = useState<AboutContent>(DEFAULT_CONTENT.about);
  const [status, setStatus]         = useState<SaveStatus>('idle');
  const [customised, setCustomised] = useState(false);
  const [updatedAt, setUpdatedAt]   = useState('');

  useEffect(() => {
    fetch('/api/content/about')
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok: boolean; data?: AboutContent } | null) => {
        if (d?.ok && d.data) { setData(d.data); setCustomised(true); }
      }).catch(() => null);
  }, []);

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const d = await res.json() as { ok: boolean };
      if (d.ok) {
        setStatus('saved'); setCustomised(true);
        setUpdatedAt(new Date().toLocaleTimeString('en-IN'));
        addToast('About section saved!', 'success');
        broadcastCmsUpdate();
      } else { setStatus('error'); addToast('Save failed', 'error'); }
    } catch { setStatus('error'); addToast('Network error', 'error'); }
    finally { setTimeout(() => setStatus('idle'), 2500); }
  };

  const updStat    = (i: number, k: 'value' | 'label', v: string) => {
    const stats = [...data.stats]; stats[i] = { ...stats[i], [k]: v }; setData({ ...data, stats });
  };
  const updPillar  = (i: number, k: 'title' | 'desc', v: string) => {
    const pillars = [...data.pillars]; pillars[i] = { ...pillars[i], [k]: v }; setData({ ...data, pillars });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>About Section</h3>
          <StatusBadge customised={customised} updatedAt={updatedAt} />
        </div>
        <SaveBtn status={status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label" hint="Small label above the H2">
          <TInput value={data.section_label ?? ''} onChange={v => setData({ ...data, section_label: v })} placeholder="About KLE Hotel Management" />
        </Field>
        <Field label="Tagline strip" hint="e.g. Learn · Prosper · Excel">
          <TInput value={data.tagline ?? ''} onChange={v => setData({ ...data, tagline: v })} placeholder="Learn · Prosper · Excel" />
        </Field>
        <Field label="H2 — main text" hint="Before the gold word">
          <TInput value={data.heading_main ?? ''} onChange={v => setData({ ...data, heading_main: v })} placeholder="A Legacy of" />
        </Field>
        <Field label="H2 — gold word(s)">
          <TInput value={data.heading_em ?? ''} onChange={v => setData({ ...data, heading_em: v })} placeholder="Hospitality Excellence" />
        </Field>
        <Field label="H2 — after gold" hint="Trailing text after the gold phrase">
          <TInput value={data.heading_after ?? ''} onChange={v => setData({ ...data, heading_after: v })} placeholder="Since 1997" />
        </Field>
        <div />
        <Field label="Established year (badge)"><TInput value={data.established_year ?? ''} onChange={v => setData({ ...data, established_year: v })} placeholder="1997" /></Field>
        <Field label="Established caption"><TInput value={data.established_caption ?? ''} onChange={v => setData({ ...data, established_caption: v })} placeholder="Belagavi, Karnataka" /></Field>
        <Field label="Heading (legacy / SEO)"><TInput value={data.heading}    onChange={v => setData({ ...data, heading: v })} /></Field>
        <Field label="Subheading (legacy / SEO)"><TInput value={data.subheading} onChange={v => setData({ ...data, subheading: v })} /></Field>
        <Field label="Paragraph 1"><TTextarea value={data.desc_1} onChange={v => setData({ ...data, desc_1: v })} rows={4} /></Field>
        <Field label="Paragraph 2"><TTextarea value={data.desc_2} onChange={v => setData({ ...data, desc_2: v })} rows={4} /></Field>
        <div className="md:col-span-2">
          <ImageField label="Section Image" value={data.image} onChange={v => setData({ ...data, image: v })}
            token={token} images={images} onRefreshImages={onRefreshImages} />
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-medium mb-3" style={{ color: G.goldDim }}>STAT HIGHLIGHTS</p>
          <div className="grid grid-cols-3 gap-3">
            {data.stats.map((s, i) => (
              <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
                <TInput value={s.value} onChange={v => updStat(i, 'value', v)} placeholder="25+" />
                <TInput value={s.label} onChange={v => updStat(i, 'label', v)} placeholder="Years" />
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="text-xs font-medium mb-3" style={{ color: G.goldDim }}>PILLARS (3 cards)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.pillars.map((p, i) => (
              <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
                <TInput   value={p.title} onChange={v => updPillar(i, 'title', v)} placeholder="Title" />
                <TTextarea value={p.desc} onChange={v => updPillar(i, 'desc',  v)} rows={3} placeholder="Description" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Programs Editor ──────────────────────────────────────────────────────────
function ProgramsEditor({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [data, setData]             = useState<ProgramItem[]>(DEFAULT_CONTENT.programs);
  const [header, setHeader]         = useState<ProgramsHeader>(DEFAULT_CONTENT.programs_header ?? {});
  const [status, setStatus]         = useState<SaveStatus>('idle');
  const [customised, setCustomised] = useState(false);
  const [updatedAt, setUpdatedAt]   = useState('');
  const [open, setOpen]             = useState(0);

  useEffect(() => {
    fetch('/api/content/programs')
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok: boolean; data?: ProgramItem[] } | null) => {
        if (d?.ok && d.data) { setData(d.data); setCustomised(true); }
      }).catch(() => null);
    fetch('/api/content/programs_header')
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok: boolean; data?: ProgramsHeader } | null) => {
        if (d?.ok && d.data) setHeader({ ...DEFAULT_CONTENT.programs_header, ...d.data });
      }).catch(() => null);
  }, []);

  const save = async () => {
    setStatus('saving');
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/content/programs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data),
        }),
        fetch('/api/content/programs_header', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(header),
        }),
      ]);
      const d1 = await r1.json() as { ok: boolean };
      const d2 = await r2.json() as { ok: boolean };
      if (d1.ok && d2.ok) {
        setStatus('saved'); setCustomised(true);
        setUpdatedAt(new Date().toLocaleTimeString('en-IN'));
        addToast('Programs saved!', 'success');
        broadcastCmsUpdate();
      } else { setStatus('error'); addToast('Save failed', 'error'); }
    } catch { setStatus('error'); addToast('Network error', 'error'); }
    finally { setTimeout(() => setStatus('idle'), 2500); }
  };

  const upd = (i: number, key: keyof ProgramItem, v: string) => {
    const next = [...data];
    if (key === 'tags') next[i] = { ...next[i], tags: v.split(',').map(t => t.trim()).filter(Boolean) };
    else next[i] = { ...next[i], [key]: v };
    setData(next);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Programs</h3>
          <StatusBadge customised={customised} updatedAt={updatedAt} />
        </div>
        <SaveBtn status={status} onClick={save} />
      </div>
      <PublishHint />
      <div className="mb-5 p-4 rounded-xl" style={{ background: G.cardAlt, border: `1px solid ${G.border}` }}>
        <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: G.goldDim }}>Section Header</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Section Label"><TInput value={header.section_label ?? ''} onChange={v => setHeader({ ...header, section_label: v })} placeholder="Our Programs" /></Field>
          <Field label="Subtitle"><TInput value={header.subtitle ?? ''} onChange={v => setHeader({ ...header, subtitle: v })} placeholder="3-year undergraduate programs..." /></Field>
          <Field label="Heading (main)"><TInput value={header.heading_main ?? ''} onChange={v => setHeader({ ...header, heading_main: v })} placeholder="Degrees That Open" /></Field>
          <Field label="Heading (gold)"><TInput value={header.heading_em ?? ''} onChange={v => setHeader({ ...header, heading_em: v })} placeholder="Hotel Doors" /></Field>
          <div className="md:col-span-2">
            <Field label="Bottom note"><TTextarea value={header.bottom_note ?? ''} onChange={v => setHeader({ ...header, bottom_note: v })} rows={2} placeholder="All programs include 6-month industrial training..." /></Field>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((prog, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${i === open ? G.borderGold : G.border}` }}>
            <button className="w-full flex items-center justify-between px-5 py-4" style={{ background: G.card }}
              onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: G.goldFill, color: G.gold }}>{i + 1}</span>
                <span className="text-sm font-medium" style={{ color: G.text }}>{prog.title}</span>
                <span className="text-xs" style={{ color: G.textMuted }}>{prog.subtitle}</span>
              </div>
              <ChevronDown size={14} style={{ color: G.textMuted, transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {open === i && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t" style={{ borderColor: G.border, background: G.cardAlt }}>
                <Field label="Title"><TInput value={prog.title}    onChange={v => upd(i, 'title', v)} /></Field>
                <Field label="Subtitle / Dept"><TInput value={prog.subtitle} onChange={v => upd(i, 'subtitle', v)} /></Field>
                <Field label="Duration"><TInput value={prog.duration}  onChange={v => upd(i, 'duration', v)} placeholder="3 Years" /></Field>
                <Field label="Tags" hint="Comma-separated">
                  <TInput value={prog.tags.join(', ')} onChange={v => upd(i, 'tags', v)} placeholder="Food Production, Nutrition" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description"><TTextarea value={prog.desc} onChange={v => upd(i, 'desc', v)} rows={3} /></Field>
                </div>
                <div className="md:col-span-2">
                  <ImageField label="Program Image" value={prog.image} onChange={v => upd(i, 'image', v)}
                    token={token} images={images} onRefreshImages={onRefreshImages} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contact Editor ───────────────────────────────────────────────────────────
function ContactEditor({ token, addToast }: {
  token: string; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [data, setData]             = useState<ContactContent>(DEFAULT_CONTENT.contact);
  const [status, setStatus]         = useState<SaveStatus>('idle');
  const [customised, setCustomised] = useState(false);
  const [updatedAt, setUpdatedAt]   = useState('');

  useEffect(() => {
    fetch('/api/content/contact')
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok: boolean; data?: ContactContent } | null) => {
        if (d?.ok && d.data) { setData(d.data); setCustomised(true); }
      }).catch(() => null);
  }, []);

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/content/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const d = await res.json() as { ok: boolean };
      if (d.ok) {
        setStatus('saved'); setCustomised(true);
        setUpdatedAt(new Date().toLocaleTimeString('en-IN'));
        addToast('Contact info saved!', 'success');
        broadcastCmsUpdate();
      } else { setStatus('error'); addToast('Save failed', 'error'); }
    } catch { setStatus('error'); addToast('Network error', 'error'); }
    finally { setTimeout(() => setStatus('idle'), 2500); }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Contact & Settings</h3>
          <StatusBadge customised={customised} updatedAt={updatedAt} />
        </div>
        <SaveBtn status={status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Phone Number">
          <TInput value={data.phone} onChange={v => setData({ ...data, phone: v })} placeholder="+91 63645 04056" />
        </Field>
        <Field label="Email Address">
          <TInput value={data.email} onChange={v => setData({ ...data, email: v })} type="email" />
        </Field>
        <Field label="WhatsApp Number" hint="Digits only, e.g. 916364504056">
          <TInput value={data.whatsapp} onChange={v => setData({ ...data, whatsapp: v })} />
        </Field>
        <Field label="Batch Year">
          <TInput value={data.batch_year} onChange={v => setData({ ...data, batch_year: v })} placeholder="2026" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Address"><TTextarea value={data.address} onChange={v => setData({ ...data, address: v })} rows={2} /></Field>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
            <button onClick={() => setData({ ...data, admission_open: !data.admission_open })}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{ background: data.admission_open ? '#25D366' : `color-mix(in srgb, ${G.text} 22%, transparent)` }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: data.admission_open ? '1.25rem' : '0.125rem' }} />
            </button>
            <div>
              <p className="text-sm font-medium" style={{ color: G.text }}>Admissions Open</p>
              <p className="text-xs" style={{ color: G.textMuted }}>
                Currently: <strong style={{ color: data.admission_open ? '#25D366' : '#f87171' }}>
                  {data.admission_open ? 'OPEN' : 'CLOSED'}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Content Tab (sub-nav wrapper) ────────────────────────────────────────────
function ContentTab({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [section, setSection] = useState<ContentSection>('hero');
  const sections: { id: ContentSection; label: string }[] = [
    { id: 'hero', label: 'Hero' }, { id: 'about', label: 'About' },
    { id: 'programs', label: 'Programs' }, { id: 'placements', label: 'Placements' },
    { id: 'facilities', label: 'Facilities' }, { id: 'curriculum', label: 'Curriculum' },
    { id: 'student_life', label: 'Student Life' }, { id: 'testimonials', label: 'Testimonials' },
    { id: 'admission', label: 'Admission' }, { id: 'contact', label: 'Contact' },
    { id: 'footer', label: 'Footer' },
  ];
  return (
    <div>
      <div className="border-b px-4 sm:px-6 flex gap-1 overflow-x-auto" style={{ borderColor: G.border, background: G.cardAlt }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-4 py-3 text-xs font-medium transition-all relative flex-shrink-0"
            style={{ color: section === s.id ? G.gold : G.textMuted }}>
            {s.label}
            {section === s.id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: G.gold }} />}
          </button>
        ))}
      </div>
      {section === 'hero'     && <HeroEditor     token={token} images={images} onRefreshImages={onRefreshImages} addToast={addToast} />}
      {section === 'about'    && <AboutEditor    token={token} images={images} onRefreshImages={onRefreshImages} addToast={addToast} />}
      {section === 'programs' && <ProgramsEditor token={token} images={images} onRefreshImages={onRefreshImages} addToast={addToast} />}
      {section === 'contact'  && <ContactEditor  token={token}                                                    addToast={addToast} />}
      {section === 'placements'   && <PlacementsEditor   token={token} images={images} onRefreshImages={onRefreshImages} addToast={addToast} />}
      {section === 'facilities'   && <FacilitiesEditor   token={token} addToast={addToast} />}
      {section === 'curriculum'   && <CurriculumEditor   token={token} images={images} onRefreshImages={onRefreshImages} addToast={addToast} />}
      {section === 'student_life' && <StudentLifeEditor  token={token} addToast={addToast} />}
      {section === 'testimonials' && <TestimonialsEditor token={token} images={images} onRefreshImages={onRefreshImages} addToast={addToast} />}
      {section === 'admission'    && <AdmissionEditor    token={token} addToast={addToast} />}
      {section === 'footer'       && <FooterEditor       token={token} addToast={addToast} />}
    </div>
  );
}

// ─── Media Tab ────────────────────────────────────────────────────────────────
function MediaTab({ token, images, loading, onRefresh, addToast }: {
  token: string; images: R2Image[]; loading: boolean;
  onRefresh: () => void; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploading(true); setUploadPct(0);
    try {
      const r = await uploadFile(files[0], token, setUploadPct);
      const saved = r.originalBytes > 0 ? Math.round((1 - r.compressedBytes / r.originalBytes) * 100) : 0;
      addToast(`Uploaded ${r.filename} · ${fmtBytes(r.originalBytes)} → ${fmtBytes(r.compressedBytes)} (${saved}% smaller)`, 'success');
      onRefresh();
    } catch (err) { addToast((err as Error).message, 'error'); }
    finally { setUploading(false); setUploadPct(0); }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Delete ${key.split('/').pop()}?`)) return;
    setDeleting(key);
    try {
      const res = await fetch(`/api/images?key=${encodeURIComponent(key)}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      const d = await res.json() as { ok: boolean };
      if (d.ok) { addToast('Deleted', 'success'); onRefresh(); }
      else { addToast('Delete failed', 'error'); }
    } catch { addToast('Network error', 'error'); }
    finally { setDeleting(null); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => { setCopied(url); setTimeout(() => setCopied(null), 2000); })
      .catch(() => addToast('Copy failed', 'error'));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Media Library</h2>
          <p className="text-xs" style={{ color: G.textMuted }}>{images.length} images · Cloudflare R2 Storage</p>
        </div>
        <button onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
          style={{ background: G.field, border: `1px solid ${G.border}`, color: G.textDim }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Refresh
        </button>
      </div>
      {/* Upload zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl border-2 border-dashed p-10 text-center mb-6 cursor-pointer transition-all"
        style={{
          borderColor: dragging ? G.gold : G.border,
          background: dragging ? G.goldHover : G.fieldSubtle,
        }}>
        <Upload size={28} className="mx-auto mb-3" style={{ color: dragging ? G.gold : G.textMuted }} />
        <p className="text-sm font-medium mb-1" style={{ color: dragging ? G.gold : G.text }}>
          {uploading ? `Uploading\u2026 ${uploadPct}%` : 'Drop images here or click to choose'}
        </p>
        <p className="text-xs" style={{ color: G.textMuted }}>
          JPG, PNG, WebP, GIF \u00b7 Up to 10\u00a0MB \u00b7 Auto-compressed to WebP and stored on Cloudflare R2
        </p>
        {uploading && (
          <div className="mt-4 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto" style={{ background: G.border }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${uploadPct}%`, background: G.gold }} />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map(img => (
          <div key={img.key} className="group rounded-xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
            <div className="aspect-video overflow-hidden" style={{ background: G.cardAlt }}>
              <img src={img.url} alt={img.key} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            </div>
            <div className="p-3" style={{ background: G.card }}>
              <p className="text-xs truncate font-medium mb-0.5" style={{ color: G.text }}>{img.key.replace('images/', '')}</p>
              <p className="text-[10px] mb-2" style={{ color: G.textMuted }}>{fmtBytes(img.size)}</p>
              <div className="flex gap-1.5">
                <button onClick={() => copyUrl(img.url)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px]"
                  style={{
                    background: copied === img.url ? 'rgba(37,211,102,0.15)' : G.field,
                    color: copied === img.url ? '#25D366' : G.textMuted,
                    border: `1px solid ${G.border}`,
                  }}>
                  {copied === img.url ? <Check size={9} /> : <Copy size={9} />}
                  {copied === img.url ? 'Copied!' : 'Copy URL'}
                </button>
                <button onClick={() => handleDelete(img.key)} disabled={deleting === img.key}
                  className="w-8 flex items-center justify-center py-1.5 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.6)' }}>
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && images.length === 0 && (
          <p className="col-span-full text-center py-8 text-sm" style={{ color: G.textMuted }}>No images yet. Upload above.</p>
        )}
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ token, onLogout, addToast }: {
  token: string; onLogout: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [newPin, setNewPin]     = useState('');
  const [confPin, setConfPin]   = useState('');
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [revoking, setRevoking] = useState(false);

  const expiresAt = sessionStorage.getItem('kle_admin_expiry') ?? '';

  const changePin = async () => {
    if (newPin.length < 12) { addToast('PIN must be at least 12 characters', 'error'); return; }
    if (newPin !== confPin)  { addToast('PINs do not match', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_pin: newPin }),
      });
      const d = await res.json() as { ok: boolean; message?: string; error?: string };
      if (d.ok) { addToast(d.message ?? 'PIN changed!', 'success'); setNewPin(''); setConfPin(''); }
      else { addToast(d.error ?? 'Change failed', 'error'); }
    } catch { addToast('Network error', 'error'); }
    finally { setSaving(false); }
  };

  const revokeAll = async () => {
    if (!confirm('This will log out ALL admin sessions. Continue?')) return;
    setRevoking(true);
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      const d = await res.json() as { ok: boolean };
      if (d.ok) { addToast('All sessions revoked', 'success'); onLogout(); }
      else { addToast('Failed to revoke', 'error'); }
    } catch { addToast('Network error', 'error'); }
    finally { setRevoking(false); }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Security</h2>
      {/* Session info */}
      <div className="rounded-xl p-5 mb-6" style={{ background: G.card, border: `1px solid ${G.borderGold}` }}>
        <p className="text-xs font-medium mb-3" style={{ color: G.goldDim }}>CURRENT SESSION</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-0.5" style={{ color: G.textMuted }}>Token (masked)</p>
            <p className="text-xs font-mono" style={{ color: G.textDim }}>{token ? `${token.slice(0, 8)}…${token.slice(-4)}` : '—'}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: G.textMuted }}>Expires at</p>
            <p className="text-xs" style={{ color: G.text }}>{expiresAt ? new Date(expiresAt).toLocaleString('en-IN') : '—'}</p>
          </div>
        </div>
      </div>
      {/* Change PIN */}
      <div className="rounded-xl p-5 mb-6" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <p className="text-xs font-medium mb-4" style={{ color: G.goldDim }}>CHANGE ADMIN PIN</p>
        <div className="space-y-4">
          <Field label="New PIN" hint="Minimum 12 characters — use letters, numbers, and symbols">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: G.field, border: `1px solid ${G.border}` }}>
              <input type={showNew ? 'text' : 'password'} value={newPin} autoComplete="new-password"
                onChange={e => setNewPin(e.target.value)} placeholder="New PIN (min 12 chars)"
                className="flex-1 bg-transparent outline-none text-sm" style={{ color: G.text }} />
              <button onClick={() => setShowNew(s => !s)} style={{ color: G.textMuted }}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm New PIN">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: G.field, border: `1px solid ${G.border}` }}>
              <input type={showConf ? 'text' : 'password'} value={confPin} autoComplete="new-password"
                onChange={e => setConfPin(e.target.value)} placeholder="Repeat PIN"
                className="flex-1 bg-transparent outline-none text-sm" style={{ color: G.text }} />
              <button onClick={() => setShowConf(s => !s)} style={{ color: G.textMuted }}>
                {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <div className="flex items-center gap-3">
            <SaveBtn status={saving ? 'saving' : 'idle'} onClick={changePin} />
            {newPin && confPin && newPin === confPin && newPin.length >= 12 && (
              <span className="text-xs flex items-center gap-1" style={{ color: '#25D366' }}>
                <Check size={12} />PINs match
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Danger zone */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'rgba(239,68,68,0.8)' }}>DANGER ZONE</p>
        <p className="text-xs mb-4" style={{ color: G.textMuted }}>
          Invalidate all active admin sessions across all devices. You will be logged out immediately.
        </p>
        <button onClick={revokeAll} disabled={revoking}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', opacity: revoking ? 0.6 : 1 }}>
          <AlertTriangle size={14} />
          {revoking ? 'Revoking…' : 'Revoke All Sessions'}
        </button>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ token, addToast }: {
  token: string; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics', { headers: { 'Authorization': `Bearer ${token}` } });
      const d = await res.json() as Analytics & { ok: boolean };
      if (d.ok) setData(d);
      else addToast('Failed to load analytics', 'error');
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  }, [token, addToast]);

  useEffect(() => { load(); }, [load]);

  const EVENT_LABELS: Record<string, string> = {
    page_view: 'Page Views', apply_click: 'Apply Clicks',
    popup_open: 'Popup Opens', form_submit: 'Form Submits',
    wa_click: 'WhatsApp Clicks', popup_close: 'Popup Closed',
  };
  const EVENT_COLORS: Record<string, string> = {
    page_view: G.gold, apply_click: '#60a5fa', popup_open: '#a78bfa',
    form_submit: '#34d399', wa_click: '#25D366', popup_close: G.textMuted,
  };

  // Conversion funnel
  const views   = data?.by_event.find(e => e.event_type === 'page_view')?.cnt ?? 0;
  const popups  = data?.by_event.find(e => e.event_type === 'popup_open')?.cnt ?? 0;
  const submits = data?.by_event.find(e => e.event_type === 'form_submit')?.cnt ?? 0;
  const waCl    = data?.by_event.find(e => e.event_type === 'wa_click')?.cnt ?? 0;
  const pct = (n: number, d: number) => d > 0 ? `${Math.round((n / d) * 100)}%` : '—';

  // Chart max for daily bars
  const maxCnt = Math.max(...(data?.daily.map(d => d.cnt) ?? [1]), 1);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>
            Visitor Analytics
          </h2>
          <p className="text-xs" style={{ color: G.textMuted }}>Real-time data · Cloudflare D1</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs self-start sm:self-auto"
          style={{ background: G.field, border: `1px solid ${G.border}`, color: G.textDim }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}      label="Total Unique Visitors" value={data?.total ?? '—'} gold />
        <StatCard icon={Calendar}   label="Visitors Today"        value={data?.today ?? '—'} />
        <StatCard icon={TrendingUp} label="This Week"             value={data?.week ?? '—'} />
        <StatCard icon={Activity}   label="Apply Clicks"          value={data?.by_event.find(e => e.event_type === 'apply_click')?.cnt ?? 0} />
      </div>

      {/* Conversion funnel */}
      <div className="rounded-xl p-5 mb-8" style={{ background: G.card, border: `1px solid ${G.borderGold}` }}>
        <p className="text-xs font-medium mb-5" style={{ color: G.goldDim }}>CONVERSION FUNNEL</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Page Views',     value: views,   color: G.gold,   pctOf: null },
            { label: 'Popup Opens',    value: popups,  color: '#a78bfa', pctOf: views },
            { label: 'Form Submits',   value: submits, color: '#34d399', pctOf: popups },
            { label: 'WhatsApp Clicks',value: waCl,    color: '#25D366', pctOf: views },
          ].map(f => (
            <div key={f.label} className="text-center p-4 rounded-xl" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
              <p className="text-3xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: f.color }}>{f.value}</p>
              <p className="text-[11px] font-medium mb-1" style={{ color: G.textDim }}>{f.label}</p>
              {f.pctOf !== null && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${f.color}22`, color: f.color }}>
                  {pct(f.value, f.pctOf)} conv.
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 14-day daily chart */}
      <div className="rounded-xl p-5 mb-8" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <p className="text-xs font-medium mb-5" style={{ color: G.goldDim }}>PAGE VIEWS — LAST 14 DAYS</p>
        {data?.daily && data.daily.length > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {data.daily.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: G.gold }}>
                  {d.cnt}
                </span>
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max((d.cnt / maxCnt) * 100, 4)}%`,
                    background: `linear-gradient(180deg, ${G.gold}, color-mix(in srgb, ${G.gold} 30%, transparent))`,
                    minHeight: 4,
                  }}
                />
                <span className="text-[9px] rotate-45 origin-left" style={{ color: G.textMuted }}>
                  {d.day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-sm" style={{ color: G.textMuted }}>
            {loading ? 'Loading…' : 'No data yet. Visitors will appear here after page loads.'}
          </p>
        )}
      </div>

      {/* Event breakdown table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
        <div className="px-5 py-3" style={{ background: G.cardAlt, borderBottom: `1px solid ${G.border}` }}>
          <span className="text-xs tracking-widest uppercase" style={{ color: G.goldDim }}>Event Breakdown</span>
        </div>
        {data?.by_event.map((e, i) => (
          <div key={e.event_type} className="flex items-center justify-between px-5 py-3"
            style={{ background: i % 2 === 0 ? G.card : G.rowAlt, borderBottom: `1px solid ${G.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: EVENT_COLORS[e.event_type] ?? G.textMuted }} />
              <div className="flex items-center gap-2">
                <MousePointer size={12} style={{ color: G.textMuted }} />
                <span className="text-sm" style={{ color: G.text }}>{EVENT_LABELS[e.event_type] ?? e.event_type}</span>
              </div>
            </div>
            <span className="text-xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: EVENT_COLORS[e.event_type] ?? G.text }}>
              {e.cnt}
            </span>
          </div>
        ))}
        {(!data?.by_event || data.by_event.length === 0) && (
          <p className="text-center py-8 text-sm" style={{ color: G.textMuted, background: G.card }}>
            {loading ? 'Loading…' : 'No events tracked yet.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin component ─────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken]           = useState(getStoredToken);
  const [authed, setAuthed]         = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>('dashboard');
  const [toasts, setToasts]         = useState<ToastItem[]>([]);
  const [enquiries, setEnquiries]   = useState<Enquiry[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [loadingEnq, setLoadingEnq] = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [images, setImages]         = useState<R2Image[]>([]);
  const [loadingImg, setLoadingImg] = useState(false);
  const [theme, setTheme]           = useState<ThemeName>(getStoredTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tokenRef                    = useRef(token);

  const handleTheme = useCallback((t: ThemeName) => {
    setTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  }, []);

  const addToast = useCallback((msg: string, type: ToastItem['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Validate stored token once on mount
  useEffect(() => {
    const t = tokenRef.current;
    if (!t) return;
    fetch('/api/enquiries?page=1', { headers: { 'Authorization': `Bearer ${t}` } })
      .then(r => { if (r.status === 401) { clearToken(); setToken(''); } else setAuthed(true); })
      .catch(() => setAuthed(true));
  }, []);

  const loadEnquiries = useCallback(async (p = 1) => {
    const t = tokenRef.current;
    if (!t) return;
    setLoadingEnq(true);
    try {
      const h = { 'Authorization': `Bearer ${t}` };
      const [eRes, sRes] = await Promise.all([
        fetch(`/api/enquiries?page=${p}`, { headers: h }),
        fetch('/api/stats', { headers: h }),
      ]);
      if (eRes.status === 401) { clearToken(); setToken(''); setAuthed(false); return; }
      const eData = await eRes.json() as { data: Enquiry[]; total: number };
      const sData = await sRes.json() as Stats;
      setEnquiries(eData.data ?? []);
      setTotal(eData.total ?? 0);
      setStats(sData);
      setPage(p);
    } catch { /* keep existing */ }
    finally { setLoadingEnq(false); }
  }, []);

  const loadImages = useCallback(async () => {
    const t = tokenRef.current;
    if (!t) return;
    setLoadingImg(true);
    try {
      const res = await fetch('/api/images', { headers: { 'Authorization': `Bearer ${t}` } });
      const d = await res.json() as { ok: boolean; images?: R2Image[] };
      if (d.ok && d.images) setImages(d.images);
    } catch { /* ignore */ }
    finally { setLoadingImg(false); }
  }, []);

  // Load data once authenticated
  useEffect(() => {
    if (!authed) return;
    loadEnquiries(1);
    loadImages();
  }, [authed, loadEnquiries, loadImages]);

  const handleLogin = async (pin: string): Promise<string | null> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const d = await res.json() as { ok: boolean; token?: string; expires_at?: string; error?: string };
    if (!d.ok) return d.error ?? 'Login failed';
    storeToken(d.token!, d.expires_at!);
    tokenRef.current = d.token!;
    setToken(d.token!);
    setAuthed(true);
    return null;
  };

  const handleLogout = () => {
    const t = tokenRef.current;
    if (t) fetch('/api/auth', { method: 'DELETE', headers: { 'Authorization': `Bearer ${t}` } }).catch(() => null);
    clearToken();
    tokenRef.current = '';
    setToken('');
    setAuthed(false);
    setEnquiries([]); setStats(null); setImages([]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this enquiry permanently?')) return;
    setDeleting(id);
    await fetch(`/api/enquiry/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenRef.current}` },
    });
    setDeleting(null);
    loadEnquiries(page);
    addToast('Enquiry deleted', 'info');
  };

  if (!authed) return (
    <div style={{ ...(THEMES[theme] as CSSProperties), background: G.bg, minHeight: '100vh' }}>
      <LoginScreen onLogin={handleLogin} />
    </div>
  );

  return (
    <div className="flex min-h-screen"
      style={{ ...(THEMES[theme] as CSSProperties), background: G.bg, fontFamily: 'Inter, sans-serif', color: G.text }}>
      <Toasts items={toasts} />
      <Sidebar active={activeTab} onTab={setActiveTab} onLogout={handleLogout} enquiryCount={total}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        <TopBar theme={theme} onTheme={handleTheme} tab={activeTab} onMenu={() => setSidebarOpen(true)} />
        {activeTab === 'dashboard' && (
          <DashboardTab total={total} stats={stats} recentEnquiries={enquiries} />
        )}
        {activeTab === 'enquiries' && (
          <EnquiriesTab
            enquiries={enquiries} stats={stats} total={total} page={page}
            loading={loadingEnq} deleting={deleting} search={search}
            onSearch={setSearch} onDelete={handleDelete}
            onRefresh={() => loadEnquiries(page)} onPage={loadEnquiries}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab token={token} addToast={addToast} />
        )}
        {activeTab === 'content' && (
          <ContentTab token={token} images={images} onRefreshImages={loadImages} addToast={addToast} />
        )}
        {activeTab === 'media' && (
          <MediaTab token={token} images={images} loading={loadingImg} onRefresh={loadImages} addToast={addToast} />
        )}
        {activeTab === 'security' && (
          <SecurityTab token={token} onLogout={handleLogout} addToast={addToast} />
        )}
      </main>
    </div>
  );
}

// ─── Generic save helper for new content editors ──────────────────────────────
async function saveContent<T>(key: string, token: string, data: T): Promise<boolean> {
  try {
    const res = await fetch(`/api/content/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const d = await res.json() as { ok: boolean };
    return !!d.ok;
  } catch { return false; }
}

function useContentEditor<T>(key: string, fallback: T) {
  const [data, setData]             = useState<T>(fallback);
  const [status, setStatus]         = useState<SaveStatus>('idle');
  const [customised, setCustomised] = useState(false);
  const [updatedAt, setUpdatedAt]   = useState('');

  useEffect(() => {
    fetch(`/api/content/${key}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { ok: boolean; data?: T } | null) => {
        if (d?.ok && d.data) { setData({ ...fallback, ...d.data }); setCustomised(true); }
      }).catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, setData, status, setStatus, customised, setCustomised, updatedAt, setUpdatedAt };
}

function ListEditor<T>({ label, items, onChange, render, makeNew, addLabel = 'Add Item' }: {
  label?: string;
  items: T[];
  onChange: (next: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, remove: () => void, idx: number) => ReactNode;
  makeNew: () => T;
  addLabel?: string;
}) {
  return (
    <div>
      {label && <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: G.textMuted }}>{label}</p>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="p-3 rounded-lg" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
            {render(
              it,
              (patch) => onChange(items.map((x, j) => j === i ? { ...x, ...patch } : x)),
              () => onChange(items.filter((_, j) => j !== i)),
              i,
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, makeNew()])}
        className="mt-2 px-3 py-1.5 text-xs font-medium rounded-md"
        style={{ background: G.gold, color: '#fff' }}
      >+ {addLabel}</button>
    </div>
  );
}

function SimpleStringList({ label, items, onChange, placeholder, addLabel = 'Add Item' }: {
  label?: string; items: string[]; onChange: (next: string[]) => void; placeholder?: string; addLabel?: string;
}) {
  return (
    <div>
      {label && <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: G.textMuted }}>{label}</p>}
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={it}
              placeholder={placeholder}
              onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))}
              className="flex-1 px-3 py-2 text-sm rounded-md"
              style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }}
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="px-3 py-2 text-xs rounded-md"
              style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}
            >×</button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, ''])}
        className="mt-2 px-3 py-1.5 text-xs font-medium rounded-md"
        style={{ background: G.gold, color: '#fff' }}
      >+ {addLabel}</button>
    </div>
  );
}

// ─── Placements Editor ────────────────────────────────────────────────────────
function PlacementsEditor({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<PlacementsContent>('placements', DEFAULT_CONTENT.placements);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('placements', token, e.data);
    if (ok) {
      e.setStatus('saved'); e.setCustomised(true);
      e.setUpdatedAt(new Date().toLocaleTimeString('en-IN'));
      addToast('Placements saved!', 'success'); broadcastCmsUpdate();
    } else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Placements Section</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label"><TInput value={e.data.section_label} onChange={v => e.setData({ ...e.data, section_label: v })} /></Field>
        <Field label="Heading (main)"><TInput value={e.data.heading_main} onChange={v => e.setData({ ...e.data, heading_main: v })} /></Field>
        <Field label="Heading (gold/em)"><TInput value={e.data.heading_em} onChange={v => e.setData({ ...e.data, heading_em: v })} /></Field>
        <Field label="Career Section Label"><TInput value={e.data.career_label} onChange={v => e.setData({ ...e.data, career_label: v })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><TTextarea value={e.data.description} onChange={v => e.setData({ ...e.data, description: v })} rows={3} /></Field></div>
        <Field label="Floating badge value (e.g. 50+)"><TInput value={e.data.badge_value} onChange={v => e.setData({ ...e.data, badge_value: v })} /></Field>
        <Field label="Floating badge caption"><TInput value={e.data.badge_caption} onChange={v => e.setData({ ...e.data, badge_caption: v })} /></Field>
        <Field label="Partners section label"><TInput value={e.data.partners_label} onChange={v => e.setData({ ...e.data, partners_label: v })} /></Field>
        <div className="md:col-span-2">
          <ImageField label="Section Image" value={e.data.image} onChange={v => e.setData({ ...e.data, image: v })}
            token={token} images={images} onRefreshImages={onRefreshImages} />
        </div>
        <div className="md:col-span-2">
          <Field label="Stats (4 items, icons fixed by position)">
            <ListEditor
              items={e.data.stats}
              onChange={items => e.setData({ ...e.data, stats: items })}
              makeNew={() => ({ value: '', label: '' })}
              addLabel="Add Stat"
              render={(it, update, remove) => (
                <div className="grid grid-cols-12 gap-2">
                  <input value={it.value} onChange={ev => update({ value: ev.target.value })} placeholder="Value (e.g. 100%)"
                    className="col-span-4 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                  <input value={it.label} onChange={ev => update({ label: ev.target.value })} placeholder="Label"
                    className="col-span-7 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                  <button onClick={remove} className="col-span-1 text-xs rounded-md" style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}>×</button>
                </div>
              )}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <SimpleStringList label="Career Paths" items={e.data.career_paths}
            onChange={items => e.setData({ ...e.data, career_paths: items })} placeholder="e.g. Executive Chef" addLabel="Add Career" />
        </div>
        <div className="md:col-span-2">
          <SimpleStringList label="Partner Brands" items={e.data.partners}
            onChange={items => e.setData({ ...e.data, partners: items })} placeholder="e.g. Taj Hotels" addLabel="Add Partner" />
        </div>
      </div>
    </div>
  );
}

// ─── Facilities Editor ────────────────────────────────────────────────────────
function FacilitiesEditor({ token, addToast }: {
  token: string; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<FacilitiesContent>('facilities', DEFAULT_CONTENT.facilities);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('facilities', token, e.data);
    if (ok) { e.setStatus('saved'); e.setCustomised(true); e.setUpdatedAt(new Date().toLocaleTimeString('en-IN')); addToast('Facilities saved!', 'success'); broadcastCmsUpdate(); }
    else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Facilities Section</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label"><TInput value={e.data.section_label} onChange={v => e.setData({ ...e.data, section_label: v })} /></Field>
        <Field label="Heading (main)"><TInput value={e.data.heading_main} onChange={v => e.setData({ ...e.data, heading_main: v })} /></Field>
        <Field label="Heading (gold/em)"><TInput value={e.data.heading_em} onChange={v => e.setData({ ...e.data, heading_em: v })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><TTextarea value={e.data.description} onChange={v => e.setData({ ...e.data, description: v })} rows={2} /></Field></div>
        <Field label="Image 1 caption"><TInput value={e.data.caption_1} onChange={v => e.setData({ ...e.data, caption_1: v })} /></Field>
        <Field label="Image 2 caption"><TInput value={e.data.caption_2} onChange={v => e.setData({ ...e.data, caption_2: v })} /></Field>
        <Field label="Image 3 caption"><TInput value={e.data.caption_3} onChange={v => e.setData({ ...e.data, caption_3: v })} /></Field>
        <div className="md:col-span-2">
          <Field label="Features (4 items, icons fixed by position)">
            <ListEditor
              items={e.data.features}
              onChange={items => e.setData({ ...e.data, features: items })}
              makeNew={() => ({ title: '', desc: '' })}
              addLabel="Add Feature"
              render={(it, update, remove) => (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input value={it.title} onChange={ev => update({ title: ev.target.value })} placeholder="Title"
                      className="flex-1 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                    <button onClick={remove} className="px-3 py-2 text-xs rounded-md" style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}>×</button>
                  </div>
                  <textarea value={it.desc} onChange={ev => update({ desc: ev.target.value })} placeholder="Description" rows={2}
                    className="w-full px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                </div>
              )}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Curriculum Editor ────────────────────────────────────────────────────────
function CurriculumEditor({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<CurriculumContent>('curriculum', DEFAULT_CONTENT.curriculum);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('curriculum', token, e.data);
    if (ok) { e.setStatus('saved'); e.setCustomised(true); e.setUpdatedAt(new Date().toLocaleTimeString('en-IN')); addToast('Curriculum saved!', 'success'); broadcastCmsUpdate(); }
    else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Curriculum Section</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label"><TInput value={e.data.section_label} onChange={v => e.setData({ ...e.data, section_label: v })} /></Field>
        <Field label="Heading (main)"><TInput value={e.data.heading_main} onChange={v => e.setData({ ...e.data, heading_main: v })} /></Field>
        <Field label="Heading (gold/em)"><TInput value={e.data.heading_em} onChange={v => e.setData({ ...e.data, heading_em: v })} /></Field>
        <Field label="Features label"><TInput value={e.data.features_label} onChange={v => e.setData({ ...e.data, features_label: v })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><TTextarea value={e.data.description} onChange={v => e.setData({ ...e.data, description: v })} rows={3} /></Field></div>
        <div className="md:col-span-2"><Field label="Quote"><TTextarea value={e.data.quote} onChange={v => e.setData({ ...e.data, quote: v })} rows={2} /></Field></div>
        <Field label="Quote attribution"><TInput value={e.data.quote_attribution} onChange={v => e.setData({ ...e.data, quote_attribution: v })} /></Field>
        <div className="md:col-span-2">
          <ImageField label="Section Image" value={e.data.image} onChange={v => e.setData({ ...e.data, image: v })}
            token={token} images={images} onRefreshImages={onRefreshImages} />
        </div>
        <div className="md:col-span-2">
          <Field label="Subjects (6 items, icons fixed by position)">
            <ListEditor
              items={e.data.subjects}
              onChange={items => e.setData({ ...e.data, subjects: items })}
              makeNew={() => ({ name: '', detail: '' })}
              addLabel="Add Subject"
              render={(it, update, remove) => (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input value={it.name} onChange={ev => update({ name: ev.target.value })} placeholder="Subject name"
                      className="flex-1 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                    <button onClick={remove} className="px-3 py-2 text-xs rounded-md" style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}>×</button>
                  </div>
                  <input value={it.detail} onChange={ev => update({ detail: ev.target.value })} placeholder="Detail"
                    className="w-full px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                </div>
              )}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <SimpleStringList label="Highlights" items={e.data.highlights}
            onChange={items => e.setData({ ...e.data, highlights: items })} placeholder="e.g. NEP 2020 aligned" addLabel="Add Highlight" />
        </div>
      </div>
    </div>
  );
}

// ─── Student Life Editor ──────────────────────────────────────────────────────
function StudentLifeEditor({ token, addToast }: {
  token: string; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<StudentLifeContent>('student_life', DEFAULT_CONTENT.student_life);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('student_life', token, e.data);
    if (ok) { e.setStatus('saved'); e.setCustomised(true); e.setUpdatedAt(new Date().toLocaleTimeString('en-IN')); addToast('Student Life saved!', 'success'); broadcastCmsUpdate(); }
    else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Student Life Section</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label"><TInput value={e.data.section_label} onChange={v => e.setData({ ...e.data, section_label: v })} /></Field>
        <Field label="Heading (main)"><TInput value={e.data.heading_main} onChange={v => e.setData({ ...e.data, heading_main: v })} /></Field>
        <Field label="Heading (gold/em)"><TInput value={e.data.heading_em} onChange={v => e.setData({ ...e.data, heading_em: v })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><TTextarea value={e.data.description} onChange={v => e.setData({ ...e.data, description: v })} rows={3} /></Field></div>
        <Field label="Mosaic image 1 caption"><TInput value={e.data.caption_1} onChange={v => e.setData({ ...e.data, caption_1: v })} /></Field>
        <Field label="Mosaic image 2 caption"><TInput value={e.data.caption_2} onChange={v => e.setData({ ...e.data, caption_2: v })} /></Field>
        <Field label="Mosaic image 3 caption"><TInput value={e.data.caption_3} onChange={v => e.setData({ ...e.data, caption_3: v })} /></Field>
        <Field label="Mosaic image 4 caption"><TInput value={e.data.caption_4} onChange={v => e.setData({ ...e.data, caption_4: v })} /></Field>
        <Field label="Mosaic image 5 caption"><TInput value={e.data.caption_5} onChange={v => e.setData({ ...e.data, caption_5: v })} /></Field>
        <div className="md:col-span-2">
          <Field label="Experiences (4 items)">
            <ListEditor
              items={e.data.experiences}
              onChange={items => e.setData({ ...e.data, experiences: items })}
              makeNew={() => ({ number: '', title: '', desc: '' })}
              addLabel="Add Experience"
              render={(it, update, remove) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <input value={it.number} onChange={ev => update({ number: ev.target.value })} placeholder="01"
                      className="col-span-2 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                    <input value={it.title} onChange={ev => update({ title: ev.target.value })} placeholder="Title"
                      className="col-span-9 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                    <button onClick={remove} className="col-span-1 text-xs rounded-md" style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}>×</button>
                  </div>
                  <textarea value={it.desc} onChange={ev => update({ desc: ev.target.value })} placeholder="Description" rows={2}
                    className="w-full px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                </div>
              )}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonials Editor ──────────────────────────────────────────────────────
function TestimonialsEditor({ token, images, onRefreshImages, addToast }: {
  token: string; images: R2Image[]; onRefreshImages: () => void;
  addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<TestimonialsContent>('testimonials', DEFAULT_CONTENT.testimonials);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('testimonials', token, e.data);
    if (ok) { e.setStatus('saved'); e.setCustomised(true); e.setUpdatedAt(new Date().toLocaleTimeString('en-IN')); addToast('Testimonials saved!', 'success'); broadcastCmsUpdate(); }
    else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Testimonials Section</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label"><TInput value={e.data.section_label} onChange={v => e.setData({ ...e.data, section_label: v })} /></Field>
        <Field label="Heading (main)"><TInput value={e.data.heading_main} onChange={v => e.setData({ ...e.data, heading_main: v })} /></Field>
        <Field label="Heading (gold/em)"><TInput value={e.data.heading_em} onChange={v => e.setData({ ...e.data, heading_em: v })} /></Field>
        <div className="md:col-span-2">
          <p className="text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: G.textMuted }}>Testimonials</p>
          <div className="space-y-3">
            {e.data.items.map((it, i) => (
              <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: G.fieldSubtle, border: `1px solid ${G.border}` }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input value={it.name} placeholder="Name"
                    onChange={ev => e.setData({ ...e.data, items: e.data.items.map((x, j) => j === i ? { ...x, name: ev.target.value } : x) })}
                    className="px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                  <input value={it.role} placeholder="Role / Company"
                    onChange={ev => e.setData({ ...e.data, items: e.data.items.map((x, j) => j === i ? { ...x, role: ev.target.value } : x) })}
                    className="px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                  <input value={it.batch} placeholder="Batch"
                    onChange={ev => e.setData({ ...e.data, items: e.data.items.map((x, j) => j === i ? { ...x, batch: ev.target.value } : x) })}
                    className="px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                </div>
                <textarea value={it.quote} placeholder="Quote" rows={3}
                  onChange={ev => e.setData({ ...e.data, items: e.data.items.map((x, j) => j === i ? { ...x, quote: ev.target.value } : x) })}
                  className="w-full px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                <ImageField label="Photo" value={it.image}
                  onChange={v => e.setData({ ...e.data, items: e.data.items.map((x, j) => j === i ? { ...x, image: v } : x) })}
                  token={token} images={images} onRefreshImages={onRefreshImages} />
                <button
                  onClick={() => e.setData({ ...e.data, items: e.data.items.filter((_, j) => j !== i) })}
                  className="px-3 py-1.5 text-xs rounded-md"
                  style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}
                >Remove</button>
              </div>
            ))}
          </div>
          <button
            onClick={() => e.setData({ ...e.data, items: [...e.data.items, { name: '', role: '', batch: '', quote: '', image: '' }] })}
            className="mt-2 px-3 py-1.5 text-xs font-medium rounded-md"
            style={{ background: G.gold, color: '#fff' }}
          >+ Add Testimonial</button>
        </div>
      </div>
    </div>
  );
}

// ─── Admission Editor ─────────────────────────────────────────────────────────
function AdmissionEditor({ token, addToast }: {
  token: string; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<AdmissionContent>('admission', DEFAULT_CONTENT.admission);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('admission', token, e.data);
    if (ok) { e.setStatus('saved'); e.setCustomised(true); e.setUpdatedAt(new Date().toLocaleTimeString('en-IN')); addToast('Admission saved!', 'success'); broadcastCmsUpdate(); }
    else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Admission Section</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Section Label"><TInput value={e.data.section_label} onChange={v => e.setData({ ...e.data, section_label: v })} /></Field>
        <Field label="Heading (main)"><TInput value={e.data.heading_main} onChange={v => e.setData({ ...e.data, heading_main: v })} /></Field>
        <Field label="Heading (gold/em)"><TInput value={e.data.heading_em} onChange={v => e.setData({ ...e.data, heading_em: v })} /></Field>
        <Field label="Eligibility heading"><TInput value={e.data.eligibility_label} onChange={v => e.setData({ ...e.data, eligibility_label: v })} /></Field>
        <Field label="Contact heading"><TInput value={e.data.contact_label} onChange={v => e.setData({ ...e.data, contact_label: v })} /></Field>
        <Field label="Call number (e.g. 08312444348)"><TInput value={e.data.call_number} onChange={v => e.setData({ ...e.data, call_number: v })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><TTextarea value={e.data.description} onChange={v => e.setData({ ...e.data, description: v })} rows={3} /></Field></div>
        <div className="md:col-span-2"><Field label="WhatsApp prefilled message"><TTextarea value={e.data.whatsapp_message} onChange={v => e.setData({ ...e.data, whatsapp_message: v })} rows={2} /></Field></div>
        <Field label="Apply CTA label"><TInput value={e.data.cta_apply} onChange={v => e.setData({ ...e.data, cta_apply: v })} /></Field>
        <Field label="WhatsApp CTA label"><TInput value={e.data.cta_whatsapp} onChange={v => e.setData({ ...e.data, cta_whatsapp: v })} /></Field>
        <Field label="Call CTA label"><TInput value={e.data.cta_call} onChange={v => e.setData({ ...e.data, cta_call: v })} /></Field>
        <div className="md:col-span-2">
          <Field label="Steps (4 items, icons fixed by position)">
            <ListEditor
              items={e.data.steps}
              onChange={items => e.setData({ ...e.data, steps: items })}
              makeNew={() => ({ number: '', title: '', desc: '' })}
              addLabel="Add Step"
              render={(it, update, remove) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <input value={it.number} onChange={ev => update({ number: ev.target.value })} placeholder="01"
                      className="col-span-2 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                    <input value={it.title} onChange={ev => update({ title: ev.target.value })} placeholder="Title"
                      className="col-span-9 px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                    <button onClick={remove} className="col-span-1 text-xs rounded-md" style={{ background: G.fieldSubtle, color: '#f87171', border: `1px solid ${G.border}` }}>×</button>
                  </div>
                  <textarea value={it.desc} onChange={ev => update({ desc: ev.target.value })} placeholder="Description" rows={2}
                    className="w-full px-3 py-2 text-sm rounded-md" style={{ background: G.field, border: `1px solid ${G.border}`, color: G.text }} />
                </div>
              )}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <SimpleStringList label="Eligibility criteria" items={e.data.eligibility}
            onChange={items => e.setData({ ...e.data, eligibility: items })} placeholder="e.g. Minimum 50% aggregate" addLabel="Add Criterion" />
        </div>
      </div>
    </div>
  );
}

// ─── Footer Editor ────────────────────────────────────────────────────────────
function FooterEditor({ token, addToast }: {
  token: string; addToast: (msg: string, type: ToastItem['type']) => void;
}) {
  const e = useContentEditor<FooterContent>('footer', DEFAULT_CONTENT.footer);
  const save = async () => {
    e.setStatus('saving');
    const ok = await saveContent('footer', token, e.data);
    if (ok) { e.setStatus('saved'); e.setCustomised(true); e.setUpdatedAt(new Date().toLocaleTimeString('en-IN')); addToast('Footer saved!', 'success'); broadcastCmsUpdate(); }
    else { e.setStatus('error'); addToast('Save failed', 'error'); }
    setTimeout(() => e.setStatus('idle'), 2500);
  };
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: G.text }}>Footer</h3>
          <StatusBadge customised={e.customised} updatedAt={e.updatedAt} />
        </div>
        <SaveBtn status={e.status} onClick={save} />
      </div>
      <PublishHint />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2"><Field label="Brand name"><TInput value={e.data.brand_name} onChange={v => e.setData({ ...e.data, brand_name: v })} /></Field></div>
        <Field label="Tagline"><TInput value={e.data.tagline} onChange={v => e.setData({ ...e.data, tagline: v })} /></Field>
        <Field label="Contact heading"><TInput value={e.data.contact_label} onChange={v => e.setData({ ...e.data, contact_label: v })} /></Field>
        <div className="md:col-span-2"><Field label="Description"><TTextarea value={e.data.description} onChange={v => e.setData({ ...e.data, description: v })} rows={3} /></Field></div>
        <Field label="Email"><TInput value={e.data.email} onChange={v => e.setData({ ...e.data, email: v })} type="email" /></Field>
        <Field label="Website"><TInput value={e.data.website} onChange={v => e.setData({ ...e.data, website: v })} /></Field>
        <div className="md:col-span-2">
          <SimpleStringList label="Address lines" items={e.data.address_lines}
            onChange={items => e.setData({ ...e.data, address_lines: items })} placeholder="e.g. JNMC Campus, Nehru Nagar" addLabel="Add Line" />
        </div>
        <div className="md:col-span-2">
          <SimpleStringList label="Phone numbers" items={e.data.phones}
            onChange={items => e.setData({ ...e.data, phones: items })} placeholder="e.g. 0831-2444348" addLabel="Add Phone" />
        </div>
        <div className="md:col-span-2"><Field label="Copyright text (year is prepended automatically)"><TInput value={e.data.copyright} onChange={v => e.setData({ ...e.data, copyright: v })} /></Field></div>
        <div className="md:col-span-2"><Field label="Copyright subtext"><TInput value={e.data.copyright_subtext} onChange={v => e.setData({ ...e.data, copyright_subtext: v })} /></Field></div>
      </div>
    </div>
  );
}
