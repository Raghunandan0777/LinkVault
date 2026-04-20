import { useState, useEffect, useRef } from 'react';
import { Search, X, ExternalLink, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { getLinks, aiSearch } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchMode, setSearchMode] = useState('keyword'); // 'keyword' or 'ai'
  const [aiLoading, setAiLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState(null);
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

  // Keyword search (debounced)
  useEffect(() => {
    if (searchMode !== 'keyword') return;
    clearTimeout(debounceTimer);
    if (!query.trim()) { setResults([]); setSearchMethod(null); return; }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getLinks({ search: query, limit: 8 });
        setResults(data.links || []);
        setSelectedIdx(0);
        setSearchMethod('keyword');
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, searchMode]);

  // AI search (on demand)
  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setAiLoading(true);
    setSearchMethod(null);
    try {
      const data = await aiSearch(query);
      setResults(data.results || []);
      setSelectedIdx(0);
      setSearchMethod(data.method || 'ai');
    } catch {
      setResults([]);
    } finally {
      setAiLoading(false);
    }
  };

  const isSearching = loading || aiLoading;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-50 pt-[10vh] px-4"
      style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden animate-scale-in"
        style={{
          background: C.cream,
          border: `2px solid ${C.foreground}`,
          borderRadius: 20,
          boxShadow: `8px 8px 0px 0px ${C.accent}`,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Mode toggle */}
        <div className="flex items-center gap-1.5 px-5 pt-4 pb-2">
          {[
            { mode: 'keyword', label: 'Search', icon: Search },
            { mode: 'ai', label: 'AI Search', icon: Sparkles },
          ].map(({ mode, label, icon: Icon }) => (
            <button key={mode} onClick={() => { setSearchMode(mode); setResults([]); setSearchMethod(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={searchMode === mode
                ? { background: C.accent, color: '#fff', border: `1.5px solid ${C.foreground}`, boxShadow: `2px 2px 0px 0px ${C.foreground}` }
                : { color: C.muted, border: `1.5px solid ${C.foreground}12` }
              }>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `2px solid ${C.foreground}08` }}>
          {searchMode === 'ai' ? (
            <Sparkles size={18} style={{ color: C.secondary }} className="flex-shrink-0" />
          ) : (
            <Search size={18} style={{ color: C.accent }} className="flex-shrink-0" />
          )}
          <input
            ref={inputRef} type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && searchMode === 'ai') { e.preventDefault(); handleAiSearch(); } }}
            placeholder={searchMode === 'ai' ? 'Ask anything... "that React article about hooks"' : 'Search your vault...'}
            className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
            style={{ color: C.foreground, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          />
          {isSearching && <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: C.accent }} />}
          {searchMode === 'ai' && query.trim() && !aiLoading && (
            <button onClick={handleAiSearch} className="px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 transition-all"
              style={{ background: C.secondary, border: `1.5px solid ${C.foreground}`, boxShadow: `2px 2px 0px 0px ${C.foreground}` }}>
              Search
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg flex-shrink-0" style={{ color: C.muted }}>
            <X size={16} />
          </button>
        </div>

        {/* Method badge */}
        {searchMethod && results.length > 0 && (
          <div className="px-5 pt-2 pb-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={searchMethod === 'ai'
                ? { background: `${C.secondary}15`, color: C.secondary, border: `1px solid ${C.secondary}30` }
                : { background: `${C.foreground}08`, color: C.muted }
              }>
              {searchMethod === 'ai' ? <><Sparkles size={8} /> AI Results</> : '🔍 Keyword Results'}
            </span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <ul className="max-h-[55vh] overflow-y-auto py-2">
            {results.map((link, i) => (
              <li key={link.id}>
                <a
                  href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 transition-all"
                  style={{
                    background: i === selectedIdx ? `${C.accent}10` : 'transparent',
                    borderLeft: i === selectedIdx ? `3px solid ${C.accent}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}15`; setSelectedIdx(i); }}
                  onMouseLeave={e => { e.currentTarget.style.background = i === selectedIdx ? `${C.accent}10` : 'transparent'; }}
                  onClick={onClose}
                >
                  {link.favicon_url && <img src={link.favicon_url} className="w-5 h-5 rounded flex-shrink-0" alt="" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: C.foreground }}>{link.title || link.url}</p>
                    <p className="text-xs truncate" style={{ color: C.muted }}>{link.domain}</p>
                  </div>
                  {link.link_tags?.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                      {link.link_tags.slice(0, 2).map((lt, j) => (
                        <span key={j} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${lt.tags?.color_hex || C.accent}15`, color: lt.tags?.color_hex || C.accent }}>
                          {lt.tags?.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <ExternalLink size={14} className="flex-shrink-0" style={{ color: C.muted }} />
                </a>
              </li>
            ))}
          </ul>
        ) : query && !isSearching ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: C.muted }}>No results for "{query}"</p>
            {searchMode === 'keyword' && (
              <button onClick={() => { setSearchMode('ai'); handleAiSearch(); }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all"
                style={{ background: C.secondary, border: `1.5px solid ${C.foreground}`, boxShadow: `2px 2px 0px 0px ${C.foreground}` }}>
                <Sparkles size={12} /> Try AI Search
              </button>
            )}
          </div>
        ) : !query ? (
          <div className="py-6 px-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.muted }}>Quick Navigation</p>
            {[
              { label: 'All Links', path: '/links' },
              { label: 'Collections', path: '/collections' },
              { label: 'Teams', path: '/teams' },
              { label: 'Analytics', path: '/analytics' },
              { label: 'Settings', path: '/settings' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose(); }}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: C.foreground }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}20`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {item.label}
                <ArrowRight size={14} style={{ color: C.muted }} />
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-4 px-5 py-3 text-xs" style={{ borderTop: `2px solid ${C.foreground}08`, color: C.muted }}>
          <span>↑↓ Navigate</span>
          <span>↵ {searchMode === 'ai' ? 'AI Search' : 'Open'}</span>
          <span>Esc Close</span>
          <span className="ml-auto flex items-center gap-1"><Sparkles size={10} /> AI powered</span>
        </div>
      </div>
    </div>
  );
}
