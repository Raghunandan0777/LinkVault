import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, AtSign, GitBranch, ExternalLink, Share2, Link2, ArrowLeft, Loader2 } from 'lucide-react';
import { getPublicProfile, trackClick } from '../lib/api';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;

function LinkRow({ link }) {
  const tags = link.link_tags?.map(lt => lt.tags).filter(Boolean) || [];
  const handleClick = () => {
    trackClick(link.id, { referrer: 'public_profile' }).catch(() => {});
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left group bg-white"
      style={{ border: `2px solid ${C.foreground}10` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${C.accent}40`; e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}10`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {link.thumbnail_url ? (
        <img src={link.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{ border: `2px solid ${C.foreground}15` }} onError={e => e.target.style.display='none'} />
      ) : link.favicon_url ? (
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff', border: `2px solid ${C.foreground}15` }}>
          <img src={link.favicon_url} alt="" className="w-7 h-7" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.accent}10`, border: `2px solid ${C.accent}20` }}>
          <Link2 size={22} style={{ color: C.accent }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {tags.length > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: C.accent }}>{tags[0].name}</span>
        )}
        <p className="font-bold text-sm truncate transition-colors" style={{ color: C.foreground }}>{link.title || link.url}</p>
        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: C.muted }}>
          <Link2 size={10} /> {link.domain}
        </p>
      </div>
      <ExternalLink size={15} className="flex-shrink-0 transition-colors" style={{ color: C.muted }} />
    </button>
  );
}

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('public');
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    getPublicProfile(username).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [username]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: `${data?.user?.display_name}'s LinkVault`, url }); }
    else { window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${data?.user?.display_name || username}'s link vault: ${url}`)}`, '_blank'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
      <Loader2 size={32} className="animate-spin" style={{ color: C.accent }} />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: C.cream }}>
      <div className="text-center">
        <p className="font-extrabold text-2xl mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>User not found</p>
        <p className="mb-6" style={{ color: C.muted }}>@{username} hasn't set up their vault yet.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
          style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}>
          Create your own page
        </Link>
      </div>
    </div>
  );

  const { user, recentLinks, collections } = data;

  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Back nav */}
      <div className="max-w-xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all"
          style={{ color: C.muted, border: `2px solid ${C.foreground}10` }}
          onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}15`; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <ArrowLeft size={14} /> LinkVault
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="text-center mb-8 animate-slide-up">
          <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            style={{ border: `3px solid ${C.foreground}`, boxShadow: `4px 4px 0px 0px ${C.accent}` }}
            alt={user.display_name} />
          <h1 className="font-extrabold text-2xl mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>
            {user.display_name || user.username}
          </h1>
          {user.bio && <p className="text-sm max-w-xs mx-auto mb-4" style={{ color: C.muted }}>{user.bio}</p>}

          {/* Social icons */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {[
              { url: user.website_url, icon: Globe, hc: C.accent },
              { url: user.twitter_handle && `https://twitter.com/${user.twitter_handle.replace('@','')}`, icon: AtSign, hc: '#1DA1F2' },
              { url: user.github_handle && `https://github.com/${user.github_handle}`, icon: GitBranch, hc: C.foreground },
              { url: user.instagram_handle && `https://instagram.com/${user.instagram_handle.replace('@','')}`, icon: AtSign, hc: C.secondary },
            ].filter(s => s.url).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{ background: '#fff', border: `2px solid ${C.foreground}15`, color: C.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = s.hc; e.currentTarget.style.borderColor = s.hc; e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${s.hc}40`; e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = `${C.foreground}15`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <s.icon size={16} />
              </a>
            ))}
            <button onClick={handleShare}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: '#fff', border: `2px solid ${C.foreground}15`, color: C.muted }}
              onMouseEnter={e => { e.currentTarget.style.color = C.quaternary; e.currentTarget.style.borderColor = C.quaternary; e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${C.quaternary}40`; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = `${C.foreground}15`; e.currentTarget.style.boxShadow = 'none'; }}
              title="Share">
              <Share2 size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="inline-flex rounded-full p-1 gap-1" style={{ background: '#fff', border: `2px solid ${C.foreground}15` }}>
            {['public', 'collections'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all capitalize"
                style={activeTab === t
                  ? { background: C.accent, color: '#fff', border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }
                  : { color: C.muted, border: '2px solid transparent' }
                }>
                {t === 'public' ? 'Public Page' : 'Collections'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'public' ? (
          <div className="animate-fade-in">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>Recently Vaulted</p>
            {recentLinks.length === 0 ? (
              <div className="text-center py-12" style={{ color: C.muted }}>
                <Link2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No public links yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLinks.map((link, i) => (
                  <div key={link.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <LinkRow link={link} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {collections.length === 0 ? (
              <div className="text-center py-12" style={{ color: C.muted }}><p className="text-sm">No public collections yet</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collections.map((col, i) => (
                  <Link key={col.id} to={`/u/${username}/c/${col.slug}`}
                    className="block bg-white rounded-2xl overflow-hidden transition-all animate-slide-up"
                    style={{ border: `2px solid ${C.foreground}15`, animationDelay: `${i * 50}ms` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `4px 4px 0px 0px ${C.accent}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}15`; e.currentTarget.style.boxShadow = 'none'; }}>
                    {col.cover_image_url && (
                      <div className="h-32 overflow-hidden"><img src={col.cover_image_url} alt={col.name} className="w-full h-full object-cover" /></div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{col.name}</h3>
                      {col.description && <p className="text-xs line-clamp-2" style={{ color: C.muted }}>{col.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8" style={{ borderTop: `2px solid ${C.foreground}08` }}>
          <Link to="/" className="font-extrabold text-sm" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.accent }}>LinkVault</Link>
          <p className="text-xs mt-1" style={{ color: C.muted }}>Built with LinkVault © 2025</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs" style={{ color: C.muted }}>
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-white text-xs font-bold"
            style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}>
            Create your own page 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}
