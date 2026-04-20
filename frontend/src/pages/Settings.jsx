import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { User, Palette, ArrowUpDown, CreditCard, Save, Loader2, Upload, Download, CheckCircle, Zap, Crown, Users } from 'lucide-react';
import { getProfile, updateProfile, createOrder, verifyPayment, getPaymentStatus, importBookmarks } from '../lib/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'import', label: 'Import/Export', icon: ArrowUpDown },
  { id: 'account', label: 'Account', icon: CreditCard },
];

const PLANS = [
  { id: 'pro', name: 'Pro', price: '₹299', period: '/month', icon: Zap, color: C.accent,
    features: ['Unlimited links', 'Unlimited collections', 'AI auto-tagging', 'Browser extension', '90-day analytics', 'Email support'] },
  { id: 'teams', name: 'Teams', price: '₹999', period: '/month', icon: Users, color: C.secondary,
    features: ['Everything in Pro', 'Up to 10 team members', 'Custom domain', '1-year analytics', 'Shared workspaces', 'Priority chat support'] },
];

const inputStyle = {
  border: `2px solid ${C.foreground}15`, borderRadius: 12, fontSize: 14, outline: 'none',
  width: '100%', padding: '10px 14px', background: '#fff',
  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', transition: 'all 0.2s',
};

function ProfileTab({ profile, onUpdate }) {
  const { user } = useUser();
  const [form, setForm] = useState({
    username: '', display_name: '', bio: '', website_url: '',
    twitter_handle: '', github_handle: '', linkedin_handle: '', instagram_handle: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      username: profile.username || '', display_name: profile.display_name || '',
      bio: profile.bio || '', website_url: profile.website_url || '',
      twitter_handle: profile.twitter_handle || '', github_handle: profile.github_handle || '',
      linkedin_handle: profile.linkedin_handle || '', instagram_handle: profile.instagram_handle || '',
    });
  }, [profile]);

  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const updated = await updateProfile(form); onUpdate(updated); toast.success('Profile saved!'); navigate('/links'); }
    catch (err) { toast.error(err?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h3 className="font-extrabold text-base mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Public Profile</h3>
          <p className="text-sm" style={{ color: C.muted }}>This information will be displayed on your public page.</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 space-y-5"
          style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}10` }}>
          <div className="flex items-center gap-4">
            <img src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              className="w-16 h-16 rounded-2xl object-cover" style={{ border: `2px solid ${C.foreground}` }} alt="avatar" />
            <div>
              <p className="text-sm font-bold mb-0.5" style={{ color: C.foreground }}>Profile Picture</p>
              <p className="text-xs mb-2" style={{ color: C.muted }}>Managed via your Clerk account settings.</p>
              <div className="flex gap-2">
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                  style={{ background: `${C.accent}12`, color: C.accent, border: `1.5px solid ${C.accent}30` }}>Change</button>
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                  style={{ background: `${C.secondary}10`, color: C.secondary, border: `1.5px solid ${C.secondary}30` }}>Remove</button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['username', 'Username', 'yourusername'], ['display_name', 'Display Name', 'Your Name']].map(([k, l, p]) => (
              <div key={k}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>{l}</label>
                <input value={form[k]} onChange={set(k)} placeholder={p} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.accent; }} onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Bio</label>
            <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Product Designer & Digital Archivist."
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => { e.target.style.borderColor = C.accent; }} onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Website URL</label>
            <input value={form.website_url} onChange={set('website_url')} placeholder="https://yourwebsite.com" type="url" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = C.accent; }} onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h3 className="font-extrabold text-base mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Social Links</h3>
          <p className="text-sm" style={{ color: C.muted }}>Connect your external profiles.</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl p-6"
          style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}10` }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'twitter_handle', label: 'Twitter / X', placeholder: '@username' },
              { key: 'github_handle', label: 'GitHub', placeholder: 'github.com/...' },
              { key: 'linkedin_handle', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
              { key: 'instagram_handle', label: 'Instagram', placeholder: '@handle' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.muted }}>{label}</label>
                <input value={form[key]} onChange={set(key)} placeholder={placeholder} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.accent; }} onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="px-5 py-2.5 rounded-full text-sm font-semibold"
          style={{ border: `2px solid ${C.foreground}15`, color: C.foreground }}>Cancel</button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold disabled:opacity-60 transition-all"
          style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 3, 3) }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 5, 5); e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 3, 3); e.currentTarget.style.transform = 'none'; }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
        </button>
      </div>
    </form>
  );
}

function ImportExportTab() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [exporting, setExporting] = useState(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const html = await file.text();
      const result = await importBookmarks(html);
      setImportResult(result);
      toast.success(`Imported ${result.imported} bookmarks! (${result.skipped} skipped)`);
    } catch (err) {
      toast.error(err?.error || 'Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${API_URL}/links/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkvault-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}!`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div>
        <h3 className="font-extrabold text-base mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Data Management</h3>
        <p className="text-sm" style={{ color: C.muted }}>Import your bookmarks or export your vault.</p>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6" style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.secondary}40` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.secondary}15`, border: `2px solid ${C.secondary}30` }}>
            <Upload size={18} style={{ color: C.secondary }} />
          </div>
          <h3 className="font-extrabold text-base mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Import Bookmarks</h3>
          <p className="text-sm mb-4" style={{ color: C.muted }}>Migrate your existing bookmarks from Chrome, Firefox, or Safari.</p>
          <label className={`flex flex-col items-center justify-center py-6 cursor-pointer rounded-xl transition-all ${importing ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ border: `3px dashed ${C.foreground}15` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = `${C.accent}06`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}15`; e.currentTarget.style.background = 'transparent'; }}>
            {importing ? <Loader2 size={20} className="animate-spin mb-2" style={{ color: C.accent }} /> : <Upload size={20} style={{ color: C.muted }} className="mb-2" />}
            <span className="text-sm" style={{ color: C.muted }}>{importing ? 'Importing...' : 'Choose .html file'}</span>
            <input type="file" accept=".html" className="hidden" onChange={handleImport} />
          </label>
          {importResult && (
            <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: `${C.quaternary}10`, border: `1.5px solid ${C.quaternary}30`, color: C.foreground }}>
              ✅ <b>{importResult.imported}</b> imported · <b>{importResult.skipped}</b> skipped (duplicates)
            </div>
          )}
        </div>

        <div className="rounded-2xl p-6 text-white" style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Download size={18} className="text-white" />
          </div>
          <h3 className="font-extrabold text-base mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>Export Vault</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>Take your data with you. Download in professional formats.</p>
          <div className="space-y-2">
            {[{ label: 'Export as JSON', format: 'json' }, { label: 'Export as CSV', format: 'csv' }].map(({ label, format }) => (
              <button key={format} onClick={() => handleExport(format)} disabled={exporting === format}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}>
                {exporting === format ? <><Loader2 size={14} className="animate-spin" /> Exporting...</> : <>{label} <span style={{ opacity: 0.5 }}>›</span></>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ currentPlan }) {
  const [processingPlan, setProcessingPlan] = useState(null);

  const handleUpgrade = async (planId) => {
    setProcessingPlan(planId);
    try {
      const orderData = await createOrder(planId);
      const options = {
        key: orderData.key, amount: orderData.amount, currency: orderData.currency,
        name: orderData.name, description: orderData.description, order_id: orderData.order_id,
        prefill: orderData.prefill, theme: { color: C.accent },
        handler: async (response) => {
          try {
            await verifyPayment({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, plan: planId });
            toast.success(`🎉 Welcome to LinkVault ${planId === 'pro' ? 'Pro' : 'Teams'}!`);
            window.location.reload();
          } catch { toast.error('Payment verification failed.'); }
        },
        modal: { ondismiss: () => setProcessingPlan(null) },
      };
      if (typeof window.Razorpay === 'undefined') {
        await new Promise((resolve) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = resolve; document.head.appendChild(s); });
      }
      new window.Razorpay(options).open();
    } catch (err) { toast.error(err?.error || 'Failed to initiate payment'); }
    finally { setProcessingPlan(null); }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={currentPlan === 'free'
          ? { background: '#fff', border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}10` }
          : { background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${C.foreground}` }
        }>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={currentPlan === 'free' ? { background: `${C.foreground}10`, border: `2px solid ${C.foreground}15` } : { background: 'rgba(255,255,255,0.2)' }}>
          {currentPlan === 'free' ? <Zap size={22} style={{ color: C.muted }} /> : <Crown size={22} className="text-white" />}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: currentPlan === 'free' ? C.muted : 'rgba(255,255,255,0.6)' }}>Current Plan</p>
          <p className="font-extrabold text-xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: currentPlan === 'free' ? C.foreground : '#fff' }}>
            {currentPlan === 'free' ? 'Free Plan' : currentPlan === 'pro' ? 'LinkVault Pro' : 'LinkVault Teams'}
          </p>
        </div>
        {currentPlan !== 'free' && (
          <div className="ml-auto flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <CheckCircle size={18} /> <span className="text-sm font-bold">Active</span>
          </div>
        )}
      </div>

      {currentPlan === 'free' && (
        <div>
          <h3 className="font-extrabold text-lg mb-4" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLANS.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl p-6"
                style={{ border: `2px solid ${C.foreground}`, boxShadow: `5px 5px 0px 0px ${plan.color}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: plan.color, border: `2px solid ${C.foreground}` }}>
                  <plan.icon size={18} className="text-white" />
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-extrabold text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{plan.price}</span>
                  <span className="text-sm mb-1" style={{ color: C.muted }}>{plan.period}</span>
                </div>
                <p className="font-bold text-lg mb-4" style={{ color: plan.color }}>{plan.name}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: C.foreground }}>
                      <CheckCircle size={14} style={{ color: plan.color }} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleUpgrade(plan.id)} disabled={processingPlan === plan.id}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-white text-sm font-bold transition-all"
                  style={{ background: plan.color, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 3, 3) }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 5, 5); e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 3, 3); e.currentTarget.style.transform = 'none'; }}>
                  {processingPlan === plan.id ? <Loader2 size={15} className="animate-spin" /> : <plan.icon size={15} />}
                  Upgrade to {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const { plan, setPlan } = useApp();

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
    getPaymentStatus().then(d => { if (d?.plan) setPlan(d.plan); }).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl sm:text-3xl" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Manage your account preferences, profile details, and data vault.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap"
            style={tab === id
              ? { background: C.accent, color: '#fff', border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }
              : { color: C.muted, border: `2px solid transparent` }
            }
            onMouseEnter={e => { if (tab !== id) { e.currentTarget.style.background = `${C.tertiary}15`; e.currentTarget.style.color = C.foreground; } }}
            onMouseLeave={e => { if (tab !== id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; } }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === 'profile' && <ProfileTab profile={profile} onUpdate={setProfile} />}
        {tab === 'import' && <ImportExportTab />}
        {tab === 'account' && <AccountTab currentPlan={plan} />}
        {tab === 'appearance' && (
          <div className="text-center py-20" style={{ color: C.muted }}>
            <Palette size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Appearance customization coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
