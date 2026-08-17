import { useState, useEffect, useCallback, type KeyboardEvent, type ReactNode } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = 'input' | 'processing' | 'dashboard' | 'reports'
type Source = 'Reddit' | 'YouTube' | 'X/Twitter' | 'News' | 'Reviews' | 'Forums'
type NavItem = 'dashboard' | 'reports'
type Timeframe = 'Week' | 'Month' | 'Year'

interface ProjectConfig {
  brand: string
  competitors: string[]
  products: string[]
  market: string
  keywords: string[]
  sources: Source[]
  question: string
}

interface DrawerData {
  title: string
  metric?: string
  value?: string
  confidence?: string
  source: string
  analystNote: string
  link?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIDEBAR_W = 204

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
  Dashboard: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Reports: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  X: () => (
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Send: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Chat: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  BarChart: () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
}

// ── Source badge ──────────────────────────────────────────────────────────────

const SRC_COLOR: Record<Source, string> = {
  Reddit: '#FF4500', YouTube: '#FF0000', 'X/Twitter': '#1D9BF0',
  News: '#c8ccd4', Reviews: '#FFB800', Forums: '#8E9197',
}
const SRC_ABBR: Record<Source, string> = {
  Reddit: 'Re', YouTube: 'Yt', 'X/Twitter': 'X', News: 'N', Reviews: 'Rv', Forums: 'F',
}

function SourceBadge({ source, size = 18 }: { source: Source; size?: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 4, flexShrink: 0,
      background: SRC_COLOR[source] + '22', border: `1px solid ${SRC_COLOR[source]}55`,
      color: SRC_COLOR[source], fontSize: size * 0.52, fontWeight: 600,
    }}>
      {SRC_ABBR[source]}
    </span>
  )
}

// ── Evidence drawer ───────────────────────────────────────────────────────────

function EvidenceDrawer({ data, onClose }: { data: DrawerData; onClose: () => void }) {
  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)' }}
      />
      {/* drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
          width: 360, background: 'rgba(30,27,28,0.96)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(142,145,151,0.2)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.22s cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(142,145,151,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#8E9197', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Evidence</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F1F1' }}>{data.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E9197', padding: 4, display: 'flex' }}>
            <Icon.X />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {/* Data block */}
          <div style={{ background: 'rgba(35,31,32,0.8)', border: '1px solid rgba(142,145,151,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12 }}>
            {data.metric && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(142,145,151,0.1)' }}>
                <span style={{ color: '#8E9197' }}>metric</span>
                <span style={{ color: '#2DD4BF' }}>{data.metric}</span>
              </div>
            )}
            {data.value && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(142,145,151,0.1)' }}>
                <span style={{ color: '#8E9197' }}>value</span>
                <span style={{ color: '#F1F1F1', fontWeight: 600 }}>{data.value}</span>
              </div>
            )}
            {data.confidence && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(142,145,151,0.1)' }}>
                <span style={{ color: '#8E9197' }}>confidence</span>
                <span style={{ color: '#F1F1F1' }}>{data.confidence}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8E9197' }}>source</span>
              <span style={{ color: '#F1F1F1' }}>{data.source}</span>
            </div>
          </div>

          {/* Analyst note */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#8E9197', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Analyst note</div>
            <p style={{ fontSize: 13, color: '#F1F1F1', lineHeight: 1.65, margin: 0 }}>{data.analystNote}</p>
          </div>

          {/* Link */}
          {data.link ? (
            <a href={data.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2DD4BF', textDecoration: 'none' }}>
              View source <Icon.ExternalLink />
            </a>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8E9197', background: 'rgba(142,145,151,0.08)', borderRadius: 5, padding: '4px 10px' }}>
              Internal data only — no direct link
            </span>
          )}
        </div>
      </div>
    </>
  )
}

// ── Clickable evidence item ───────────────────────────────────────────────────

function Evid({ children, data, onOpen }: { children: ReactNode; data: DrawerData; onOpen: (d: DrawerData) => void }) {
  return (
    <span
      onClick={() => onOpen(data)}
      style={{ cursor: 'pointer', borderRadius: 4, transition: 'opacity 0.12s', display: 'contents' }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
    >
      {children}
    </span>
  )
}

// ── Tag input ─────────────────────────────────────────────────────────────────

function TagInput({ label, tags, onAdd, onRemove, placeholder }: {
  label: string; tags: string[]
  onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder?: string
}) {
  const [val, setVal] = useState('')
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && val.trim()) {
      e.preventDefault(); onAdd(val.trim().replace(/,/g, '')); setVal('')
    }
    if (e.key === 'Backspace' && !val && tags.length) onRemove(tags[tags.length - 1])
  }
  return (
    <div>
      <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 6 }}>{label}</label>
      <div className="glass-input" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', minHeight: 42, cursor: 'text' }}
        onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
        {tags.map((t) => (
          <span key={t} className="tag-chip">
            {t}
            <button onClick={() => onRemove(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2DD4BF', display: 'flex' }}>
              <Icon.X />
            </button>
          </span>
        ))}
        <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={handleKey}
          placeholder={tags.length ? '' : (placeholder ?? 'Type and press Enter')}
          style={{ background: 'none', border: 'none', outline: 'none', color: '#F1F1F1', fontSize: 13, flex: 1, minWidth: 80 }} />
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ nav, setNav, brand, onNewProject }: {
  nav: NavItem; setNav: (n: NavItem) => void; brand: string; onNewProject: () => void
}) {
  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
      display: 'flex', flexDirection: 'column', padding: '24px 12px',
      borderRight: '1px solid rgba(142,145,151,0.12)',
      background: 'rgba(30,27,28,0.85)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', zIndex: 100,
    }}>
      <div style={{ padding: '4px 12px 28px' }}>
        <div style={{ fontSize: 10, color: '#8E9197', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F1F1', lineHeight: 1.3 }}>{brand || 'Home Depot'}</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {(['dashboard', 'reports'] as NavItem[]).map((item) => (
          <button key={item} onClick={() => setNav(item)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: nav === item ? 600 : 400,
              textAlign: 'left', width: '100%', borderRadius: 8, transition: 'all 0.15s ease',
              background: nav === item ? 'rgba(45,212,191,0.08)' : 'transparent',
              color: nav === item ? '#2DD4BF' : '#8E9197',
            }}>
            {item === 'dashboard' ? <Icon.Dashboard /> : <Icon.Reports />}
            {item.charAt(0).toUpperCase() + item.slice(1)}
            {nav === item && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#2DD4BF', boxShadow: '0 0 6px #2DD4BF' }} />}
          </button>
        ))}
      </nav>

      <button onClick={onNewProject} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        border: '1px dashed rgba(142,145,151,0.3)', cursor: 'pointer', fontSize: 12,
        background: 'transparent', borderRadius: 8, width: '100%', color: '#8E9197',
        transition: 'all 0.15s ease',
      }}>
        <Icon.Plus /> New project
      </button>
    </aside>
  )
}

// ── Screen 1 — Input ──────────────────────────────────────────────────────────

const ALL_SOURCES: Source[] = ['Reddit', 'YouTube', 'X/Twitter', 'News', 'Reviews', 'Forums']
const MARKETS = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan']
const Q_PLACEHOLDERS = [
  "Why are customers switching to our competitor?",
  "What are the top pain points driving negative sentiment?",
  "How is our brand perceived vs. Lowe's among Pro customers?",
  "Which product categories generate the most complaints?",
]

function InputScreen({ onStart }: { onStart: (cfg: ProjectConfig) => void }) {
  const [brand, setBrand] = useState('Home Depot')
  const [competitors, setCompetitors] = useState<string[]>(["Lowe's", 'Menards'])
  const [products, setProducts] = useState<string[]>(['Power Tools', 'Lumber', 'Appliances'])
  const [market, setMarket] = useState('United States')
  const [keywords, setKeywords] = useState<string[]>(['pro customer', 'self-checkout', 'inventory'])
  const [sources, setSources] = useState<Source[]>(['Reddit', 'YouTube', 'News'])
  const [question, setQuestion] = useState('')
  const [phIdx, setPhIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % Q_PLACEHOLDERS.length), 3200)
    return () => clearInterval(t)
  }, [])

  const toggleSource = (s: Source) =>
    setSources((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])

  return (
    <div className="fade-slide" style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: 620 }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#F1F1F1', marginBottom: 8, letterSpacing: '-0.01em' }}>
            Set up a new intelligence project.
          </h1>
          <p style={{ fontSize: 14, color: '#8E9197' }}>Define what to track and where to look — everything downstream follows this configuration.</p>
        </div>

        <div className="glass" style={{ padding: '26px 26px', marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 6 }}>Brand Name</label>
              <input className="glass-input" style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }}
                value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <TagInput label="Competitors" tags={competitors}
              onAdd={(v) => setCompetitors((p) => [...p, v])} onRemove={(v) => setCompetitors((p) => p.filter((x) => x !== v))}
              placeholder="Type name, press Enter" />
            <TagInput label="Products / Categories" tags={products}
              onAdd={(v) => setProducts((p) => [...p, v])} onRemove={(v) => setProducts((p) => p.filter((x) => x !== v))}
              placeholder="e.g. Power Tools" />
            <div>
              <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 6 }}>Market / Country</label>
              <div style={{ position: 'relative' }}>
                <select className="glass-input" style={{ width: '100%', padding: '10px 36px 10px 14px', fontSize: 14, boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' }}
                  value={market} onChange={(e) => setMarket(e.target.value)}>
                  {MARKETS.map((m) => <option key={m} value={m} style={{ background: '#231F20' }}>{m}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#8E9197', pointerEvents: 'none' }}><Icon.ChevronDown /></span>
              </div>
            </div>
            <TagInput label="Keywords to track" tags={keywords}
              onAdd={(v) => setKeywords((p) => [...p, v])} onRemove={(v) => setKeywords((p) => p.filter((x) => x !== v))}
              placeholder="e.g. checkout, returns" />
            <div>
              <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 10 }}>Signal sources</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_SOURCES.map((s) => (
                  <button key={s} onClick={() => toggleSource(s)}
                    className={sources.includes(s) ? 'source-chip-on' : 'source-chip-off'}>
                    {s}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#8E9197', marginTop: 8 }}>Selected sources determine which data populates the dashboard.</p>
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: '18px 22px', marginBottom: 22, borderColor: 'rgba(45,212,191,0.18)' }}>
          <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 8 }}>
            What do you want to know? <span style={{ color: 'rgba(142,145,151,0.5)' }}>— Optional</span>
          </label>
          <textarea className="glass-input" rows={3}
            style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxSizing: 'border-box', resize: 'none' }}
            value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder={Q_PLACEHOLDERS[phIdx]} />
        </div>

        <button className="btn-teal" style={{ width: '100%', fontSize: 14, padding: '13px 24px' }}
          onClick={() => brand && sources.length && onStart({ brand, competitors, products, market, keywords, sources, question })}
          disabled={!brand || sources.length === 0}>
          Start monitoring
        </button>
      </div>
    </div>
  )
}

// ── Screen 2 — Processing ─────────────────────────────────────────────────────

const PROC_STEPS = [
  (s: string[]) => `Collecting signals from ${s.slice(0, 2).join(', ')}…`,
  () => 'Filtering relevant mentions…',
  () => 'Running sentiment analysis…',
  () => 'Mapping competitor context…',
  () => 'Building intelligence summary…',
]

function ProcessingScreen({ config, onDone }: { config: ProjectConfig; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [count, setCount] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = 3200, si = total / PROC_STEPS.length
    const t1 = setInterval(() => setStep((s) => Math.min(s + 1, PROC_STEPS.length - 1)), si)
    const t2 = setInterval(() => setCount((c) => Math.min(c + Math.floor(Math.random() * 80 + 30), 4820)), 100)
    const t3 = setInterval(() => setProgress((p) => Math.min(p + 100 / (total / 55), 100)), 55)
    const done = setTimeout(onDone, total + 300)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); clearTimeout(done) }
  }, [onDone])

  return (
    <div className="fade-slide" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass" style={{ width: 380, padding: '36px 36px', textAlign: 'center' }}>
        <div style={{ marginBottom: 26, display: 'flex', justifyContent: 'center' }}>
          <svg className="spinner" width="34" height="34" viewBox="0 0 34 34" fill="none">
            <circle cx="17" cy="17" r="14" stroke="rgba(45,212,191,0.12)" strokeWidth="2.5" />
            <path d="M17 3a14 14 0 0 1 14 14" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ fontSize: 14, color: '#F1F1F1', marginBottom: 6 }}>{PROC_STEPS[step](config.sources)}</p>
        <p style={{ fontSize: 12, color: '#8E9197', marginBottom: 22 }}>{count.toLocaleString()} signals collected</p>
        <div style={{ background: 'rgba(142,145,151,0.12)', borderRadius: 3, height: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: '#2DD4BF', width: `${progress}%`, transition: 'width 0.055s linear', boxShadow: '0 0 8px rgba(45,212,191,0.5)' }} />
        </div>
      </div>
    </div>
  )
}

// ── Dashboard data ─────────────────────────────────────────────────────────────

const CHART_DATA: Record<Timeframe, { date: string; brand: number; comp: number }[]> = {
  Week: [
    { date: 'Mon', brand: 68, comp: 48 }, { date: 'Tue', brand: 71, comp: 47 },
    { date: 'Wed', brand: 66, comp: 50 }, { date: 'Thu', brand: 74, comp: 46 },
    { date: 'Fri', brand: 72, comp: 49 }, { date: 'Sat', brand: 78, comp: 45 },
    { date: 'Sun', brand: 75, comp: 47 },
  ],
  Month: [
    { date: 'Jun 6', brand: 62, comp: 45 }, { date: 'Jun 12', brand: 65, comp: 47 },
    { date: 'Jun 18', brand: 70, comp: 44 }, { date: 'Jun 24', brand: 68, comp: 48 },
    { date: 'Jun 30', brand: 74, comp: 46 }, { date: 'Jul 4', brand: 78, comp: 48 },
  ],
  Year: [
    { date: 'Aug', brand: 54, comp: 52 }, { date: 'Sep', brand: 57, comp: 50 },
    { date: 'Oct', brand: 60, comp: 49 }, { date: 'Nov', brand: 58, comp: 51 },
    { date: 'Dec', brand: 63, comp: 48 }, { date: 'Jan', brand: 65, comp: 47 },
    { date: 'Feb', brand: 67, comp: 46 }, { date: 'Mar', brand: 70, comp: 45 },
    { date: 'Apr', brand: 69, comp: 48 }, { date: 'May', brand: 73, comp: 46 },
    { date: 'Jun', brand: 75, comp: 47 }, { date: 'Jul', brand: 78, comp: 48 },
  ],
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(30,27,28,0.97)', border: '1px solid rgba(142,145,151,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#8E9197', marginBottom: 6 }}>{label}</p>
      {payload.map((e: any) => <p key={e.name} style={{ color: e.color, marginBottom: 2 }}>{e.name}: <strong>{e.value}</strong></p>)}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DashboardScreen({ config }: { config: ProjectConfig }) {
  const [timeframe, setTimeframe] = useState<Timeframe>('Month')
  const [crisisOpen, setCrisisOpen] = useState(false)
  const [benchOpen, setBenchOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [drawer, setDrawer] = useState<DrawerData | null>(null)

  const openDrawer = useCallback((d: DrawerData) => setDrawer(d), [])

  const sendChat = () => {
    if (!chatMsg.trim()) return
    const q = chatMsg.trim(); setChatHistory((h) => [...h, { role: 'user', text: q }]); setChatMsg('')
    setTimeout(() => setChatHistory((h) => [...h, {
      role: 'ai',
      text: `Based on ${config.sources.join(' + ')} signals for ${config.brand}: ${q.toLowerCase().includes('compet') ? "Lowe's gained on appliance installation satisfaction (+12% positive) while HD leads on digital and Pro account experience." : q.toLowerCase().includes('pain') ? 'Self-checkout reliability and weekend staffing account for 42% of negative signals this period.' : 'Overall sentiment: +62. Strongest driver is BOPIS accuracy; biggest risk is in-store weekend experience.'}`
    }]), 800)
  }

  const visibleSrc = config.sources
  const multiSrc = visibleSrc.length > 1

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Sticky control bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(35,31,32,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(142,145,151,0.1)',
        padding: '11px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* Timeframe pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['Week', 'Month', 'Year'] as Timeframe[]).map((t) => (
            <button key={t} onClick={() => setTimeframe(t)} style={{
              padding: '5px 14px', fontSize: 12, border: 'none', borderRadius: 6, cursor: 'pointer',
              background: timeframe === t ? '#2DD4BF' : 'rgba(142,145,151,0.1)',
              color: timeframe === t ? '#231F20' : '#8E9197',
              fontWeight: timeframe === t ? 600 : 400, transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* Source scope indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#8E9197' }}>Scope</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {visibleSrc.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <SourceBadge source={s} size={16} />
                <span style={{ fontSize: 11, color: '#8E9197' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="fade-slide" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 96px' }}>

        {/* 1. Narrative panel */}
        <div className="glass" style={{ padding: '22px 24px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: '#8E9197', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>This period, in plain language</div>
          <Evid data={{ title: 'Narrative summary', metric: 'sentiment_score', value: '+62', confidence: 'High', source: `${visibleSrc.join(', ')} · 18,420 mentions`, analystNote: "Composite score derived from weighted positive/negative ratio across all active sources. Adjusted for mention volume and recency bias." }} onOpen={openDrawer}>
            <p style={{ fontSize: 15, color: '#F1F1F1', lineHeight: 1.7, marginBottom: 14, cursor: 'pointer' }}>
              {config.question ? <><span style={{ color: '#2DD4BF', fontWeight: 600 }}>Re: "{config.question}" —</span>{' '}</> : ''}
              Home Depot's digital-first experience — BOPIS accuracy, the inventory app, and Pro account management — is driving measurable loyalty among its contractor base. But in-store execution on weekends is eroding that advantage: self-checkout reliability and staffing wait times dominate negative signal volume. Lowe's is narrowing the gap specifically in appliance installation satisfaction, an area where HD has no comparable service narrative this period.
            </p>
          </Evid>
          <div style={{ display: 'flex', gap: 8 }}>
            {visibleSrc.map((s) => (
              <span key={s} style={{ fontSize: 11, color: '#8E9197', background: 'rgba(142,145,151,0.08)', padding: '2px 8px', borderRadius: 4 }}>{s}</span>
            ))}
          </div>
        </div>

        {/* 2. Optional modules row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Crisis Severity & Timeline', icon: <Icon.AlertTriangle />, key: 'crisis', open: crisisOpen, toggle: () => setCrisisOpen((o) => !o) },
            { label: 'Competitive Benchmark', icon: <Icon.BarChart />, key: 'bench', open: benchOpen, toggle: () => setBenchOpen((o) => !o) },
          ].map(({ label, icon, open, toggle }) => (
            <button key={label} onClick={toggle} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px',
              border: `1px solid ${open ? 'rgba(45,212,191,0.35)' : 'rgba(142,145,151,0.2)'}`,
              borderRadius: 8, background: open ? 'rgba(45,212,191,0.07)' : 'transparent',
              color: open ? '#2DD4BF' : '#8E9197', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {icon} {label}
              <span style={{ marginLeft: 2, transition: 'transform 0.2s', display: 'flex', transform: open ? 'rotate(90deg)' : 'none' }}><Icon.ChevronRight /></span>
            </button>
          ))}
        </div>

        {/* Crisis panel */}
        {crisisOpen && (
          <div className="glass fade-slide" style={{ padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 16 }}>Crisis Severity & Timeline</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Status', value: 'Monitoring', color: '#FFB800' },
                { label: 'Severity / 100', value: '34', color: '#F1F1F1' },
                { label: 'Baseline deviation', value: '+18%', color: '#ff7070' },
                { label: 'Detected', value: 'Jun 28', color: '#F1F1F1' },
              ].map((tile) => (
                <Evid key={tile.label} data={{ title: tile.label, metric: tile.label.toLowerCase().replace(/ /g, '_'), value: tile.value, confidence: 'Medium', source: visibleSrc.join(', '), analystNote: `${tile.label} computed from ${timeframe.toLowerCase()} aggregate across all active sources.` }} onOpen={openDrawer}>
                  <div style={{ background: 'rgba(142,145,151,0.07)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
                    <div style={{ fontSize: 11, color: '#8E9197', marginBottom: 6 }}>{tile.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: tile.color }}>{tile.value}</div>
                  </div>
                </Evid>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'News pickup', val: false }, { label: 'Official response issued', val: false },
                { label: 'Social amplification', val: true }, { label: 'Internal escalation', val: false },
              ].map((c) => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.val ? '#F1F1F1' : '#8E9197' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${c.val ? '#2DD4BF' : 'rgba(142,145,151,0.3)'}`, background: c.val ? 'rgba(45,212,191,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.val && <span style={{ fontSize: 9, color: '#2DD4BF' }}>✓</span>}
                  </span>
                  {c.label}
                </div>
              ))}
            </div>
            {/* Timeline strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
              {[
                { label: 'Signal spike', date: 'Jun 28', score: 28 },
                { label: 'Volume threshold', date: 'Jun 30', score: 34 },
                { label: 'Social spread', date: 'Jul 2', score: 34 },
                { label: 'Monitoring', date: 'Jul 4', score: 34 },
              ].map((pt, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, color: '#2DD4BF', fontWeight: 600 }}>{pt.score}</span>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2DD4BF', boxShadow: '0 0 6px rgba(45,212,191,0.5)' }} />
                    <span style={{ fontSize: 10, color: '#8E9197', whiteSpace: 'nowrap' }}>{pt.label}</span>
                    <span style={{ fontSize: 10, color: 'rgba(142,145,151,0.5)' }}>{pt.date}</span>
                  </div>
                  {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: 'rgba(45,212,191,0.25)', marginBottom: 28 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive benchmark panel */}
        {benchOpen && (
          <div className="glass fade-slide" style={{ padding: '20px 24px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 16 }}>Competitive Benchmark</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: '#8E9197' }}>
                    {['Entity', 'Sentiment', 'Share of Voice', 'WoW Change', 'Mentions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { entity: config.brand, sent: '+62', sov: '54%', wow: '+4 pts', mentions: '9,940', own: true },
                    { entity: config.competitors[0] ?? "Lowe's", sent: '+48', sov: '33%', wow: '+2 pts', mentions: '6,080', own: false },
                    { entity: config.competitors[1] ?? 'Menards', sent: '+41', sov: '13%', wow: '-1 pt', mentions: '2,400', own: false },
                  ].map((row) => (
                    <Evid key={row.entity} data={{ title: `${row.entity} benchmark`, metric: 'share_of_voice', value: row.sov, confidence: 'High', source: visibleSrc.join(', '), analystNote: `${row.entity} share of voice computed from mention volume ratio across ${timeframe.toLowerCase()} window. WoW based on rolling 7-day comparison.` }} onOpen={openDrawer}>
                      <tr style={{ background: row.own ? 'rgba(45,212,191,0.06)' : 'transparent', borderTop: '1px solid rgba(142,145,151,0.08)', cursor: 'pointer', transition: 'opacity 0.12s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                        <td style={{ padding: '10px 12px 10px 0', color: row.own ? '#2DD4BF' : '#F1F1F1', fontWeight: row.own ? 600 : 400 }}>{row.entity}</td>
                        <td style={{ padding: '10px 12px 10px 0', color: '#F1F1F1' }}>{row.sent}</td>
                        <td style={{ padding: '10px 12px 10px 0', color: '#F1F1F1' }}>{row.sov}</td>
                        <td style={{ padding: '10px 12px 10px 0', color: row.wow.startsWith('+') ? '#2DD4BF' : '#ff7070' }}>{row.wow}</td>
                        <td style={{ padding: '10px 0', color: '#8E9197' }}>{row.mentions}</td>
                      </tr>
                    </Evid>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Core signal grid 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 14 }}>

          {/* Top Discussion Topics */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 14 }}>Top Discussion Topics</div>
            {[
              { topic: 'Self-checkout reliability', count: 312, stance: 'neg' },
              { topic: 'BOPIS & curbside pickup', count: 280, stance: 'pos' },
              { topic: 'Pro account experience', count: 241, stance: 'pos' },
              { topic: 'Weekend staffing', count: 198, stance: 'neg' },
              { topic: 'Inventory accuracy', count: 176, stance: 'neu' },
              { topic: 'Tool selection depth', count: 143, stance: 'pos' },
            ].map((t, i) => (
              <Evid key={t.topic} data={{ title: t.topic, metric: 'mention_count', value: String(t.count), confidence: 'High', source: visibleSrc.join(', '), analystNote: `"${t.topic}" identified via keyword clustering across ${timeframe.toLowerCase()} window. Stance reflects net polarity of mentions in this cluster.` }} onOpen={openDrawer}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(142,145,151,0.07)' : 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 11, color: '#8E9197', width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: t.stance === 'pos' ? '#2DD4BF' : t.stance === 'neg' ? '#ff7070' : '#8E9197' }} />
                  <span style={{ fontSize: 13, color: '#F1F1F1', flex: 1 }}>{t.topic}</span>
                  <span style={{ fontSize: 11, color: '#8E9197', flexShrink: 0 }}>{t.count.toLocaleString()}</span>
                </div>
              </Evid>
            ))}
          </div>

          {/* Top Channels & Sources */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 14 }}>Top Channels & Sources</div>
            {visibleSrc.map((src, i) => {
              const data = { Reddit: { count: 9940, pct: 54 }, YouTube: { count: 5200, pct: 28 }, 'X/Twitter': { count: 1800, pct: 10 }, News: { count: 900, pct: 5 }, Reviews: { count: 480, pct: 3 }, Forums: { count: 100, pct: 0.5 } }
              const d = data[src] ?? { count: 800, pct: 4 }
              return (
                <Evid key={src} data={{ title: src, metric: 'mention_count', value: String(d.count), confidence: 'High', source: src, analystNote: `${src} contributed ${d.pct}% of total signal volume this ${timeframe.toLowerCase()}. Volume computed from keyword-matched posts and engagement-weighted threads.` }} onOpen={openDrawer}>
                  <div style={{ padding: '10px 0', borderBottom: i < visibleSrc.length - 1 ? '1px solid rgba(142,145,151,0.07)' : 'none', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <SourceBadge source={src} size={18} />
                      <span style={{ fontSize: 13, color: '#F1F1F1', flex: 1 }}>{src}</span>
                      <span style={{ fontSize: 11, color: '#8E9197' }}>{d.count.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(142,145,151,0.12)', borderRadius: 2 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: '#2DD4BF', width: `${Math.min(d.pct, 100)}%` }} />
                    </div>
                  </div>
                </Evid>
              )
            })}

            {/* Sentiment chart inline */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(142,145,151,0.08)' }}>
              <div style={{ fontSize: 11, color: '#8E9197', marginBottom: 10 }}>Sentiment trend · {timeframe}</div>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={CHART_DATA[timeframe]} margin={{ top: 2, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(142,145,151,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: '#8E9197', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8E9197', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="brand" name={config.brand} stroke="#2DD4BF" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 3px rgba(45,212,191,0.5))' }} />
                  <Line type="monotone" dataKey="comp" name={config.competitors[0] ?? 'Competitor'} stroke="#8E9197" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Positive Sentiment Highlights */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2DD4BF', flexShrink: 0 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1' }}>Positive Highlights</div>
            </div>
            {[
              { quote: "Switched to HD after Lowe's kept being out of stock on Milwaukee tools. The app inventory checker is genuinely useful.", src: 'Reddit · r/DIY', rep: 'Similar to 28 other mentions', source: 'Reddit' as Source },
              { quote: "Online order pickup ready in 20 min as promised. Staff brought it to the car. Five stars.", src: 'Google Reviews', rep: 'Similar to 14 other mentions', source: 'Reviews' as Source },
              { quote: "Pro account pricing makes a real difference on volume orders — HD's commercial team is responsive.", src: 'Reddit · r/Contractors', rep: 'Similar to 21 other mentions', source: 'Reddit' as Source },
            ].filter((s) => visibleSrc.includes(s.source)).slice(0, 3).map((s, i, arr) => (
              <Evid key={i} data={{ title: 'Positive signal', metric: 'sentiment', value: 'Positive', confidence: 'High', source: s.src, analystNote: s.rep + '. Identified via sentiment classifier with >0.82 confidence threshold.' }} onOpen={openDrawer}>
                <div style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(142,145,151,0.07)' : 'none', cursor: 'pointer' }}>
                  <p style={{ fontSize: 12, color: '#F1F1F1', lineHeight: 1.6, marginBottom: 5 }}>"{s.quote}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#8E9197' }}>{s.src}</span>
                    <span style={{ fontSize: 11, color: 'rgba(45,212,191,0.7)' }}>{s.rep}</span>
                  </div>
                </div>
              </Evid>
            ))}
            {visibleSrc.every((s) => !['Reddit', 'Reviews', 'YouTube', 'News', 'Forums', 'X/Twitter'].includes(s)) && (
              <p style={{ fontSize: 12, color: '#8E9197' }}>No data for selected sources.</p>
            )}
          </div>

          {/* Negative Sentiment Highlights */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff7070', flexShrink: 0 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1' }}>Negative Highlights</div>
            </div>
            {[
              { quote: "Self-checkout at my local HD is completely broken. Three registers down, one staff member 'monitoring.' Back to Menards.", src: 'X/Twitter · @DanielRMcKee', rep: 'Similar to 42 other mentions', source: 'X/Twitter' as Source },
              { quote: "Contractor checkout lane on weekends is a disaster. Lost 45 min waiting — unacceptable for Pro accounts.", src: 'Reddit · r/DIY', rep: 'Similar to 31 other mentions', source: 'Reddit' as Source },
              { quote: "Lowe's installation service for appliances is just smoother. HD doesn't even offer it in my area.", src: 'Reddit · r/HomeImprovement', rep: 'Similar to 19 other mentions', source: 'Reddit' as Source },
            ].filter((s) => visibleSrc.includes(s.source)).slice(0, 3).map((s, i, arr) => (
              <Evid key={i} data={{ title: 'Negative signal', metric: 'sentiment', value: 'Negative', confidence: 'High', source: s.src, analystNote: s.rep + '. Identified via sentiment classifier with >0.80 confidence threshold.' }} onOpen={openDrawer}>
                <div style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(142,145,151,0.07)' : 'none', cursor: 'pointer' }}>
                  <p style={{ fontSize: 12, color: '#F1F1F1', lineHeight: 1.6, marginBottom: 5 }}>"{s.quote}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#8E9197' }}>{s.src}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,112,112,0.7)' }}>{s.rep}</span>
                  </div>
                </div>
              </Evid>
            ))}
          </div>
        </div>

        {/* 4. Intent Signals */}
        <div className="glass" style={{ padding: '20px 24px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 16 }}>Intent Signals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { type: 'Wishlist', quote: "I really wish HD would bring back the free installation program for water heaters — it's what made me choose them last time.", src: 'Reddit · r/HomeImprovement', source: 'Reddit' as Source },
              { type: 'Recommendation', quote: "If you're a contractor, set up the Pro Xtra account — the volume pricing alone saves my crew $200/month.", src: 'Reddit · r/Contractors', source: 'Reddit' as Source },
              { type: 'Wishlist', quote: "Please add a dark mode to the HD app. I use it in the aisle and the white screen is blinding.", src: 'X/Twitter · @hdappfeedback', source: 'X/Twitter' as Source },
              { type: 'Recommendation', quote: "For lumber, Home Depot's online reservation system is genuinely better than calling the store — saves a trip.", src: 'YouTube · @DIYwithDave', source: 'YouTube' as Source },
            ].filter((s) => visibleSrc.includes(s.source)).map((sig, i, arr) => (
              <Evid key={i} data={{ title: `${sig.type} signal`, metric: 'intent_type', value: sig.type, confidence: 'Medium', source: sig.src, analystNote: `Classified as "${sig.type}" via intent detection model (explicit wishlist/recommendation language). Confidence reflects phrase-level match.` }} onOpen={openDrawer}>
                <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(142,145,151,0.08)' : 'none', cursor: 'pointer' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, flexShrink: 0, padding: '3px 9px', borderRadius: 5, alignSelf: 'flex-start', marginTop: 2,
                    background: sig.type === 'Wishlist' ? 'rgba(255,184,0,0.1)' : 'rgba(45,212,191,0.1)',
                    color: sig.type === 'Wishlist' ? '#FFB800' : '#2DD4BF',
                    border: `1px solid ${sig.type === 'Wishlist' ? 'rgba(255,184,0,0.25)' : 'rgba(45,212,191,0.25)'}`,
                  }}>
                    {sig.type}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#F1F1F1', lineHeight: 1.6, marginBottom: 4 }}>"{sig.quote}"</p>
                    <span style={{ fontSize: 11, color: '#8E9197' }}>{sig.src}</span>
                  </div>
                </div>
              </Evid>
            ))}
          </div>
        </div>

        {/* 5. Top Voices */}
        <div className="glass" style={{ padding: '20px 24px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 16 }}>Top Voices</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { src: 'YouTube' as Source, handle: '@DIYwithDave', platform: 'YouTube · 1.2M subscribers', note: 'Produced 3 HD tool reviews this period; combined 420K views, net positive.' },
              { src: 'Reddit' as Source, handle: 'u/ContractorMike_TX', platform: 'Reddit · r/Contractors · 2.4K karma', note: 'Most-upvoted thread on Pro Xtra pricing this month; drives contractor-segment discourse.' },
              { src: 'X/Twitter' as Source, handle: '@HomeRenovationPro', platform: 'X/Twitter · 84K followers', note: 'Amplified self-checkout complaint thread — 2,100 reshares, clear negative signal driver.' },
              { src: 'News' as Source, handle: 'ProBuilder Magazine', platform: 'News · Trade publication', note: 'Published HD Pro segment growth piece — positive earned media with contractor audience reach.' },
            ].filter((v) => visibleSrc.includes(v.src)).map((v, i, arr) => (
              <Evid key={v.handle} data={{ title: v.handle, metric: 'relevance_rank', value: `#${i + 1}`, confidence: 'Medium', source: v.platform, analystNote: v.note }} onOpen={openDrawer}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(142,145,151,0.08)' : 'none', cursor: 'pointer' }}>
                  <SourceBadge source={v.src} size={22} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1' }}>{v.handle}</span>
                      <span style={{ fontSize: 11, color: '#8E9197' }}>{v.platform}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#8E9197', lineHeight: 1.55, margin: 0 }}>{v.note}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(142,145,151,0.4)', flexShrink: 0, marginTop: 2 }}>#{i + 1}</span>
                </div>
              </Evid>
            ))}
          </div>
        </div>

        {/* 6. AI & Cross-Platform Visibility */}
        <div className="glass" style={{ padding: '20px 24px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1', marginBottom: 6 }}>AI & Cross-Platform Visibility</div>
          <p style={{ fontSize: 12, color: '#8E9197', marginBottom: 18 }}>How AI assistants characterize {config.brand} when asked category questions.</p>

          <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 10, padding: '14px 18px', marginBottom: 18 }}>
            <Evid data={{ title: 'AI prompt return rate', metric: 'ai_mention_rate', value: '38%', confidence: 'Medium', source: 'ChatGPT, Gemini, Perplexity — directional estimate', analystNote: 'Estimated share of tracked category prompts returning HD as a primary recommendation. Based on sampled manual prompt runs — not a live API read.' }} onOpen={openDrawer}>
              <div style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 28, fontWeight: 600, color: '#2DD4BF' }}>38%</span>
                <span style={{ fontSize: 13, color: '#8E9197', marginLeft: 10 }}>of tracked category prompts return {config.brand}</span>
              </div>
            </Evid>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 14 }}>
            {[
              { engine: 'ChatGPT', theme: 'Recommends for Pro purchasing, cites BOPIS', score: 0.81 },
              { engine: 'Gemini', theme: 'Associates with tool selection depth and price', score: 0.74 },
              { engine: 'Perplexity', theme: 'Surfaces in contractor/DIY category queries', score: 0.68 },
              { engine: 'Copilot', theme: 'Limited category coverage, neutral framing', score: 0.51 },
            ].map((row, i, arr) => (
              <Evid key={row.engine} data={{ title: row.engine, metric: 'confidence_score', value: String(row.score), confidence: 'Directional', source: 'Sampled prompts · internal estimate', analystNote: `${row.engine}: ${row.theme}. Score reflects frequency and prominence in sampled prompt outputs — not a direct API metric.` }} onOpen={openDrawer}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(142,145,151,0.08)' : 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#F1F1F1', width: 90, flexShrink: 0 }}>{row.engine}</span>
                  <span style={{ fontSize: 12, color: '#8E9197', flex: 1 }}>{row.theme}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 64, height: 3, background: 'rgba(142,145,151,0.12)', borderRadius: 2 }}>
                      <div style={{ width: `${row.score * 100}%`, height: '100%', background: '#2DD4BF', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#8E9197', width: 32, textAlign: 'right' }}>{row.score}</span>
                  </div>
                </div>
              </Evid>
            ))}
          </div>

          <p style={{ fontSize: 11, color: 'rgba(142,145,151,0.55)', lineHeight: 1.6, margin: 0 }}>
            ⚠ Directional only — based on sampled manual prompt runs, not live API access. Platforms without direct API integration (Copilot) are estimated via indirect signals and should be treated as indicative, not precise.
          </p>
        </div>
      </div>

      {/* Floating AI chat */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 150 }}>
        {chatOpen && (
          <div className="glass fade-slide" style={{ width: 316, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(142,145,151,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F1' }}>AI Assistant</span>
              <span style={{ fontSize: 11, color: '#8E9197' }}>{config.sources.join(', ')}</span>
            </div>
            <div style={{ height: 220, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatHistory.length === 0 && <p style={{ fontSize: 12, color: '#8E9197', margin: 'auto', textAlign: 'center' }}>Ask a follow-up question.</p>}
              {chatHistory.map((m, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, lineHeight: 1.55, background: m.role === 'user' ? 'rgba(45,212,191,0.1)' : 'rgba(142,145,151,0.08)', color: m.role === 'user' ? '#2DD4BF' : '#F1F1F1', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>{m.text}</div>
              ))}
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(142,145,151,0.12)', display: 'flex', gap: 8 }}>
              <input className="glass-input" style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
                value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Ask a question…" />
              <button onClick={sendChat} style={{ background: '#2DD4BF', border: 'none', borderRadius: 7, padding: '8px 10px', cursor: 'pointer', color: '#231F20', display: 'flex', alignItems: 'center' }}>
                <Icon.Send />
              </button>
            </div>
          </div>
        )}
        <button onClick={() => setChatOpen((o) => !o)} className="btn-teal"
          style={{ borderRadius: '50%', width: 46, height: 46, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {chatOpen ? <Icon.X /> : <Icon.Chat />}
        </button>
      </div>

      {/* Evidence drawer */}
      {drawer && <EvidenceDrawer data={drawer} onClose={() => setDrawer(null)} />}
    </div>
  )
}

// ── Screen 4 — Reports ────────────────────────────────────────────────────────

const PAST_REPORTS = [
  { title: "Home Depot vs. Lowe's — Q2 Sentiment Analysis", date: 'Jun 28, 2026', summary: 'HD leads on digital experience; Lowe\'s gains on appliance installation satisfaction.' },
  { title: 'Pro Customer Segment — Pain Points Report', date: 'Jun 14, 2026', summary: 'Contractor checkout friction cited in 38% of negative Pro mentions across Reddit and Forums.' },
  { title: 'Regional Inventory Complaints — May Spike', date: 'May 31, 2026', summary: 'Tool inventory gaps drove 22% of negative sentiment during Memorial Day weekend.' },
]

function ReportsScreen({ config }: { config: ProjectConfig }) {
  const [query, setQuery] = useState(config.question || "Why are customers switching to our competitor?")
  const [dateRange, setDateRange] = useState('Last 30 days')

  return (
    <div className="fade-slide" style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
      <div className="glass" style={{ padding: '22px 24px', marginBottom: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F1F1', marginBottom: 16 }}>Generate report</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 6 }}>Query</label>
            <input className="glass-input" style={{ width: '100%', padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }}
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#8E9197', display: 'block', marginBottom: 6 }}>Date range</label>
            <div style={{ position: 'relative' }}>
              <select className="glass-input" style={{ width: '100%', padding: '10px 36px 10px 14px', fontSize: 14, boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' }}
                value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom range'].map((d) => <option key={d} value={d} style={{ background: '#231F20' }}>{d}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#8E9197', pointerEvents: 'none' }}><Icon.ChevronDown /></span>
            </div>
          </div>
          <button className="btn-teal" style={{ alignSelf: 'flex-end', fontSize: 13 }}>Generate</button>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#8E9197', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Previous reports</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {PAST_REPORTS.map((r, i) => (
          <div key={i} className="glass" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F1F1', marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: '#8E9197', marginBottom: 3 }}>{r.date}</div>
              <div style={{ fontSize: 12, color: '#8E9197' }}>{r.summary}</div>
            </div>
            <button style={{ background: 'none', border: '1px solid rgba(142,145,151,0.25)', borderRadius: 7, padding: '7px 9px', cursor: 'pointer', color: '#8E9197', display: 'flex', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2DD4BF'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,212,191,0.35)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8E9197'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(142,145,151,0.25)' }}>
              <Icon.Download />
            </button>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: '#8E9197', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.09em' }}>Intelligence Report · {dateRange}</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#F1F1F1', marginBottom: 4 }}>{config.brand} — Market Intelligence</h2>
            <p style={{ fontSize: 12, color: '#8E9197' }}>Generated Jul 4, 2026 · {config.sources.join(', ')}</p>
          </div>
          <button className="btn-teal" style={{ fontSize: 12, padding: '8px 16px', flexShrink: 0 }}>Export as PDF</button>
        </div>
        <div style={{ borderTop: '1px solid rgba(142,145,151,0.1)', paddingTop: 22, marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Executive Summary</div>
          <p style={{ fontSize: 14, color: '#F1F1F1', lineHeight: 1.7, margin: 0 }}>
            {query} — Customers are switching to Lowe's primarily for appliance installation services and smoother checkout at category-focused stores. Home Depot retains advantage in digital tools (inventory app, BOPIS accuracy) and Pro account management. Most actionable area: weekend in-store execution, which accounts for 38% of all negative sentiment and is the most frequently cited reason in brand-switch narratives.
          </p>
        </div>
        <div style={{ borderTop: '1px solid rgba(142,145,151,0.1)', paddingTop: 22, marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: '#8E9197', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Top Pain Points</div>
          {[{ label: 'Self-checkout reliability', n: 312 }, { label: 'Weekend staffing / wait times', n: 289 }, { label: 'Inventory accuracy online vs in-store', n: 241 }].map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#F1F1F1', padding: '8px 0', borderBottom: '1px solid rgba(142,145,151,0.07)' }}>
              <span>{i + 1}. {p.label}</span><span style={{ color: '#8E9197' }}>{p.n.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(142,145,151,0.1)', paddingTop: 22 }}>
          <div style={{ fontSize: 10, color: '#8E9197', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Recommended Actions</div>
          {['Prioritize self-checkout hardware reliability across top-20 volume stores — 312 negative signals in 30 days.', "Launch weekend Pro contractor lane pilot at 5 metro stores to reduce checkout friction for high-value customers.", "Develop appliance installation narrative to counter Lowe's gaining perception share in that category."].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#F1F1F1', lineHeight: 1.6, marginBottom: 10 }}>
              <span style={{ color: '#2DD4BF', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span><span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── App root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('input')
  const [nav, setNav] = useState<NavItem>('dashboard')
  const [config, setConfig] = useState<ProjectConfig>({
    brand: 'Home Depot', competitors: ["Lowe's", 'Menards'],
    products: ['Power Tools', 'Lumber', 'Appliances'], market: 'United States',
    keywords: ['pro customer', 'self-checkout', 'inventory'],
    sources: ['Reddit', 'YouTube', 'News'], question: '',
  })

  const handleStart = (cfg: ProjectConfig) => { setConfig(cfg); setScreen('processing') }
  const handleDone = useCallback(() => { setScreen('dashboard'); setNav('dashboard') }, [])
  const handleNavChange = (n: NavItem) => { setNav(n); setScreen(n) }

  const showSidebar = screen !== 'input' && screen !== 'processing'

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#231F20', display: 'flex' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 60% 50% at 25% 15%, rgba(45,212,191,0.035) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 85% 85%, rgba(45,212,191,0.025) 0%, transparent 60%)' }} />

      {showSidebar && <Sidebar nav={nav} setNav={handleNavChange} brand={config.brand} onNewProject={() => setScreen('input')} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: showSidebar ? SIDEBAR_W : 0, position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {screen === 'input' && <InputScreen onStart={handleStart} />}
        {screen === 'processing' && <ProcessingScreen config={config} onDone={handleDone} />}
        {screen === 'dashboard' && <DashboardScreen config={config} />}
        {screen === 'reports' && <ReportsScreen config={config} />}
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-slide { animation: fadeSlideUp 0.25s cubic-bezier(0.22,1,0.36,1) forwards; }
        .spinner { animation: spin 0.8s linear infinite; }
        .glass { background: rgba(35,31,32,0.55); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(142,145,151,0.15); border-radius: 14px; }
        .glass-input { background: rgba(35,31,32,0.7); backdrop-filter: blur(8px); border: 1px solid rgba(142,145,151,0.22); border-radius: 8px; color: #F1F1F1; outline: none; transition: border-color 0.15s ease; display: block; }
        .glass-input:focus { border-color: #2DD4BF; box-shadow: 0 0 0 2px rgba(45,212,191,0.12); }
        .glass-input::placeholder { color: rgba(142,145,151,0.5); }
        .btn-teal { background: #2DD4BF; color: #231F20; font-weight: 600; border-radius: 8px; padding: 10px 24px; border: none; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 0 14px rgba(45,212,191,0.22); font-family: inherit; }
        .btn-teal:hover { background: #3ae0cc; box-shadow: 0 0 22px rgba(45,212,191,0.38); }
        .btn-teal:disabled { opacity: 0.4; cursor: not-allowed; }
        .tag-chip { background: rgba(45,212,191,0.1); border: 1px solid rgba(45,212,191,0.22); color: #2DD4BF; border-radius: 6px; padding: 3px 9px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
        .source-chip-off { border: 1px solid rgba(142,145,151,0.3); color: #8E9197; border-radius: 8px; padding: 6px 13px; font-size: 13px; cursor: pointer; transition: all 0.15s; background: transparent; font-family: inherit; }
        .source-chip-off:hover { border-color: rgba(142,145,151,0.55); color: #F1F1F1; }
        .source-chip-on { border: 1px solid #2DD4BF; color: #2DD4BF; background: rgba(45,212,191,0.09); border-radius: 8px; padding: 6px 13px; font-size: 13px; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(142,145,151,0.25); border-radius: 2px; }
      `}</style>
    </div>
  )
}
