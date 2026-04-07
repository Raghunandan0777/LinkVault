import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Globe, Share2, Copy, Eye, ExternalLink, Link2 } from 'lucide-react';
import { getProfile, getLinks, getCollections } from '../lib/api';
import toast from 'react-hot-toast';

export default function PublicPageView() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile().catch(() => null),
      getLinks({ limit: 10 }).catch(() => ({ links: [] })),
      getCollections().catch(() => []),
    ]).then(([p, l, c]) => {
      setProfile(p);
      setLinks(l?.links || []);
      setCollections(c || []);
    }).finally(() => setLoading(false));
  }, []);

  const publicUrl = profile?.username ? `${window.location.origin}/u/${profile.username}` : null;

  const handleCopy = () => {
    if (publicUrl) { navigator.clipboard.writeText(publicUrl); toast.success('Link copied!'); }
  };

  const handleShare = () => {
    if (!publicUrl) { toast('Set a username in Settings first'); return; }
    const msg = `Check out my link vault: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const publicLinks = links.filter(l => l.is_public);
  const publicCollections = collections.filter(c => c.is_public);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">Your Page</p>
        <h1 className="font-display font-bold text-3xl text-gray-900">Public Page</h1>
        <p className="text-gray-500 text-sm mt-1">This is what visitors see when they visit your profile.</p>
      </div>

      {/* URL bar */}
      {publicUrl ? (
        <div className="flex items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-gray-100">
          <Globe size={16} className="text-brand-500 flex-shrink-0" />
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-brand-600 font-medium hover:underline truncate">{publicUrl}</a>
          <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all" title="Copy"><Copy size={15} /></button>
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-all">
            <Share2 size={13} /> Share
          </button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold hover:bg-brand-100 transition-all">
            <Eye size={13} /> Preview
          </a>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 text-sm text-amber-700">
          ⚠️ Set a username in <a href="/settings" className="font-semibold underline">Settings → Profile</a> to activate your public page.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Public Links', value: publicLinks.length, icon: Link2 },
          { label: 'Public Collections', value: publicCollections.length, icon: Globe },
          { label: 'Total Links', value: links.length, icon: Link2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="font-display font-bold text-2xl text-gray-900 mb-0.5">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Preview card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-b from-brand-50 to-white p-8 text-center border-b border-gray-100">
          <img
            src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white shadow"
            alt="avatar"
          />
          <h2 className="font-display font-bold text-xl text-gray-900">{profile?.display_name || user?.fullName || 'Your Name'}</h2>
          {profile?.bio && <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">{profile.bio}</p>}
        </div>

        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Recently Vaulted</p>
          {publicLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Link2 size={28} className="mx-auto mb-2 opacity-30" />
              No public links yet. Go to All Links and toggle "Make public" on some links.
            </div>
          ) : (
            <div className="space-y-1">
              {publicLinks.slice(0, 5).map(link => (
                <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                  {link.favicon_url && <img src={link.favicon_url} className="w-5 h-5 rounded" alt="" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{link.title || link.url}</p>
                    <p className="text-xs text-gray-400 truncate">{link.domain}</p>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-brand-500 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
              {publicLinks.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-2">+{publicLinks.length - 5} more on your public page</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
