import { useState, useEffect, useRef } from 'react';
import { X, Link2, Loader2, Tag, FolderOpen, FileText, Sparkles, CheckCircle2, Image } from 'lucide-react';
import { createLink, getTags, createTag, getCollections, enrichUrl } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

const TAG_COLORS = ['#5353E8','#EC4899','#10B981','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#14B8A6'];

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

  // Enrichment state
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState(null);
  const enrichTimer = useRef(null);

  useEffect(() => {
    if (!tags.length) getTags().then(setTags).catch(() => {});
    if (!collections.length) getCollections().then(setCollections).catch(() => {});
  }, []);

  // Debounced URL enrichment — auto-fill title & thumbnail on URL paste/change
  useEffect(() => {
    if (enrichTimer.current) clearTimeout(enrichTimer.current);

    if (!url.trim() || !isValidUrl(url.trim())) {
      setEnriched(null);
      return;
    }

    enrichTimer.current = setTimeout(async () => {
      setEnriching(true);
      try {
        const data = await enrichUrl(url.trim());
        setEnriched(data);
        // Only auto-fill title if user hasn't manually typed one
        if (!title.trim() && data.title) {
          setTitle(data.title);
        }
      } catch {
        // Enrichment failed silently — user can still type manually
      } finally {
        setEnriching(false);
      }
    }, 800); // 800ms debounce

    return () => {
      if (enrichTimer.current) clearTimeout(enrichTimer.current);
    };
  }, [url]);

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch { return false; }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const link = await createLink({
        url: url.trim(),
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        collection_id: collectionId || undefined,
        tags: selectedTags,
        is_public: isPublic,
      });
      addLink(link);
      if (onCreated) onCreated(link);
      toast.success('Link saved to vault!');
      onClose();
    } catch (err) {
      toast.error(err?.error || 'Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id) => setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900">Add to Vault</h2>
            <p className="text-sm text-gray-400 mt-0.5">Archiving a new piece of digital history</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Paste URL Here</label>
            <div className="relative">
              <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/awesome-resource"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
                required
                autoFocus
              />
              {/* Enrichment status indicator */}
              {enriching && (
                <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400 animate-spin" />
              )}
              {!enriching && enriched && (
                <CheckCircle2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
          </div>

          {/* Enrichment preview — thumbnail */}
          {enriched?.thumbnail_url && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 animate-fade-in">
              <img
                src={enriched.thumbnail_url}
                alt="Preview"
                className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                onError={e => e.target.parentElement.style.display = 'none'}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{enriched.title || 'Fetched preview'}</p>
                <p className="text-xs text-gray-400 truncate">{enriched.domain}</p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                  <Image size={10} /> Preview
                </span>
              </div>
            </div>
          )}

          {/* Title + Collection row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={enriching ? 'Fetching title...' : 'Entry title'}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <FolderOpen size={12} className="inline mr-1" />Collection
              </label>
              <select
                value={collectionId}
                onChange={e => setCollectionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 bg-white transition-all"
              >
                <option value="">None</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <Tag size={12} className="inline mr-1" />Tags
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50 min-h-[46px]">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color_hex : '#F3F4F6',
                    color: selectedTags.includes(tag.id) ? '#fff' : '#6B7280',
                  }}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && <X size={10} />}
                </button>
              ))}
              {showTagInput ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="text-xs px-2 py-1 rounded-lg border border-brand-300 outline-none w-24"
                    placeholder="Tag name"
                  />
                  <button type="button" onClick={handleAddTag} className="text-xs text-brand-600 font-semibold hover:text-brand-800">Add</button>
                  <button type="button" onClick={() => setShowTagInput(false)} className="text-xs text-gray-400">✕</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowTagInput(true)} className="text-xs text-gray-400 hover:text-brand-600 px-2 py-1">+ Add tag</button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <FileText size={12} className="inline mr-1" />Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Why are you saving this?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all resize-none"
            />
          </div>

          {/* Public toggle — BUG #6 fix: onClick on label for full clickable area */}
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPublic(p => !p)}>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${isPublic ? 'bg-brand-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-600">Make this link public</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition-all shadow-sm shadow-brand-200"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Archiving Link...' : 'Archive Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
