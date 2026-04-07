import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { User, Palette, ArrowUpDown, CreditCard, Save, Loader2, Upload, Download, CheckCircle, Zap, Crown, Users } from 'lucide-react';
import { getProfile, updateProfile, createOrder, verifyPayment, getPaymentStatus } from '../lib/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'import', label: 'Import/Export', icon: ArrowUpDown },
  { id: 'account', label: 'Account', icon: CreditCard },
];

const PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    period: '/month',
    icon: Zap,
    color: 'brand',
    features: ['Unlimited links', 'Unlimited collections', 'AI auto-tagging', 'Browser extension', '90-day analytics', 'Email support'],
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '₹999',
    period: '/month',
    icon: Users,
    color: 'purple',
    features: ['Everything in Pro', 'Up to 10 team members', 'Custom domain', '1-year analytics', 'Shared workspaces', 'Priority chat support'],
  },
];

function ProfileTab({ profile, onUpdate }) {
  const { user } = useUser();
  const [form, setForm] = useState({
    username: '', display_name: '', bio: '', website_url: '',
    twitter_handle: '', github_handle: '', linkedin_handle: '', instagram_handle: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      username: profile.username || '',
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      website_url: profile.website_url || '',
      twitter_handle: profile.twitter_handle || '',
      github_handle: profile.github_handle || '',
      linkedin_handle: profile.linkedin_handle || '',
      instagram_handle: profile.instagram_handle || '',
    });
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      onUpdate(updated);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Public Profile section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display font-bold text-base text-gray-900 mb-1">Public Profile</h3>
          <p className="text-sm text-gray-500">This information will be displayed on your public page.</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100"
              alt="avatar"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Profile Picture</p>
              <p className="text-xs text-gray-400 mb-2">Managed via your Clerk account settings.</p>
              <div className="flex gap-2">
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100 transition-colors">Change</button>
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-red-500 font-semibold hover:bg-red-50 transition-colors">Remove</button>
              </div>
            </div>
          </div>
          {/* Username + Display name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Username</label>
              <input value={form.username} onChange={set('username')} placeholder="yourusername" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Display Name</label>
              <input value={form.display_name} onChange={set('display_name')} placeholder="Your Name" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
            </div>
          </div>
          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bio</label>
            <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Product Designer & Digital Archivist. Collecting inspiration one link at a time." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all resize-none" />
          </div>
          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Website URL</label>
            <input value={form.website_url} onChange={set('website_url')} placeholder="https://yourwebsite.com" type="url" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display font-bold text-base text-gray-900 mb-1">Social Links</h3>
          <p className="text-sm text-gray-500">Connect your external profiles.</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'twitter_handle', label: 'Twitter / X', placeholder: '@username' },
              { key: 'github_handle', label: 'GitHub', placeholder: 'github.com/...' },
              { key: 'linkedin_handle', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
              { key: 'instagram_handle', label: 'Instagram', placeholder: '@handle' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
                <input value={form[key]} onChange={set(key)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <button type="button" className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition-all">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

function ImportExportTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div>
        <h3 className="font-display font-bold text-base text-gray-900 mb-1">Data Management</h3>
        <p className="text-sm text-gray-500">Import your bookmarks or export your vault.</p>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Import */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
            <Upload size={18} className="text-rose-500" />
          </div>
          <h3 className="font-display font-bold text-base text-gray-900 mb-2">Import Bookmarks</h3>
          <p className="text-sm text-gray-500 mb-4">Migrate your existing bookmarks from Chrome, Firefox, or Safari by uploading an HTML export file.</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
            <Upload size={20} className="text-gray-300 mb-2" />
            <span className="text-sm text-gray-500">Choose .html file</span>
            <input type="file" accept=".html" className="hidden" onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              toast.success('Import started — links will appear shortly.');
            }} />
          </label>
        </div>

        {/* Export */}
        <div className="bg-brand-600 rounded-2xl p-6 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
            <Download size={18} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-base mb-2">Export Vault</h3>
          <p className="text-sm text-brand-200 mb-4">Take your data with you. Download your entire collection in professional formats.</p>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-semibold transition-all">
              Export as JSON <span className="text-brand-200">›</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-semibold transition-all">
              Export as CSV <span className="text-brand-200">›</span>
            </button>
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
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.order_id,
        prefill: orderData.prefill,
        theme: { color: '#5353E8' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });
            toast.success(`🎉 Welcome to LinkVault ${planId === 'pro' ? 'Pro' : 'Teams'}!`);
            window.location.reload();
          } catch {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: { ondismiss: () => setProcessingPlan(null) },
      };

      if (typeof window.Razorpay === 'undefined') {
        // Load Razorpay script
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = resolve;
          document.head.appendChild(s);
        });
      }
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err?.error || 'Failed to initiate payment');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current plan banner */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 ${currentPlan === 'free' ? 'bg-gray-50 border border-gray-200' : 'bg-brand-600 text-white'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentPlan === 'free' ? 'bg-gray-200' : 'bg-white/20'}`}>
          {currentPlan === 'free' ? <Zap size={22} className="text-gray-500" /> : <Crown size={22} className="text-white" />}
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${currentPlan === 'free' ? 'text-gray-400' : 'text-brand-200'}`}>Current Plan</p>
          <p className={`font-display font-bold text-xl ${currentPlan === 'free' ? 'text-gray-800' : 'text-white'}`}>
            {currentPlan === 'free' ? 'Free Plan' : currentPlan === 'pro' ? 'LinkVault Pro' : 'LinkVault Teams'}
          </p>
        </div>
        {currentPlan !== 'free' && (
          <div className="ml-auto flex items-center gap-2 text-brand-100">
            <CheckCircle size={18} /> <span className="text-sm font-semibold">Active</span>
          </div>
        )}
      </div>

      {/* Plan cards */}
      {currentPlan === 'free' && (
        <div>
          <h3 className="font-display font-bold text-lg text-gray-900 mb-4">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLANS.map(plan => (
              <div key={plan.id} className={`rounded-2xl border-2 p-6 ${plan.id === 'pro' ? 'border-brand-400 bg-brand-50' : 'border-purple-200 bg-purple-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${plan.id === 'pro' ? 'bg-brand-600' : 'bg-purple-600'}`}>
                  <plan.icon size={18} className="text-white" />
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-bold text-3xl text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500 mb-1">{plan.period}</span>
                </div>
                <p className={`font-bold text-lg mb-4 ${plan.id === 'pro' ? 'text-brand-700' : 'text-purple-700'}`}>{plan.name}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className={plan.id === 'pro' ? 'text-brand-500' : 'text-purple-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={processingPlan === plan.id}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${plan.id === 'pro' ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                >
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
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences, profile details, and data vault.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'profile' && <ProfileTab profile={profile} onUpdate={setProfile} />}
        {tab === 'import' && <ImportExportTab />}
        {tab === 'account' && <AccountTab currentPlan={plan} />}
        {tab === 'appearance' && (
          <div className="text-center py-20 text-gray-400">
            <Palette size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Appearance customization coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
