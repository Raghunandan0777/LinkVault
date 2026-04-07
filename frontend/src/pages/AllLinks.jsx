import { useEffect, useState, useCallback } from 'react';
import { LayoutGrid, List, Filter, Plus, Loader2, Link2 } from 'lucide-react';
import { getLinks, getTags } from '../lib/api';
import { useApp } from '../context/AppContext';
import LinkCard from '../components/links/LinkCard';
import AddLinkModal from '../components/links/AddLinkModal';

const VIEWS = ['grid', 'list'];

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
      if (reset) {
        setLinks(data.links || []);
        setPage(1);
      } else {
        setLinks(prev => [...prev, ...(data.links || [])]);
      }
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Workspace</p>
          <h1 className="font-display font-bold text-3xl text-gray-900">All Links</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all"
          >
            <Plus size={16} />
            Add Link
          </button>
        </div>
      </div>

      {/* Tag filter pills */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTag(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!activeTag ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'}`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeTag === tag.id ? tag.color_hex : 'white',
                color: activeTag === tag.id ? '#fff' : tag.color_hex,
                border: `1.5px solid ${tag.color_hex}30`,
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Links grid/list */}
      {loading && links.length === 0 ? (
        <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="skeleton h-36 rounded-xl" />
              <div className="skeleton h-4 rounded-lg w-3/4" />
              <div className="skeleton h-3 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Link2 size={28} className="text-brand-400" />
          </div>
          <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Your vault is empty</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">Start saving links from anywhere. Paste a URL and we'll enrich it automatically.</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
            <Plus size={16} /> Save Your First Link
          </button>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredLinks.map((link, i) => (
              <div key={link.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <LinkCard link={link} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
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
