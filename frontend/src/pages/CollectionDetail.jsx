import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Globe, Lock, Share2, GripVertical, Loader2, Link2, LayoutGrid, List } from 'lucide-react';
import { getCollection, updateCollection, reorderCollectionLinks } from '../lib/api';
import LinkCard from '../components/links/LinkCard';
import AddLinkModal from '../components/links/AddLinkModal';
import toast from 'react-hot-toast';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 3, y = 3) => `${x}px ${y}px 0px 0px ${c}`;

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('grid');
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    getCollection(id)
      .then(setCollection)
      .catch(() => navigate('/collections'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTogglePublic = async () => {
    try {
      const updated = await updateCollection(id, { is_public: !collection.is_public });
      setCollection(prev => ({ ...prev, ...updated }));
      toast.success(updated.is_public ? 'Collection is now public' : 'Collection is now private');
    } catch { toast.error('Failed to update'); }
  };

  const handleShare = () => {
    if (!collection?.is_public) { toast('Make the collection public first'); return; }
    const url = `${window.location.origin}/u/${collection.user_username}/c/${collection.slug}`;
    const msg = `Check out my "${collection.name}" link collection:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Drag & Drop handlers
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx);
    // Make drag ghost slightly transparent
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1';
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      const links = [...(collection?.links || [])];
      const [moved] = links.splice(dragIdx, 1);
      links.splice(dragOverIdx, 0, moved);
      setCollection(prev => ({ ...prev, links }));

      // Save reorder to backend
      try {
        const items = links.map((l, i) => ({ id: l.id, position: i }));
        await reorderCollectionLinks(id, items);
        toast.success('Links reordered!');
      } catch {
        toast.error('Failed to save order');
      }
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto">
      <div className="skeleton h-8 w-48 rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
      </div>
    </div>
  );

  const links = collection?.links || [];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Back */}
      <Link to="/collections" className="inline-flex items-center gap-1.5 text-sm mb-5 px-3 py-1.5 rounded-full transition-all"
        style={{ color: C.muted, border: `2px solid ${C.foreground}10` }}
        onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}15`; e.currentTarget.style.color = C.foreground; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
        <ArrowLeft size={14} /> All Collections
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
              style={collection?.is_public
                ? { background: `${C.quaternary}15`, color: C.quaternary, border: `1.5px solid ${C.quaternary}50` }
                : { background: `${C.foreground}05`, color: C.muted, border: `1.5px solid ${C.foreground}15` }
              }>
              {collection?.is_public ? <><Globe size={10} /> Public</> : <><Lock size={10} /> Private</>}
            </span>
          </div>
          <h1 className="font-extrabold text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{collection?.name}</h1>
          {collection?.description && <p className="text-sm mt-1" style={{ color: C.muted }}>{collection.description}</p>}
          <p className="text-xs mt-1" style={{ color: C.muted }}>{links.length} links · drag to reorder</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl p-1 gap-1" style={{ background: '#fff', border: `2px solid ${C.foreground}15` }}>
            {[{ v: 'grid', Icon: LayoutGrid }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button key={v} onClick={() => setView(v)} className="p-1.5 rounded-lg transition-all"
                style={view === v ? { background: C.accent, color: '#fff', border: `1.5px solid ${C.foreground}` } : { color: C.muted, border: '1.5px solid transparent' }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button onClick={handleTogglePublic} className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all"
            style={{ color: C.foreground, border: `2px solid ${C.foreground}15` }}>
            {collection?.is_public ? <Lock size={14} /> : <Globe size={14} />}
            {collection?.is_public ? 'Make Private' : 'Make Public'}
          </button>
          {collection?.is_public && (
            <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-bold transition-all"
              style={{ background: C.quaternary, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}>
              <Share2 size={14} /> Share
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold transition-all"
            style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}>
            <Plus size={15} /> Add Link
          </button>
        </div>
      </div>

      {/* Links with Drag & Drop */}
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `${C.accent}10`, border: `2px solid ${C.accent}30` }}>
            <Link2 size={28} style={{ color: C.accent }} />
          </div>
          <h3 className="font-extrabold text-xl mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Empty collection</h3>
          <p className="text-sm mb-6" style={{ color: C.muted }}>Add links to start building this collection.</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
            style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}>
            <Plus size={16} /> Add First Link
          </button>
        </div>
      ) : (
        <div className={`grid gap-5 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {links.map((link, i) => (
            <div key={link.id}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, i)}
              className="animate-slide-up relative group"
              style={{
                animationDelay: `${Math.min(i * 30, 300)}ms`,
                borderRadius: '16px',
                outline: dragOverIdx === i ? `2px dashed ${C.accent}` : 'none',
                outlineOffset: '4px',
                transition: 'outline 0.15s ease',
              }}>
              {/* Drag handle indicator */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
                style={{ color: C.muted }}>
                <GripVertical size={16} />
              </div>
              <LinkCard link={link} index={i} />
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddLinkModal
          defaultCollectionId={id}
          onClose={() => setShowAdd(false)}
          onCreated={(newLink) => setCollection(prev => ({ ...prev, links: [newLink, ...(prev?.links || [])] }))}
        />
      )}
    </div>
  );
}
