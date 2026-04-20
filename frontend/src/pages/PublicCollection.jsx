import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Link2, Loader2, Globe } from 'lucide-react';
import { getPublicCollection, trackClick } from '../lib/api';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;

function LinkRow({ link }) {
  const tags = link.link_tags?.map(lt => lt.tags).filter(Boolean) || [];
  const handleClick = () => {
    trackClick(link.id, { referrer: 'public_collection' }).catch(() => {});
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

export default function PublicCollection() {
  const { username, slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicCollection(username, slug).then(setCollection).catch(() => setCollection(null)).finally(() => setLoading(false));
  }, [username, slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
      <Loader2 size={32} className="animate-spin" style={{ color: C.accent }} />
    </div>
  );

  if (!collection) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: C.cream }}>
      <div className="text-center">
        <p className="font-extrabold text-2xl mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Collection not found</p>
        <p className="mb-6" style={{ color: C.muted }}>This collection might be private or deleted.</p>
        <Link to={`/u/${username}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
          style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}>
          <ArrowLeft size={16} /> Back to Profile
        </Link>
      </div>
    </div>
  );

  const publicLinks = (collection.links || []).filter(l => l.is_public);

  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link to={`/u/${username}`} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all"
          style={{ color: C.muted, border: `2px solid ${C.foreground}10`, background: '#fff' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}15`; e.currentTarget.style.borderColor = C.tertiary; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = `${C.foreground}10`; }}>
          <ArrowLeft size={14} /> Back to @{username}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-8 animate-slide-up"
          style={{ border: `2px solid ${C.foreground}`, boxShadow: `6px 6px 0px 0px ${C.accent}` }}>
          {collection.cover_image_url ? (
            <div className="h-48 md:h-64 w-full relative">
              <img src={collection.cover_image_url} alt={collection.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-end p-6 md:p-8" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <Globe size={14} /> Public Collection
                  </div>
                  <h1 className="font-extrabold text-3xl md:text-4xl leading-tight text-white" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
                    {collection.name}
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 md:p-12 text-white" style={{ background: C.accent }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <Globe size={14} /> Public Collection
              </div>
              <h1 className="font-extrabold text-3xl md:text-4xl leading-tight" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
                {collection.name}
              </h1>
            </div>
          )}

          {collection.description && (
            <div className="p-6 md:p-8 bg-white" style={{ borderTop: `2px solid ${C.foreground}10` }}>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: C.muted }}>{collection.description}</p>
            </div>
          )}
        </div>

        {/* Links List */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4 ml-2" style={{ color: C.muted }}>
            Links in this collection ({publicLinks.length})
          </p>

          {publicLinks.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: `3px dashed ${C.foreground}15` }}>
              <Link2 size={32} className="mx-auto mb-3" style={{ color: C.muted, opacity: 0.3 }} />
              <p className="text-sm font-semibold" style={{ color: C.foreground }}>No public links found</p>
              <p className="text-xs mt-1" style={{ color: C.muted }}>This collection is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicLinks.map((link, i) => (
                <div key={link.id} className="animate-slide-up" style={{ animationDelay: `${(i % 10) * 40}ms` }}>
                  <LinkRow link={link} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8" style={{ borderTop: `2px solid ${C.foreground}08` }}>
          <Link to="/" className="font-extrabold text-sm" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.accent }}>LinkVault</Link>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: C.muted }}>
            <Link to="/" className="font-semibold inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all"
              style={{ border: `2px solid ${C.foreground}10` }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.accent}10`; e.currentTarget.style.color = C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
              Create your own page 🚀
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
