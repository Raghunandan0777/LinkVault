import { useState, useEffect, useRef } from 'react';
import { X, Link2, Loader2, Tag, FolderOpen, FileText, Sparkles, CheckCircle2, Image, AlertTriangle } from 'lucide-react';
import { createLink, getTags, createTag, getCollections, enrichUrl } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;
const TAG_COLORS = ['#8B5CF6','#F472B6','#34D399','#FBBF24','#EF4444','#0EA5E9','#14B8A6','#F97316'];

export default function AddLinkModal({ onClose, defaultCollectionId, onCreated }) {
  const { addLink, tags, setTags, collections, setCollections } = useApp();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [collectionId, setCollectionId] = useState(defaultCollectionId || '');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const enrichTimer = useRef(null);

  useEffect(() => {
    if (!tags.length) getTags().then(setTags).catch(() => {});
    if (!collections.length) getCollections().then(setCollections).catch(() => {});
  }, []);

  useEffect(() => {
    if (enrichTimer.current) clearTimeout(enrichTimer.current);
    if (!url.trim() || !isValidUrl(url.trim())) { setEnriched(null); return; }
    enrichTimer.current = setTimeout(async () => {
      setEnriching(true);
      try {
        const data = await enrichUrl(url.trim());
        setEnriched(data);
        if (!title.trim() && data.title) setTitle(data.title);
      } catch {} finally { setEnriching(false); }
    }, 800);
    return () => { if (enrichTimer.current) clearTimeout(enrichTimer.current); };
  }, [url]);

  function isValidUrl(string) { try { new URL(string); return true; } catch { return false; } }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
      const tag = await createTag({ name: newTagName.trim(), color_hex: color });
      setTags(prev => [...prev, tag]);
      setSelectedTags(prev => [...prev, tag.id]);
      setNewTagName('');
      setShowTagInput(false);
    } catch { toast.error('Failed to create tag'); }
  };

  const handleSubmit = async (e, forceSave = false) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setDuplicate(null);
    try {
      const link = await createLink({
        url: url.trim(), title: title.trim() || undefined,
        notes: notes.trim() || undefined, collection_id: collectionId || undefined,
        tags: selectedTags, is_public: isPublic,
        ...(forceSave && { force_save: true }),
      });
      addLink(link);
      if (onCreated) onCreated(link);
      toast.success('Link saved to vault!');
      onClose();
    } catch (err) {
      if (err?.error === 'duplicate') {
        setDuplicate(err);
      } else {
        toast.error(err?.error || 'Failed to save link');
      }
    }
    finally { setLoading(false); }
  };

  const toggleTag = (id) => setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const inputStyle = {
    border: `2px solid ${C.foreground}15`,
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-scale-in"
        style={{
          background: C.cream,
          border: `2px solid ${C.foreground}`,
          borderRadius: 20,
          boxShadow: `8px 8px 0px 0px ${C.accent}`,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: `2px solid ${C.foreground}08` }}>
          <div>
            <h2 className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Add to Vault</h2>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>Archiving a new piece of digital history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: C.muted, border: `2px solid ${C.foreground}10` }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.secondary}12`; e.currentTarget.style.color = C.secondary; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Paste URL Here</label>
            <div className="relative">
              <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input
                type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/awesome-resource"
                style={{ ...inputStyle, width: '100%', paddingLeft: 40, paddingRight: 36, paddingTop: 12, paddingBottom: 12, background: '#fff' }}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}15`; }}
                onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; e.target.style.boxShadow = 'none'; }}
                required autoFocus
              />
              {enriching && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" style={{ color: C.accent }} />}
              {!enriching && enriched && <CheckCircle2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: C.quaternary }} />}
            </div>
          </div>

          {/* Enrichment preview */}
          {enriched?.thumbnail_url && (
            <div className="flex items-center gap-3 p-3 rounded-xl animate-fade-in" style={{ background: '#fff', border: `2px solid ${C.foreground}08` }}>
              <img src={enriched.thumbnail_url} alt="Preview" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" onError={e => e.target.parentElement.style.display = 'none'} />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: C.foreground }}>{enriched.title || 'Fetched preview'}</p>
                <p className="text-xs truncate" style={{ color: C.muted }}>{enriched.domain}</p>
              </div>
              <span className="ml-auto flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${C.quaternary}15`, color: C.quaternary }}>
                <Image size={10} /> Preview
              </span>
            </div>
          )}

          {/* Duplicate warning */}
          {duplicate && (
            <div className="flex items-start gap-3 p-3 rounded-xl animate-fade-in" style={{ background: '#FEF3C7', border: `2px solid ${C.tertiary}` }}>
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: '#92400E' }}>This URL is already in your vault</p>
                <p className="text-xs mt-0.5" style={{ color: '#A16207' }}>
                  Saved as "{duplicate.existing_link?.title || 'Untitled'}" on {new Date(duplicate.existing_link?.created_at).toLocaleDateString()}
                </p>
                <button type="button" onClick={(e) => handleSubmit(e, true)}
                  className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: '#D97706', color: '#fff', border: `1.5px solid #92400E` }}>
                  Save Anyway
                </button>
              </div>
            </div>
          )}

          {/* Title + Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder={enriching ? 'Fetching...' : 'Entry title'}
                style={{ ...inputStyle, width: '100%', padding: '10px 12px', background: '#fff' }}
                onFocus={e => { e.target.style.borderColor = C.accent; }}
                onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>
                <FolderOpen size={12} className="inline mr-1" />Collection
              </label>
              <select value={collectionId} onChange={e => setCollectionId(e.target.value)}
                style={{ ...inputStyle, width: '100%', padding: '10px 12px', background: '#fff' }}
              >
                <option value="">None</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>
              <Tag size={12} className="inline mr-1" />Tags
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[46px]" style={{ background: '#fff', border: `2px solid ${C.foreground}10` }}>
              {tags.map(tag => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color_hex : '#fff',
                    color: selectedTags.includes(tag.id) ? '#fff' : tag.color_hex,
                    border: `1.5px solid ${tag.color_hex}40`,
                  }}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && <X size={10} />}
                </button>
              ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input autoFocus value={newTagName} onChange={e => setNewTagName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="text-xs px-2 py-1 rounded-lg outline-none w-24"
                    style={{ border: `2px solid ${C.accent}`, fontSize: 12 }}
                    placeholder="Tag name"
                  />
                  <button type="button" onClick={handleAddTag} className="text-xs font-bold" style={{ color: C.accent }}>Add</button>
                  <button type="button" onClick={() => setShowTagInput(false)} className="text-xs" style={{ color: C.muted }}>✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowTagInput(true)} className="text-xs px-2 py-1 font-medium" style={{ color: C.muted }}>+ Add tag</button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>
              <FileText size={12} className="inline mr-1" />Notes
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Why are you saving this?" rows={3}
              style={{ ...inputStyle, width: '100%', padding: '10px 12px', background: '#fff', resize: 'none' }}
              onFocus={e => { e.target.style.borderColor = C.accent; }}
              onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }}
            />
          </div>

          {/* Public toggle */}
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPublic(p => !p)}>
            <div className="w-11 h-6 rounded-full relative transition-colors" style={{ background: isPublic ? C.accent : `${C.foreground}20`, border: `2px solid ${C.foreground}20` }}>
              <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: isPublic ? 'translateX(22px)' : 'translateX(2px)' }} />
            </div>
            <span className="text-sm" style={{ color: C.foreground }}>Make this link public</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ color: C.foreground, border: `2px solid ${C.foreground}15` }}
              onMouseEnter={e => { e.target.style.background = `${C.foreground}05`; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading || !url}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-all duration-200 disabled:opacity-60"
              style={{
                background: C.accent,
                border: `2px solid ${C.foreground}`,
                boxShadow: hardShadow(C.foreground, 3, 3),
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 5, 5); e.currentTarget.style.transform = 'translate(-2px,-2px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 3, 3); e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Archiving...' : 'Archive Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
