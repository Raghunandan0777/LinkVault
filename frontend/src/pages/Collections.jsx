import { useEffect, useState } from 'react';
import { Plus, FolderOpen, Link2, Globe, Lock, Trash2, Edit3, X, Loader2 } from 'lucide-react';
import { getCollections, createCollection, deleteCollection } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg">New Collection</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"><X size={18} /></button>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Name</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Design Resources" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What's in this collection?" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all resize-none" />
          </div>
          <label onClick={() => setIsPublic(p => !p)} className="flex items-center gap-3 cursor-pointer select-none">
            <div className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-brand-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-600">Make collection public</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading || !name} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const COVER_COLORS = [
  'from-brand-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
  'from-violet-500 to-indigo-600',
];

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
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Workspace</p>
          <h1 className="font-display font-bold text-3xl text-gray-900">Collections</h1>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
          <Plus size={16} /> New Collection
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="skeleton h-44" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-5 rounded w-1/2" />
                <div className="skeleton h-3 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* New Collection card */}
          <button
            onClick={() => setShowNew(true)}
            className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center py-12 hover:border-brand-400 hover:bg-brand-50/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3 group-hover:bg-brand-200 transition-colors">
              <Plus size={22} className="text-brand-600" />
            </div>
            <p className="font-semibold text-gray-700 group-hover:text-brand-700">New Collection</p>
            <p className="text-sm text-gray-400 mt-1">Create a private space for your links</p>
          </button>

          {collections.map((col, idx) => {
            const linkCount = col.links?.[0]?.count ?? col.link_count ?? '—';
            const gradient = COVER_COLORS[idx % COVER_COLORS.length];
            return (
              <div
                key={col.id}
                onClick={() => navigate(`/collections/${col.id}`)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-gray-200 hover:border-gray-200 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Cover */}
                <div className={`h-44 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                  {col.cover_image_url ? (
                    <img src={col.cover_image_url} alt={col.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <FolderOpen size={64} className="text-white" />
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${col.is_public ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                      {col.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={e => handleDelete(e, col.id)} className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-gray-900 mb-1">{col.name}</h3>
                  {col.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{col.description}</p>}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
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
