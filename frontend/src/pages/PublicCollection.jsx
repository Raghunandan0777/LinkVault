import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Link2, Loader2, Globe } from 'lucide-react';
import { getPublicCollection, trackClick } from '../lib/api';

function LinkRow({ link }) {
  const tags = link.link_tags?.map(lt => lt.tags).filter(Boolean) || [];
  const handleClick = () => {
    trackClick(link.id, { referrer: 'public_collection' }).catch(() => {});
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 text-left group"
    >
      {link.thumbnail_url ? (
        <img src={link.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0" onError={e => e.target.style.display='none'} />
      ) : link.favicon_url ? (
        <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
          <img src={link.favicon_url} alt="" className="w-7 h-7" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Link2 size={22} className="text-brand-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {tags.length > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1 block">{tags[0].name}</span>
        )}
        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-brand-700 transition-colors">{link.title || link.url}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <Link2 size={10} /> {link.domain}
        </p>
      </div>
      <ExternalLink size={15} className="text-gray-300 group-hover:text-brand-500 flex-shrink-0 transition-colors" />
    </button>
  );
}

export default function PublicCollection() {
  const { username, slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicCollection(username, slug)
      .then(setCollection)
      .catch(() => setCollection(null))
      .finally(() => setLoading(false));
  }, [username, slug]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );

  if (!collection) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <p className="font-display font-bold text-2xl text-gray-900 mb-2">Collection not found</p>
        <p className="text-gray-500 mb-6">This collection might be private or deleted.</p>
        <Link to={`/u/${username}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
          <ArrowLeft size={16} /> Back to Profile
        </Link>
      </div>
    </div>
  );

  const publicLinks = (collection.links || []).filter(l => l.is_public);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F4FD] to-white">
      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link to={`/u/${username}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-gray-200">
          <ArrowLeft size={14} /> Back to @{username}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Cover Image & Header */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-8 animate-slide-up shadow-sm">
          {collection.cover_image_url ? (
            <div className="h-48 md:h-64 w-full relative">
              <img src={collection.cover_image_url} alt={collection.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-6 md:p-8">
                <div>
                  <div className="flex items-center gap-2 text-white/90 text-xs font-semibold tracking-wide uppercase mb-2">
                    <Globe size={14} /> Public Collection
                  </div>
                  <h1 className="font-display font-bold text-white text-3xl md:text-4xl leading-tight">{collection.name}</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-brand-500 to-indigo-700 p-8 md:p-12 text-white pb-8 md:pb-10">
              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold tracking-wide uppercase mb-3">
                <Globe size={14} /> Public Collection
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight">{collection.name}</h1>
            </div>
          )}

          {collection.description && (
            <div className="p-6 md:p-8 pt-5 md:pt-6 bg-white border-t border-gray-100/50">
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{collection.description}</p>
            </div>
          )}
        </div>

        {/* Links List */}
        <div className="animate-fade-in" style={{ animationDelay: `100ms` }}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 ml-2">Links in this collection ({publicLinks.length})</p>
          
          {publicLinks.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-3xl border border-gray-100 border-dashed">
              <Link2 size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">No public links found</p>
              <p className="text-xs text-gray-400 mt-1">This collection is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {publicLinks.map((link, i) => (
                <div key={link.id} className="animate-slide-up" style={{ animationDelay: `${(i % 10) * 40}ms` }}>
                  <LinkRow link={link} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-100">
          <Link to="/" className="text-brand-600 font-display font-bold text-sm hover:text-brand-800 transition-colors">LinkVault</Link>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
            <Link to="/" className="hover:text-gray-600 font-medium">Create your own page 🚀</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
