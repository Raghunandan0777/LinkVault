import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, AtSign, GitBranch, ExternalLink, Share2, Link2, ArrowLeft, Loader2 } from 'lucide-react';
import { getPublicProfile, trackClick } from '../lib/api';

function LinkRow({ link }) {
  const tags = link.link_tags?.map(lt => lt.tags).filter(Boolean) || [];
  const handleClick = () => {
    trackClick(link.id, { referrer: 'public_profile' }).catch(() => {});
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

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('public');
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    getPublicProfile(username)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [username]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${data?.user?.display_name}'s LinkVault`, url });
    } else {
      const msg = `Check out ${data?.user?.display_name || username}'s link vault: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <p className="font-display font-bold text-2xl text-gray-900 mb-2">User not found</p>
        <p className="text-gray-500 mb-6">@{username} hasn't set up their vault yet.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
          Create your own page
        </Link>
      </div>
    </div>
  );

  const { user, recentLinks, collections } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F4FD] to-white">
      {/* Back nav */}
      <div className="max-w-xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={14} /> LinkVault
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="text-center mb-8 animate-slide-up">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
            alt={user.display_name}
          />
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">{user.display_name || user.username}</h1>
          {user.bio && <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">{user.bio}</p>}

          {/* Social icons */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {user.website_url && <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 transition-all"><Globe size={16} /></a>}
            {user.twitter_handle && <a href={`https://twitter.com/${user.twitter_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-all"><AtSign size={16} /></a>}
            {user.github_handle && <a href={`https://github.com/${user.github_handle}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all"><GitBranch size={16} /></a>}
            {user.instagram_handle && <a href={`https://instagram.com/${user.instagram_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-pink-500 hover:border-pink-200 transition-all"><AtSign size={16} /></a>}
            <button onClick={handleShare} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-200 transition-all" title="Share via WhatsApp">
              <Share2 size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            <button onClick={() => setActiveTab('public')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'public' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Public Page</button>
            <button onClick={() => setActiveTab('collections')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'collections' ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Collections</button>
          </div>
        </div>

        {activeTab === 'public' ? (
          <div className="animate-fade-in">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Recently Vaulted</p>
            {recentLinks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Link2 size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No public links yet</p>
              </div>
            ) : (
              <div className="space-y-1">
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
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No public collections yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collections.map((col, i) => (
                  <Link
                    key={col.id}
                    to={`/u/${username}/c/${col.slug}`}
                    className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand-200 transition-all animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {col.cover_image_url && (
                      <div className="h-32 overflow-hidden">
                        <img src={col.cover_image_url} alt={col.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-display font-bold text-gray-900 text-sm mb-1">{col.name}</h3>
                      {col.description && <p className="text-xs text-gray-500 line-clamp-2">{col.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-100">
          <Link to="/" className="text-brand-600 font-display font-bold text-sm hover:text-brand-800 transition-colors">LinkVault</Link>
          <p className="text-xs text-gray-400 mt-1">Built with LinkVault © 2025</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-all">
            Create your own page 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}
