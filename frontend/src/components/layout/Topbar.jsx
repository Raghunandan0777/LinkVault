import { useState, useEffect } from 'react';
import { Search, Plus, Bell, Command, Menu } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import AddLinkModal from '../links/AddLinkModal';
import SearchModal from '../links/SearchModal';

const C = {
  accent: '#8B5CF6', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 3, y = 3) => `${x}px ${y}px 0px 0px ${c}`;

export default function Topbar({ setMobileMenuOpen }) {
  const { user } = useUser();
  const [showAdd, setShowAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 md:left-[240px] right-0 h-[68px] flex items-center px-4 md:px-6 gap-3 md:gap-4 z-20"
        style={{
          background: `${C.cream}E6`,
          backdropFilter: 'blur(12px)',
          borderBottom: `2px solid ${C.foreground}08`,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
      >
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg transition-all"
          style={{ color: C.muted, border: `2px solid ${C.foreground}15` }}
        >
          <Menu size={20} />
        </button>

        {/* Search trigger */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 md:gap-3 flex-1 max-w-[200px] md:max-w-md px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm transition-all"
          style={{
            background: `${C.cream}`,
            border: `2px solid ${C.foreground}15`,
            color: C.muted,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.accent}50`; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.accent}15`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}15`; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Search size={16} />
          <span>Search links...</span>
          <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: `${C.muted}60` }}>
            <Command size={12} />K
          </span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            style={{ color: C.muted, border: `2px solid ${C.foreground}10` }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.accent}10`; e.currentTarget.style.color = C.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
          >
            <Bell size={17} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-white text-sm font-bold transition-all duration-200"
            style={{
              background: C.accent,
              border: `2px solid ${C.foreground}`,
              boxShadow: hardShadow(),
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 5, 5); e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(); e.currentTarget.style.transform = 'translate(0,0)'; }}
            onMouseDown={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 1, 1); e.currentTarget.style.transform = 'translate(2px, 2px)'; }}
            onMouseUp={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 5, 5); e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden md:block">Add Link</span>
          </button>
          <img
            src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            className="w-9 h-9 rounded-full object-cover cursor-pointer"
            style={{ border: `2px solid ${C.foreground}` }}
            alt="avatar"
          />
        </div>
      </header>

      {showAdd && <AddLinkModal onClose={() => setShowAdd(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
