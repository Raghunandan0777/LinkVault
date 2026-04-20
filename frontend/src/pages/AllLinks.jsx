import { useEffect, useState, useCallback } from 'react';
import { LayoutGrid, List, Plus, Loader2, Link2 } from 'lucide-react';
import { getLinks, getTags } from '../lib/api';
import { useApp } from '../context/AppContext';
import LinkCard from '../components/links/LinkCard';
import AddLinkModal from '../components/links/AddLinkModal';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 3, y = 3) => `${x}px ${y}px 0px 0px ${c}`;

export default function AllLinks() {
  const { links, setLinks, tags, setTags } = useApp();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [activeTag, setActiveTag] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLinks = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const data = await getLinks({ page: p, limit: 24, tag: activeTag || undefined });
      if (reset) { setLinks(data.links || []); setPage(1); }
      else { setLinks(prev => [...prev, ...(data.links || [])]); }
      setHasMore((data.links || []).length === 24);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeTag, page]);

  useEffect(() => {
    fetchLinks(true);
    if (!tags.length) getTags().then(setTags).catch(() => {});
  }, [activeTag]);

  const loadMore = () => { setPage(p => p + 1); };
  useEffect(() => { if (page > 1) fetchLinks(); }, [page]);

  const filteredLinks = activeTag
    ? links.filter(l => l.link_tags?.some(lt => lt.tags?.id === activeTag || lt.tags?.name === activeTag))
    : links;

  return (
    <div className="max-w-7xl mx-auto" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
            style={{ background: `${C.accent}12`, color: C.accent, border: `1.5px solid ${C.accent}30` }}>
            Workspace
          </span>
          <h1 className="font-extrabold text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>All Links</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: '#fff', border: `2px solid ${C.foreground}15` }}>
            {[{ v: 'grid', Icon: LayoutGrid }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button key={v} onClick={() => setView(v)}
                className="p-1.5 rounded-lg transition-all"
                style={view === v ? { background: C.accent, color: '#fff', boxShadow: hardShadow(C.foreground, 2, 2), border: `1.5px solid ${C.foreground}` } : { color: C.muted, border: '1.5px solid transparent' }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-200"
            style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 5, 5); e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(); e.currentTarget.style.transform = 'none'; }}
          >
            <Plus size={16} strokeWidth={2.5} /> Add Link
          </button>
        </div>
      </div>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          <button onClick={() => setActiveTag(null)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={!activeTag ? { background: C.accent, color: '#fff', border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) } : { background: '#fff', color: C.muted, border: `2px solid ${C.foreground}15` }}
          >
            All
          </button>
          {tags.map(tag => (
            <button key={tag.id} onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                backgroundColor: activeTag === tag.id ? tag.color_hex : '#fff',
                color: activeTag === tag.id ? '#fff' : tag.color_hex,
                border: `2px solid ${activeTag === tag.id ? C.foreground : tag.color_hex + '30'}`,
                boxShadow: activeTag === tag.id ? hardShadow(C.foreground, 2, 2) : 'none',
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Links */}
      {loading && links.length === 0 ? (
        <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 space-y-3" style={{ border: `2px solid ${C.foreground}15` }}>
              <div className="skeleton h-36 rounded-xl" />
              <div className="skeleton h-4 rounded-lg w-3/4" />
              <div className="skeleton h-3 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `${C.accent}10`, border: `2px solid ${C.accent}30` }}>
            <Link2 size={28} style={{ color: C.accent }} />
          </div>
          <h3 className="font-extrabold text-xl mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Your vault is empty</h3>
          <p className="text-sm mb-6 max-w-sm" style={{ color: C.muted }}>Start saving links from anywhere. Paste a URL and we'll enrich it automatically.</p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-bold transition-all"
            style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
          >
            <Plus size={16} /> Save Your First Link
          </button>
        </div>
      ) : (
        <>
          <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredLinks.map((link, i) => (
              <div key={link.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <LinkCard link={link} index={i} />
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={loadMore} disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
                style={{ color: C.foreground, border: `2px solid ${C.foreground}15` }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}20`; e.currentTarget.style.borderColor = C.tertiary; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${C.foreground}15`; }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Load more
              </button>
            </div>
          )}
        </>
      )}

      {showAdd && <AddLinkModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
