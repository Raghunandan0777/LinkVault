import { NavLink, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Link2, FolderOpen, Globe, BarChart3, Settings, LogOut, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/links', icon: Link2, label: 'All Links' },
  { to: '/collections', icon: FolderOpen, label: 'Collections' },
  { to: '/public-page', icon: Globe, label: 'Public Page' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { plan } = useApp();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Link2 size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-gray-900 tracking-tight">LinkVault</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Upgrade */}
      <div className="p-3 space-y-2 border-t border-gray-100">
        {plan === 'free' && (
          <div className="bg-brand-600 rounded-xl p-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} />
              <span className="text-xs font-bold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-brand-200 mb-2">Unlimited links & AI tagging</p>
            <button
              onClick={() => navigate('/settings')}
              className="w-full bg-white text-brand-600 text-xs font-bold py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
            >
              ₹299/month
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 px-2 py-2">
          <img
            src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
            alt="avatar"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">@{user?.username || user?.id?.slice(0,8)}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
