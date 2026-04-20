import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Link2, MousePointer, Tag, Eye, ExternalLink, Download } from 'lucide-react';
import { getAnalytics } from '../lib/api';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;
const TAG_COLORS = [C.accent, C.secondary, C.quaternary, C.tertiary, '#0EA5E9', '#F97316'];

const STAT_CONFIG = [
  { label: 'Total Links', icon: Link2, shadowColor: C.accent, bgColor: C.accent },
  { label: 'Total Clicks', icon: MousePointer, shadowColor: C.secondary, bgColor: C.secondary },
  { label: 'Top Category', icon: Tag, shadowColor: C.quaternary, bgColor: C.quaternary },
  { label: 'Profile Views', icon: Eye, shadowColor: C.tertiary, bgColor: C.tertiary },
];

function StatCard({ label, value, change, icon: Icon, shadowColor, bgColor, delay = 0 }) {
  const positive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
      className="bg-white rounded-2xl p-5 transition-all duration-200"
      style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${shadowColor}` }}
      whileHover={{ y: -4, boxShadow: `7px 7px 0px 0px ${shadowColor}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bgColor, border: `2px solid ${C.foreground}` }}>
          <Icon size={18} className="text-white" />
        </div>
        {change !== undefined && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
            style={positive
              ? { background: `${C.quaternary}15`, color: C.quaternary, border: `1.5px solid ${C.quaternary}30` }
              : { background: '#FEE2E2', color: '#EF4444', border: '1.5px solid #FECACA' }
            }>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>{label}</p>
      <p className="font-extrabold text-2xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{value}</p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="text-white text-xs rounded-xl px-3 py-2"
      style={{ background: C.foreground, border: `2px solid ${C.foreground}`, boxShadow: `3px 3px 0px 0px ${C.accent}` }}>
      <p style={{ color: `${C.muted}` }}>{label}</p>
      <p className="font-bold">{payload[0].value} clicks</p>
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    getAnalytics(days).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [days]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const fmtNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-8 skeleton rounded-xl w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" style={{ border: `2px solid ${C.foreground}15` }} />)}
      </div>
      <div className="skeleton h-72 rounded-2xl" style={{ border: `2px solid ${C.foreground}15` }} />
    </div>
  );

  const statValues = [
    fmtNum(data?.totalLinks || 0),
    fmtNum(data?.totalClicks || 0),
    data?.topCategory || 'None',
    fmtNum(data?.profileViews || 0),
  ];
  const statChanges = [12, 24, undefined, -3];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
            style={{ background: `${C.tertiary}15`, color: `${C.foreground}`, border: `1.5px solid ${C.tertiary}40` }}>
            Performance Hub
          </span>
          <h1 className="font-extrabold text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Analytics</h1>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className="px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap"
              style={days === d
                ? { background: C.accent, color: '#fff', border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }
                : { background: '#fff', color: C.foreground, border: `2px solid ${C.foreground}15` }
              }>
              Last {d} Days
            </button>
          ))}
          <button className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap"
            style={{ background: '#fff', color: C.foreground, border: `2px solid ${C.foreground}15` }}>
            <Download size={15} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_CONFIG.map((cfg, i) => (
          <StatCard key={cfg.label} delay={0.1 + i * 0.1} label={cfg.label} value={statValues[i]} change={statChanges[i]} icon={cfg.icon} shadowColor={cfg.shadowColor} bgColor={cfg.bgColor} />
        ))}
      </div>

      {/* Chart + Tag Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5"
          style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}10` }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Link Engagement</h2>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>Clicks over {days} days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.accent }} />
              <span className="text-xs" style={{ color: C.muted }}>Active Links</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.chartData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke={C.accent} strokeWidth={2.5} fill="url(#brandGrad)" dot={false} activeDot={{ r: 5, fill: C.accent, stroke: C.foreground, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tag Distribution */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-5"
          style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.secondary}40` }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Tag Distribution</h2>
            <button className="text-xs font-bold" style={{ color: C.accent }}>Manage →</button>
          </div>
          <div className="space-y-4">
            {(data?.tagDistribution || []).length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: C.muted }}>No tags yet</p>
            ) : (
              data.tagDistribution.map((tag, i) => (
                <div key={tag.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }} />
                      <span className="text-sm font-semibold" style={{ color: C.foreground }}>{tag.name}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: C.foreground }}>{tag.percent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: `${C.foreground}08` }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${tag.percent}%`, backgroundColor: TAG_COLORS[i % TAG_COLORS.length], border: tag.percent > 5 ? `1px solid ${C.foreground}20` : 'none' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Links Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white rounded-2xl p-5 overflow-hidden"
        style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}10` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Top Links by Clicks</h2>
        </div>

        {(data?.topLinks || []).length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: C.muted }}>No click data yet. Share your links to see stats here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.foreground}10` }}>
                  {['Link Details', 'Domain', 'Clicks', 'Engagement', ''].map(h => (
                    <th key={h} className="text-left text-xs font-bold uppercase tracking-wider pb-3 pr-4" style={{ color: C.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topLinks.map((link, i) => {
                  const maxClicks = data.topLinks[0]?.click_count || 1;
                  const pct = Math.round((link.click_count / maxClicks) * 100);
                  return (
                    <tr key={link.id} className="transition-colors"
                      style={{ borderBottom: `1.5px solid ${C.foreground}06` }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          {link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-xl object-cover"
                              style={{ border: `2px solid ${C.foreground}15` }} onError={e => e.target.style.display = 'none'} />
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: `${C.accent}10`, border: `2px solid ${C.accent}20` }}>
                              <Link2 size={16} style={{ color: C.accent }} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold truncate max-w-[180px]" style={{ color: C.foreground }}>{link.title || link.url}</p>
                            <p className="text-xs" style={{ color: C.muted }}>{new Date(link.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs truncate block max-w-[140px]"
                          style={{ color: C.accent }}>{link.domain}</a>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{fmtNum(link.click_count)}</span>
                      </td>
                      <td className="py-3.5 pr-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${C.foreground}08` }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.accent }} />
                          </div>
                          <span className="text-xs font-semibold w-8 text-right" style={{ color: C.muted }}>{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg transition-all block"
                          style={{ color: C.muted }}
                          onMouseEnter={e => { e.currentTarget.style.color = C.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.color = C.muted; }}>
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
