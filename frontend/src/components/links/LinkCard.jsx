import { useState } from 'react';
import { ExternalLink, Trash2, Edit3, Globe, Eye, EyeOff, Share2 } from 'lucide-react';
import { deleteLink, updateLink as apiUpdateLink } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const SHADOW_COLORS = [C.accent, C.secondary, C.tertiary, C.quaternary];
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;

export default function LinkCard({ link, index = 0, onEdit }) {
  const { removeLink, updateLink } = useApp();
  const [deleting, setDeleting] = useState(false);
  const shadowColor = SHADOW_COLORS[index % SHADOW_COLORS.length];

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
    <div
      className="group bg-white rounded-2xl overflow-hidden cursor-default transition-all duration-200"
      style={{
        border: `2px solid ${C.foreground}`,
        boxShadow: `5px 5px 0px 0px ${shadowColor}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `7px 7px 0px 0px ${shadowColor}`; e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `5px 5px 0px 0px ${shadowColor}`; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Thumbnail */}
      {link.thumbnail_url && (
        <div className="h-36 overflow-hidden" style={{ borderBottom: `2px solid ${C.foreground}15` }}>
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
            <img src={link.favicon_url} alt="" className="w-4 h-4 rounded" onError={e => e.target.style.display = 'none'} />
          ) : (
            <Globe size={14} style={{ color: C.muted }} />
          )}
          <span className="text-xs truncate" style={{ color: C.muted }}>{domain}</span>
          {link.is_public && (
            <span
              className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: `${C.quaternary}15`, color: C.quaternary, border: `1.5px solid ${C.quaternary}40` }}
            >
              <Eye size={10} /> Public
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm leading-snug mb-1.5 line-clamp-2" style={{ color: C.foreground, fontFamily: '"Outfit", system-ui, sans-serif' }}>
          {link.title || link.url}
        </h3>

        {/* Description */}
        {link.description && (
          <p className="text-xs line-clamp-2 mb-2" style={{ color: C.muted }}>{link.description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map(tag => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: tag.color_hex + '18', color: tag.color_hex, border: `1.5px solid ${tag.color_hex}30` }}
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && <span className="text-xs" style={{ color: C.muted }}>+{tags.length - 3}</span>}
          </div>
        )}

        {/* Notes */}
        {link.notes && (
          <p className="text-xs italic mb-3 line-clamp-1" style={{ color: C.muted }}>"{link.notes}"</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1.5px solid ${C.foreground}08` }}>
          <div className="flex items-center gap-1 text-xs" style={{ color: C.muted }}>
            <span>{link.click_count || 0} clicks</span>
            <span className="mx-1">·</span>
            <span>{new Date(link.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {[
              { icon: ExternalLink, action: () => window.open(link.url, '_blank'), title: 'Open', hoverColor: C.accent },
              { icon: Share2, action: handleShare, title: 'Share', hoverColor: C.quaternary },
              { icon: link.is_public ? EyeOff : Eye, action: handleTogglePublic, title: link.is_public ? 'Make private' : 'Make public', hoverColor: C.accent },
              { icon: Edit3, action: () => onEdit?.(link), title: 'Edit', hoverColor: C.tertiary },
              { icon: Trash2, action: handleDelete, title: 'Delete', hoverColor: C.secondary, disabled: deleting },
            ].map(({ icon: Icon, action, title, hoverColor, disabled }, i) => (
              <button
                key={i}
                onClick={action}
                disabled={disabled}
                className="p-1.5 rounded-lg transition-all duration-200"
                style={{ color: C.muted }}
                onMouseEnter={e => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.background = `${hoverColor}12`; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}
                title={title}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
