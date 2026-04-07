import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Globe, Lock, Share2, Edit3, Loader2, Link2, LayoutGrid, List } from 'lucide-react';
import { getCollection, updateCollection } from '../lib/api';
import LinkCard from '../components/links/LinkCard';
import AddLinkModal from '../components/links/AddLinkModal';
import toast from 'react-hot-toast';

export default function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('grid');

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

  if (loading) return (
    <div className="max-w-7xl mx-auto">
      <div className="skeleton h-8 w-48 rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
      </div>
    </div>
  );

  const links = collection?.links || [];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Back */}
      <Link to="/collections" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors">
        <ArrowLeft size={14} /> All Collections
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${collection?.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              {collection?.is_public ? <><Globe size={10} /> Public</> : <><Lock size={10} /> Private</>}
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl text-gray-900">{collection?.name}</h1>
          {collection?.description && <p className="text-gray-500 text-sm mt-1">{collection.description}</p>}
          <p className="text-xs text-gray-400 mt-1">{links.length} links</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-brand-600 text-white' : 'text-gray-400'}`}><List size={15} /></button>
          </div>
          <button onClick={handleTogglePublic} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
            {collection?.is_public ? <Lock size={14} /> : <Globe size={14} />}
            {collection?.is_public ? 'Make Private' : 'Make Public'}
          </button>
          {collection?.is_public && (
            <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-all">
              <Share2 size={14} /> Share
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
            <Plus size={15} /> Add Link
          </button>
        </div>
      </div>

      {/* Links */}
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Link2 size={28} className="text-brand-400" />
          </div>
          <h3 className="font-display font-bold text-xl text-gray-900 mb-2">Empty collection</h3>
          <p className="text-gray-500 text-sm mb-6">Add links to start building this collection.</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
            <Plus size={16} /> Add First Link
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {links.map((link, i) => (
            <div key={link.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
              <LinkCard link={link} />
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
