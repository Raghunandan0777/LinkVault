import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Globe, Share2, Copy, Eye, ExternalLink, Link2 } from 'lucide-react';
import { getProfile, getLinks, getCollections } from '../lib/api';
import toast from 'react-hot-toast';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;

export default function PublicPageView() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile().catch(() => null),
      getLinks({ limit: 10 }).catch(() => ({ links: [] })),
      getCollections().catch(() => []),
    ]).then(([p, l, c]) => { setProfile(p); setLinks(l?.links || []); setCollections(c || []); })
      .finally(() => setLoading(false));
  }, []);

  const publicUrl = profile?.username ? `${window.location.origin}/u/${profile.username}` : null;
  const handleCopy = () => { if (publicUrl) { navigator.clipboard.writeText(publicUrl); toast.success('Link copied!'); } };
  const handleShare = () => {
    if (!publicUrl) { toast('Set a username in Settings first'); return; }
    const msg = `Check out my link vault: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const publicLinks = links.filter(l => l.is_public);
  const publicCollections = collections.filter(c => c.is_public);

  const STATS = [
    { label: 'Public Links', value: publicLinks.length, color: C.accent },
    { label: 'Public Collections', value: publicCollections.length, color: C.quaternary },
    { label: 'Total Links', value: links.length, color: C.secondary },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div className="mb-6">
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
          style={{ background: `${C.quaternary}12`, color: C.quaternary, border: `1.5px solid ${C.quaternary}30` }}>
          Your Page
        </span>
        <h1 className="font-extrabold text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Public Page</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>This is what visitors see when they visit your profile.</p>
      </div>

      {/* URL bar */}
      {publicUrl ? (
        <div className="flex items-center gap-2 mb-6 p-3 bg-white rounded-2xl"
          style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}10` }}>
          <Globe size={16} style={{ color: C.accent }} className="flex-shrink-0" />
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm font-semibold truncate" style={{ color: C.accent }}>{publicUrl}</a>
          <button onClick={handleCopy} className="p-1.5 rounded-lg transition-all" style={{ color: C.muted, border: `2px solid ${C.foreground}10` }} title="Copy">
            <Copy size={15} />
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold transition-all"
            style={{ background: C.quaternary, border: `2px solid ${C.foreground}` }}>
            <Share2 size={13} /> Share
          </button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{ background: `${C.accent}10`, color: C.accent, border: `1.5px solid ${C.accent}30` }}>
            <Eye size={13} /> Preview
          </a>
        </div>
      ) : (
        <div className="p-4 rounded-2xl mb-6 text-sm" style={{ background: `${C.tertiary}15`, border: `2px solid ${C.tertiary}40`, color: C.foreground }}>
          ⚠️ Set a username in <a href="/settings" className="font-bold underline" style={{ color: C.accent }}>Settings → Profile</a> to activate your public page.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center transition-all"
            style={{ border: `2px solid ${C.foreground}`, boxShadow: `4px 4px 0px 0px ${color}40` }}>
            <p className="font-extrabold text-2xl mb-0.5" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{value}</p>
            <p className="text-xs font-semibold" style={{ color: C.muted }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Preview card */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.accent}40` }}>
        <div className="p-8 text-center" style={{ background: `${C.accent}08`, borderBottom: `2px solid ${C.foreground}10` }}>
          <img src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            className="w-20 h-20 rounded-full mx-auto mb-3" style={{ border: `3px solid ${C.foreground}` }} alt="avatar" />
          <h2 className="font-extrabold text-xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>
            {profile?.display_name || user?.fullName || 'Your Name'}
          </h2>
          {profile?.bio && <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: C.muted }}>{profile.bio}</p>}
        </div>

        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Recently Vaulted</p>
          {publicLinks.length === 0 ? (
            <div className="text-center py-8" style={{ color: C.muted }}>
              <Link2 size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No public links yet. Go to All Links and toggle "Make public" on some links.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {publicLinks.slice(0, 5).map(link => (
                <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}10`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  {link.favicon_url && <img src={link.favicon_url} className="w-5 h-5 rounded" alt="" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: C.foreground }}>{link.title || link.url}</p>
                    <p className="text-xs truncate" style={{ color: C.muted }}>{link.domain}</p>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: C.muted }}>
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
              {publicLinks.length > 5 && <p className="text-xs text-center pt-2" style={{ color: C.muted }}>+{publicLinks.length - 5} more on your public page</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
