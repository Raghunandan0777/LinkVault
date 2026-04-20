import { useEffect, useState } from 'react';
import { Plus, FolderOpen, Link2, Globe, Lock, Trash2, X, Loader2 } from 'lucide-react';
import { getCollections, createCollection, deleteCollection } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;
const CARD_COLORS = [C.accent, C.secondary, C.tertiary, C.quaternary];

function NewCollectionModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const col = await createCollection({ name: name.trim(), description, is_public: isPublic });
      onCreated(col);
      toast.success('Collection created!');
      onClose();
    } catch (err) {
      toast.error(err?.error || 'Failed to create collection');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    border: `2px solid ${C.foreground}15`, borderRadius: 12, fontSize: 14, outline: 'none',
    width: '100%', padding: '10px 14px', background: '#fff',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', transition: 'all 0.2s',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md animate-scale-in p-6"
        style={{ background: C.cream, border: `2px solid ${C.foreground}`, borderRadius: 20, boxShadow: `8px 8px 0px 0px ${C.secondary}` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>New Collection</h2>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: C.muted, border: `2px solid ${C.foreground}10` }}><X size={18} /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Name</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Design Resources" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = C.accent; }} onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What's in this collection?"
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => { e.target.style.borderColor = C.accent; }} onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsPublic(p => !p)}>
            <div className="w-11 h-6 rounded-full relative transition-colors" style={{ background: isPublic ? C.accent : `${C.foreground}20`, border: `2px solid ${C.foreground}20` }}>
              <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: isPublic ? 'translateX(22px)' : 'translateX(2px)' }} />
            </div>
            <span className="text-sm" style={{ color: C.foreground }}>Make collection public</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: `2px solid ${C.foreground}15`, color: C.foreground }}>Cancel</button>
            <button type="submit" disabled={loading || !name}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-all"
              style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 3, 3) }}>
              {loading && <Loader2 size={14} className="animate-spin" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Collections() {
  const { collections, setCollections, addCollection, removeCollection } = useApp();
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCollections().then(data => { setCollections(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this collection? Links inside will not be deleted.')) return;
    try {
      await deleteCollection(id);
      removeCollection(id);
      toast.success('Collection deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-7xl mx-auto" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
            style={{ background: `${C.secondary}12`, color: C.secondary, border: `1.5px solid ${C.secondary}30` }}>
            Workspace
          </span>
          <h1 className="font-extrabold text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Collections</h1>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-200"
          style={{ background: C.secondary, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 6, 6); e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(); e.currentTarget.style.transform = 'none'; }}>
          <Plus size={16} strokeWidth={2.5} /> New Collection
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.foreground}15` }}>
              <div className="skeleton h-44" /><div className="p-4 space-y-2"><div className="skeleton h-5 rounded w-1/2" /><div className="skeleton h-3 rounded w-1/4" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* New Collection card */}
          <button onClick={() => setShowNew(true)}
            className="rounded-2xl flex flex-col items-center justify-center py-12 transition-all group"
            style={{ border: `3px dashed ${C.foreground}20` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = `${C.accent}06`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}20`; e.currentTarget.style.background = 'transparent'; }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors"
              style={{ background: `${C.accent}12`, border: `2px solid ${C.accent}30` }}>
              <Plus size={22} style={{ color: C.accent }} />
            </div>
            <p className="font-bold" style={{ color: C.foreground }}>New Collection</p>
            <p className="text-sm mt-1" style={{ color: C.muted }}>Create a private space for your links</p>
          </button>

          {collections.map((col, idx) => {
            const linkCount = col.links?.[0]?.count ?? col.link_count ?? '—';
            const shadowColor = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div key={col.id} onClick={() => navigate(`/collections/${col.id}`)}
                className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 animate-slide-up"
                style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${shadowColor}`, animationDelay: `${idx * 50}ms` }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `7px 7px 0px 0px ${shadowColor}`; e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = `5px 5px 0px 0px ${shadowColor}`; e.currentTarget.style.transform = 'none'; }}>
                {/* Cover */}
                <div className="h-44 relative overflow-hidden" style={{ background: shadowColor }}>
                  {col.cover_image_url ? (
                    <img src={col.cover_image_url} alt={col.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <FolderOpen size={64} className="text-white" />
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                      style={col.is_public ? { background: C.quaternary, color: '#fff', border: `2px solid ${C.foreground}` } : { background: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                      {col.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => handleDelete(e, col.id)}
                      className="p-1.5 rounded-lg text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.secondary; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{col.name}</h3>
                  {col.description && <p className="text-xs line-clamp-1 mb-2" style={{ color: C.muted }}>{col.description}</p>}
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: C.muted }}>
                    <Link2 size={13} />
                    <span>{typeof linkCount === 'number' ? `${linkCount} links` : 'Open to view links'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNew && <NewCollectionModal onClose={() => setShowNew(false)} onCreated={addCollection} />}
    </div>
  );
}
