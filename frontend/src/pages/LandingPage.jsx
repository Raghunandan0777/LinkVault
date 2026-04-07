import { Link } from 'react-router-dom';
import { Link2, Sparkles, Globe, Users, BarChart3, ArrowRight, CheckCircle, Zap, Shield, Clock } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Save Instantly', desc: 'Paste any URL and we auto-fetch the title, thumbnail, and description in seconds.', color: 'bg-brand-100 text-brand-600' },
  { icon: Sparkles, title: 'AI Smart Tags', desc: 'AI automatically classifies every link with relevant semantic tags. Never lose a link again.', color: 'bg-pink-100 text-pink-600', highlight: true },
  { icon: Globe, title: 'Public Profile', desc: 'Curate your best links and share them with the world on a beautiful, shareable page.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Link2, title: 'Collections', desc: 'Deeply nested organization for power-users. Folder-in-folder structure, drag to reorder.', color: 'bg-amber-100 text-amber-600' },
  { icon: Users, title: 'Teams', desc: 'Collaborative vaults for your entire organisation. Share collections, assign roles.', color: 'bg-violet-100 text-violet-600', highlight: true },
  { icon: BarChart3, title: 'Analytics', desc: 'See which of your shared links get the most clicks. Track engagement over time.', color: 'bg-sky-100 text-sky-600' },
];

const steps = [
  { num: '01', title: 'Paste', desc: 'Drop any link or use our browser extension to save content in a click.' },
  { num: '02', title: 'AI Organizes', desc: 'LinkVault analyses the content and applies relevant tags and descriptions automatically.' },
  { num: '03', title: 'Access Anywhere', desc: 'Find your links instantly via powerful search on mobile, web, or desktop.' },
];

const testimonials = [
  { text: '"LinkVault has completely changed how I research for my projects. The AI tagging is scarily accurate."', name: 'Alex Rivera', role: 'Product Designer @Uber' },
  { text: '"Finally, a bookmark manager that doesn\'t feel like a cluttered spreadsheet. It\'s beautiful and functional."', name: 'Sarah Johnson', role: 'Talent Strategist' },
  { text: '"The team workspace has streamlined our resource sharing. No more digging through Slack for links."', name: 'James Chen', role: 'CTO @Startups' },
];

const logoNames = ['Figma', 'Notion', 'GitHub', 'Vercel', 'YouTube', 'Twitter/X', 'Medium', 'LinkedIn', 'Reddit', 'Instagram', 'Linear', 'Supabase'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Link2 size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900">LinkVault</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            {['Product', 'Features', 'Pricing', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-gray-900 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/links" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link to="/links" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold mb-6">
            <Sparkles size={12} /> Introducing AI Smart Tags — <span className="font-normal">Now live</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl text-gray-900 leading-[0.95] mb-6">
            Save every link.<br />
            <span style={{ background: 'linear-gradient(135deg, #5353E8 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Find it instantly.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            LinkVault is the intelligent archive for your digital world. Capture, categorize, and search your bookmarks with the power of AI.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/links" className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              View Demo
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">Join 13,500+ creators and developers</p>

          {/* Demo visual */}
          <div className="mt-14 bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-gray-200 p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                {['bg-red-400','bg-yellow-400','bg-green-400'].map(c => <div key={c} className={`w-3 h-3 rounded-full ${c}`} />)}
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg h-6 flex items-center px-3">
                <span className="text-xs text-gray-400">linkvault.io/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Design Resources','AI Tools','Dev Links'].map((title, i) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-3 text-left">
                  <div className="w-8 h-8 rounded-xl mb-2" style={{ background: ['#5353E820','#EC489920','#10B98120'][i] }} />
                  <p className="text-xs font-bold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{[24,18,36][i]} links</p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-brand-600 rounded-2xl p-3 flex items-center gap-2">
              <Sparkles size={14} className="text-white" />
              <span className="text-xs text-white font-semibold">AI just tagged 5 new links automatically</span>
              <span className="ml-auto text-brand-200 text-xs">1.2s avg</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="py-10 border-y border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto pb-1 scrollbar-hide">
            {logoNames.map(name => (
              <span key={name} className="flex-shrink-0 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-black text-4xl text-gray-900 mb-3">Master Your Digital Library</h2>
            <p className="text-gray-500">Powerful features designed to help you spend less time searching and more time doing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, highlight }) => (
              <div key={title} className={`rounded-2xl p-6 ${highlight ? 'bg-brand-600 text-white' : 'bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${highlight ? 'bg-white/20' : color}`}>
                  <Icon size={18} className={highlight ? 'text-white' : ''} />
                </div>
                <h3 className={`font-display font-bold text-lg mb-2 ${highlight ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${highlight ? 'text-brand-200' : 'text-gray-500'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Workflow</p>
            <h2 className="font-display font-black text-4xl text-gray-900">Three Steps to Organization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-black text-white text-lg">{num}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ text, name, role }) => (
            <div key={name} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{text}</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-200" />
                <div>
                  <p className="text-xs font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-4xl text-gray-900 mb-3">Simple, Honest Pricing</h2>
            <p className="text-gray-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '₹0', features: ['200 links', '5 collections', '1 public collection', 'Basic search'], cta: 'Get Started', highlight: false },
              { name: 'Pro', price: '₹299', sub: '/month', features: ['Unlimited links', 'Unlimited collections', 'AI auto-tagging', 'Browser extension', 'Analytics', 'Email support'], cta: 'Upgrade to Pro', highlight: true },
              { name: 'Teams', price: '₹999', sub: '/month', features: ['Everything in Pro', 'Up to 10 members', 'Custom domain', '1-year analytics', 'Priority support'], cta: 'Get Teams', highlight: false },
            ].map(({ name, price, sub, features, cta, highlight }) => (
              <div key={name} className={`rounded-2xl p-6 ${highlight ? 'bg-brand-600 text-white ring-2 ring-brand-400 ring-offset-2' : 'bg-white border border-gray-200'}`}>
                <h3 className={`font-display font-bold text-lg mb-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                <div className="flex items-end gap-1 mb-5">
                  <span className={`font-display font-black text-3xl ${highlight ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                  {sub && <span className={`text-sm mb-1 ${highlight ? 'text-brand-200' : 'text-gray-400'}`}>{sub}</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className={highlight ? 'text-brand-200' : 'text-emerald-500'} />
                      <span className={highlight ? 'text-brand-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/links" className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${highlight ? 'bg-white text-brand-600 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Link2 size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-gray-900">LinkVault</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">The intelligent archive tool for modern creators and developers.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Download', 'Integrations'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            { title: 'Community', links: ['Twitter/X', 'Discord', 'Blog', 'Changelog'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">{title}</p>
              <ul className="space-y-2">
                {links.map(l => <li key={l}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © 2025 LinkVault. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
