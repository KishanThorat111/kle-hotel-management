import { useState, useCallback } from 'react';
import {
  LogOut, Download, Search, Trash2, Phone, User,
  RefreshCw, MessageCircle, TrendingUp, Calendar, Users, Inbox, X,
} from 'lucide-react';

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  interest: string;
  message: string;
  source: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
  week: number;
  by_interest: { interest: string; cnt: number }[];
}

function waLink(e: Enquiry) {
  const msg = encodeURIComponent(
    `Hello ${e.name}! 👋 This is KLE Hotel Management team.\n\nWe received your enquiry for *${e.interest}*. How can we help you?`
  );
  return `https://wa.me/91${e.phone}?text=${msg}`;
}

function formatDate(iso: string) {
  const d = new Date(iso + 'Z');
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function exportCSV(data: Enquiry[]) {
  const header = 'ID,Name,Phone,Interest,Message,Source,Date';
  const rows = data.map(e =>
    [e.id, `"${e.name}"`, e.phone, e.interest, `"${e.message}"`, e.source, e.created_at].join(',')
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `kle-enquiries-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Login screen ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pin: string) => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#060d1f' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: '#0D1B3E', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#C9A84C,transparent)', marginBottom: 32, borderRadius: 1 }} />

        <div className="text-center mb-8">
          {/* Crest */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.05)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 21L7 10.5L11.5 16L14 4L16.5 16L21 10.5L24 21H4Z" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round" />
              <rect x="4" y="21" width="20" height="1.5" rx="0.4" fill="none" stroke="#C9A84C" strokeWidth="1" />
            </svg>
          </div>
          <h1 className="text-xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#FAF7F0' }}>
            Admin Panel
          </h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
            KLE Hotel Management
          </p>
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter admin PIN"
            value={pin}
            onChange={e => { setPin(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && onLogin(pin)}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none text-center tracking-widest"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${err ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: '#FAF7F0',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {err && <p className="text-xs text-center mt-2" style={{ color: '#f87171' }}>{err}</p>}
        </div>

        <button
          onClick={() => onLogin(pin)}
          className="w-full py-3 rounded-lg text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #EDD68A)', color: '#081123', fontFamily: 'Inter, sans-serif' }}
        >
          Access Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gold }: { icon: React.ElementType; label: string; value: number | string; gold?: boolean }) {
  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4"
      style={{ background: '#0D1B3E', border: `1px solid ${gold ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: gold ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)' }}
      >
        <Icon size={18} style={{ color: gold ? '#C9A84C' : 'rgba(255,255,255,0.4)' }} />
      </div>
      <div>
        <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>{label}</p>
        <p className="text-2xl font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: gold ? '#C9A84C' : '#FAF7F0' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────
export default function Admin() {
  const [pin, setPin]             = useState('');
  const [authed, setAuthed]       = useState(false);
  const [_loginErr, setLoginErr]  = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [deleting, setDeleting]   = useState<number | null>(null);

  const load = useCallback(async (p = 1, currentPin = pin) => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        fetch(`/api/enquiries?pin=${currentPin}&page=${p}`),
        fetch(`/api/stats?pin=${currentPin}`),
      ]);
      if (eRes.status === 401) { setAuthed(false); return; }
      const eData = await eRes.json() as { data: Enquiry[]; total: number };
      const sData = await sRes.json() as Stats;
      setEnquiries(eData.data ?? []);
      setTotal(eData.total ?? 0);
      setStats(sData);
      setPage(p);
    } catch { /* ignore */ }
    setLoading(false);
  }, [pin]);

  const handleLogin = async (p: string) => {
    if (!p.trim()) { setLoginErr('Enter the admin PIN'); return; }
    setLoading(true);
    const res = await fetch(`/api/enquiries?pin=${p}&page=1`);
    setLoading(false);
    if (res.status === 401) { setLoginErr('Incorrect PIN'); return; }
    setPin(p);
    setAuthed(true);
    const data = await res.json() as { data: Enquiry[]; total: number };
    setEnquiries(data.data ?? []);
    setTotal(data.total ?? 0);
    load(1, p);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this enquiry?')) return;
    setDeleting(id);
    await fetch(`/api/enquiry/${id}?pin=${pin}`, { method: 'DELETE' });
    setDeleting(null);
    load(page);
  };

  const filtered = search.trim()
    ? enquiries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search) ||
        e.interest.toLowerCase().includes(search.toLowerCase())
      )
    : enquiries;

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#060d1f', fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(6,13,31,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <span className="text-xs font-bold" style={{ color: '#C9A84C' }}>KLE</span>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#FAF7F0' }}>Admin Dashboard</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Enquiry Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(page)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => exportCSV(enquiries)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}
          >
            <Download size={12} />
            Export CSV
          </button>
          <button
            onClick={() => setAuthed(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.7)' }}
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}    label="Total Enquiries" value={total}           gold />
          <StatCard icon={Calendar} label="Today"           value={stats?.today ?? 0} />
          <StatCard icon={TrendingUp} label="This Week"     value={stats?.week ?? 0} />
          <StatCard icon={Inbox}    label="Top Interest"    value={stats?.by_interest?.[0]?.interest ?? '—'} />
        </div>

        {/* Interest breakdown */}
        {stats?.by_interest && stats.by_interest.length > 0 && (
          <div className="rounded-xl p-5 mb-6 flex flex-wrap gap-3"
            style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.07)' }}>
            {stats.by_interest.map(b => (
              <div key={b.interest} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)' }}>
                <span className="text-xs" style={{ color: '#C9A84C' }}>{b.interest}</span>
                <span className="text-xs font-semibold" style={{ color: '#FAF7F0' }}>{b.cnt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 mb-4 rounded-xl px-4 py-3"
          style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={15} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Search by name, phone, interest…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#FAF7F0' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'rgba(255,255,255,0.3)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-3"
            style={{ background: '#0a1428', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Name', 'Phone', 'Interest', 'Date', 'Actions'].map(h => (
              <span key={h} className="text-[10px] tracking-widest uppercase"
                style={{ color: 'rgba(201,168,76,0.6)' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {loading && enquiries.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)', background: '#0D1B3E' }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)', background: '#0D1B3E' }}>
              No enquiries found.
            </div>
          ) : (
            filtered.map((e, i) => (
              <div
                key={e.id}
                className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] gap-4 px-5 py-4 items-center transition-colors"
                style={{
                  background: i % 2 === 0 ? '#0D1B3E' : 'rgba(255,255,255,0.015)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <User size={12} style={{ color: '#C9A84C' }} />
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: '#FAF7F0' }}>{e.name}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1.5">
                  <Phone size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>+91 {e.phone}</span>
                </div>

                {/* Interest */}
                <span
                  className="text-xs px-2.5 py-1 rounded-full w-fit"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    color: '#C9A84C',
                  }}
                >
                  {e.interest}
                </span>

                {/* Date */}
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {formatDate(e.created_at)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={waLink(e)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)' }}
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={13} style={{ color: '#25d366' }} />
                  </a>
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={deleting === e.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                    title="Delete"
                  >
                    <Trash2 size={13} style={{ color: 'rgba(239,68,68,0.6)' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {Math.min((page - 1) * 50 + 1, total)}–{Math.min(page * 50, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => load(page - 1)}
                className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
                style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.1)', color: '#FAF7F0' }}
              >
                Previous
              </button>
              <button
                disabled={page * 50 >= total}
                onClick={() => load(page + 1)}
                className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
                style={{ background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.1)', color: '#FAF7F0' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
