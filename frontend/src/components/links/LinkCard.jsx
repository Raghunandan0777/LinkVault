import { useState } from 'react';
import { ExternalLink, Trash2, Edit3, Globe, MoreHorizontal, Eye, EyeOff, Share2 } from 'lucide-react';
import { deleteLink, updateLink as apiUpdateLink } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function LinkCard({ link, onEdit }) {
  const { removeLink, updateLink } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this link?')) return;
    setDeleting(true);
    try {
      await deleteLink(link.id);
      removeLink(link.id);
      toast.success('Link deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const handleTogglePublic = async () => {
    try {
      const updated = await apiUpdateLink(link.id, { is_public: !link.is_public });
      updateLink(link.id, updated);
      toast.success(updated.is_public ? 'Link is now public' : 'Link is now private');
    } catch { toast.error('Failed to update'); }
  };

  const handleShare = () => {
    const text = `Check this out: ${link.title}\n${link.url}`;
    if (navigator.share) {
      navigator.share({ title: link.title, url: link.url });
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, '_blank');
    }
  };

  const tags = link.link_tags?.map(lt => lt.tags).filter(Boolean) || [];
  const domain = link.domain || new URL(link.url).hostname;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all duration-200 overflow-hidden">
      {/* Thumbnail */}
      {link.thumbnail_url && (
        <div className="h-36 overflow-hidden bg-gray-100">
          <img
            src={link.thumbnail_url}
            alt={link.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => e.target.parentElement.style.display = 'none'}
          />
        </div>
      )}

      <div className="p-4">
        {/* Domain + favicon */}
        <div className="flex items-center gap-2 mb-2">
          {link.favicon_url ? (
            <img src={link.favicon_url} alt="" className="w-4 h-4 rounded" onError={e => e.target.style.display='none'} />
          ) : (
            <Globe size={14} className="text-gray-400" />
          )}
          <span className="text-xs text-gray-400 truncate">{domain}</span>
          {link.is_public && (
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
              <Eye size={10} /> Public
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2">
          {link.title || link.url}
        </h3>

        {/* Description */}
        {link.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{link.description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map(tag => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: tag.color_hex + '20', color: tag.color_hex }}
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && <span className="text-xs text-gray-400">+{tags.length - 3}</span>}
          </div>
        )}

        {/* Notes */}
        {link.notes && (
          <p className="text-xs text-gray-400 italic mb-3 line-clamp-1">"{link.notes}"</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{link.click_count || 0} clicks</span>
            <span className="mx-1">·</span>
            <span>{new Date(link.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
              title="Open link"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Share via WhatsApp"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={handleTogglePublic}
              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
              title={link.is_public ? 'Make private' : 'Make public'}
            >
              {link.is_public ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={() => onEdit?.(link)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
