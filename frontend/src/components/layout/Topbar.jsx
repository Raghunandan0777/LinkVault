import { useState, useEffect } from 'react';
import { Search, Plus, Bell, Command } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import AddLinkModal from '../links/AddLinkModal';
import SearchModal from '../links/SearchModal';

export default function Topbar() {
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
      <header className="fixed top-0 left-[220px] right-0 h-[64px] bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-6 gap-4 z-20">
        {/* Search trigger */}
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-3 flex-1 max-w-md px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-400 hover:border-brand-300 transition-all"
        >
          <Search size={16} />
          <span>Search links...</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-300">
            <Command size={12} />K
          </span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <Bell size={18} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200"
          >
            <Plus size={16} />
            Add Link
          </button>
          <img
            src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 cursor-pointer"
            alt="avatar"
          />
        </div>
      </header>

      {showAdd && <AddLinkModal onClose={() => setShowAdd(false)} />}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
