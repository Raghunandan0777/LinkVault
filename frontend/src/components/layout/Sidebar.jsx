import { NavLink, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Link2, FolderOpen, Globe, BarChart3, Settings, LogOut, Zap, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 3, y = 3) => `${x}px ${y}px 0px 0px ${c}`;

const navItems = [
  { to: '/links', icon: Link2, label: 'All Links', color: C.accent },
  { to: '/collections', icon: FolderOpen, label: 'Collections', color: C.secondary },
  { to: '/public-page', icon: Globe, label: 'Public Page', color: C.quaternary },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', color: C.tertiary },
  { to: '/teams', icon: Users, label: 'Teams', color: '#0EA5E9' },
  { to: '/settings', icon: Settings, label: 'Settings', color: C.muted },
];

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { plan } = useApp();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[240px] flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: C.cream,
          borderRight: `2px solid ${C.foreground}12`,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: `2px solid ${C.foreground}08` }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
            >
              <Link2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>
              LinkVault
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, color }) => (
            <NavLink
              key={to}
              to={to}
              className="block"
            >
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={isActive ? {
                    background: color,
                    color: color === C.tertiary ? C.foreground : '#fff',
                    border: `2px solid ${C.foreground}`,
                    boxShadow: hardShadow(C.foreground, 2, 2),
                  } : {
                    color: C.muted,
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = `${C.tertiary}30`;
                      e.currentTarget.style.color = C.foreground;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = C.muted;
                    }
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Upgrade */}
        <div className="p-3 space-y-3" style={{ borderTop: `2px solid ${C.foreground}08` }}>
          {plan === 'free' && (
            <div
              className="rounded-xl p-3.5"
              style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-white" strokeWidth={2.5} />
                <span className="text-xs font-bold text-white" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>Upgrade to Pro</span>
              </div>
              <p className="text-xs mb-2.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Unlimited links & AI tagging</p>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-xs font-bold py-2 rounded-lg transition-all duration-200"
                style={{
                  background: '#fff',
                  color: C.accent,
                  border: `2px solid ${C.foreground}`,
                  boxShadow: hardShadow(C.foreground, 2, 2),
                }}
                onMouseEnter={e => { e.target.style.transform = 'translate(-1px,-1px)'; e.target.style.boxShadow = hardShadow(C.foreground, 3, 3); }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = hardShadow(C.foreground, 2, 2); }}
              >
                ₹299/month
              </button>
            </div>
          )}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <img
              src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              className="w-9 h-9 rounded-full object-cover"
              style={{ border: `2px solid ${C.foreground}` }}
              alt="avatar"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: C.foreground }}>{user?.fullName || 'User'}</p>
              <p className="text-xs truncate" style={{ color: C.muted }}>@{user?.username || user?.id?.slice(0, 8)}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: C.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.secondary}15`; e.currentTarget.style.color = C.secondary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
