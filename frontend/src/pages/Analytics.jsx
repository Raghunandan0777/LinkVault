import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Link2, MousePointer, Tag, Eye, ExternalLink, Download } from 'lucide-react';
import { getAnalytics } from '../lib/api';

const TAG_COLORS = ['#5353E8', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9'];

function StatCard({ label, value, change, icon: Icon, color }) {
  const positive = change >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="font-display font-bold text-2xl text-gray-900">{value}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="text-gray-400 mb-0.5">{label}</p>
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
    getAnalytics(days)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const fmtNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-8 skeleton rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
      <div className="skeleton h-72 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Performance Hub</p>
          <h1 className="font-display font-bold text-3xl text-gray-900">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${days === d ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'}`}
            >
              Last {d} Days
            </button>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Links" value={fmtNum(data?.totalLinks || 0)} change={12} icon={Link2} color="bg-brand-600" />
        <StatCard label="Total Clicks" value={fmtNum(data?.totalClicks || 0)} change={24} icon={MousePointer} color="bg-pink-500" />
        <StatCard
          label="Top Category"
          value={data?.topCategory || 'None'}
          icon={Tag}
          color="bg-emerald-500"
        />
        <StatCard label="Profile Views" value={fmtNum(data?.profileViews || 0)} change={-3} icon={Eye} color="bg-violet-500" />
      </div>

      {/* Chart + Tag Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-lg text-gray-900">Link Engagement</h2>
              <p className="text-xs text-gray-400 mt-0.5">Clicks over {days} days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-xs text-gray-500">Active Links</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.chartData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5353E8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5353E8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke="#5353E8" strokeWidth={2.5} fill="url(#brandGrad)" dot={false} activeDot={{ r: 5, fill: '#5353E8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tag Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-gray-900">Tag Distribution</h2>
            <button className="text-xs text-brand-600 font-semibold hover:text-brand-800">Manage Tags →</button>
          </div>
          <div className="space-y-4">
            {(data?.tagDistribution || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No tags yet</p>
            ) : (
              data.tagDistribution.map((tag, i) => (
                <div key={tag.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }} />
                      <span className="text-sm font-medium text-gray-800">{tag.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{tag.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${tag.percent}%`, backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Links Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-gray-900">Top Links by Clicks</h2>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">···</button>
        </div>

        {(data?.topLinks || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No click data yet. Share your links to see stats here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Link Details', 'Domain', 'Clicks', 'Engagement', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.topLinks.map((link, i) => {
                  const maxClicks = data.topLinks[0]?.click_count || 1;
                  const pct = Math.round((link.click_count / maxClicks) * 100);
                  return (
                    <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          {link.thumbnail_url ? (
                            <img src={link.thumbnail_url} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-100" onError={e => e.target.style.display='none'} />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                              <Link2 size={16} className="text-brand-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{link.title || link.url}</p>
                            <p className="text-xs text-gray-400">{new Date(link.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline truncate block max-w-[140px]">
                          {link.domain}
                        </a>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-display font-bold text-lg text-gray-900">{fmtNum(link.click_count)}</span>
                      </td>
                      <td className="py-3.5 pr-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 font-medium w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-300 hover:text-brand-600 rounded-lg transition-colors block">
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
      </div>
    </div>
  );
}
