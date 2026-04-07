import { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, ArrowRight } from 'lucide-react';
import { getLinks } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  let debounceTimer = null;

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIdx(i => Math.min(i + 1, results.length - 1));
      if (e.key === 'ArrowUp') setSelectedIdx(i => Math.max(i - 1, 0));
      if (e.key === 'Enter' && results[selectedIdx]) {
        window.open(results[selectedIdx].url, '_blank');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [results, selectedIdx]);

  useEffect(() => {
    clearTimeout(debounceTimer);
    if (!query.trim()) { setResults([]); return; }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getLinks({ search: query, limit: 8 });
        setResults(data.links || []);
        setSelectedIdx(0);
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-[10vh] px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your vault..."
            className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400 bg-transparent"
          />
          {loading && <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((link, i) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${i === selectedIdx ? 'bg-brand-50' : ''}`}
                  onClick={onClose}
                >
                  {link.favicon_url && <img src={link.favicon_url} className="w-5 h-5 rounded" alt="" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{link.title || link.url}</p>
                    <p className="text-xs text-gray-400 truncate">{link.domain}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        ) : query && !loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">No results for "{query}"</div>
        ) : !query ? (
          <div className="py-8 px-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Navigation</p>
            {[
              { label: 'All Links', path: '/links' },
              { label: 'Collections', path: '/collections' },
              { label: 'Analytics', path: '/analytics' },
              { label: 'Settings', path: '/settings' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose(); }}
                className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors"
              >
                {item.label}
                <ArrowRight size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
