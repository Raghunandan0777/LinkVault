import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Link2, Sparkles, Globe, Users, BarChart3, ArrowRight,
  CheckCircle, Zap, Shield, Menu, X, Star, Bookmark, Search
} from 'lucide-react';
import FloatingShapes from '../components/FloatingShapes';

/* ─── Design Tokens (inline for reliability) ─── */
const C = {
  accent: '#8B5CF6',
  secondary: '#F472B6',
  tertiary: '#FBBF24',
  quaternary: '#34D399',
  foreground: '#1E293B',
  cream: '#FFFDF5',
  muted: '#64748B',
  mutedBg: '#F1F5F9',
};

/* ─── Data ─── */
const features = [
  { icon: Zap, title: 'Save Instantly', desc: 'Paste any URL and we auto-fetch the title, thumbnail, and description in seconds.', accentColor: C.accent, shadowColor: C.accent },
  { icon: Sparkles, title: 'AI Smart Tags', desc: 'AI automatically classifies every link with relevant semantic tags. Never lose a link again.', accentColor: C.secondary, shadowColor: C.secondary },
  { icon: Globe, title: 'Public Profile', desc: 'Curate your best links and share them with the world on a beautiful, shareable page.', accentColor: C.tertiary, shadowColor: C.tertiary },
  { icon: Link2, title: 'Collections', desc: 'Deeply nested organization for power-users. Folder-in-folder structure, drag to reorder.', accentColor: C.quaternary, shadowColor: C.quaternary },
  { icon: Users, title: 'Teams', desc: 'Collaborative vaults for your entire organisation. Share collections, assign roles.', accentColor: C.accent, shadowColor: C.accent },
  { icon: BarChart3, title: 'Analytics', desc: 'See which of your shared links get the most clicks. Track engagement over time.', accentColor: C.secondary, shadowColor: C.secondary },
];

const steps = [
  { num: '01', title: 'Paste', desc: 'Drop any link or use our browser extension to save content in a click.', color: C.accent, shadowColor: C.accent },
  { num: '02', title: 'AI Organizes', desc: 'LinkVault analyses the content and applies relevant tags and descriptions automatically.', color: C.secondary, shadowColor: C.secondary },
  { num: '03', title: 'Access Anywhere', desc: 'Find your links instantly via powerful search on mobile, web, or desktop.', color: C.tertiary, shadowColor: C.tertiary, darkText: true },
];

const testimonials = [
  { text: '"LinkVault has completely changed how I research for my projects. The AI tagging is scarily accurate."', name: 'Alex Rivera', role: 'Product Designer @Uber', shadowColor: C.secondary, avatarBg: `${C.accent}30` },
  { text: '"Finally, a bookmark manager that doesn\'t feel like a cluttered spreadsheet. It\'s beautiful and functional."', name: 'Sarah Johnson', role: 'Talent Strategist', shadowColor: C.accent, avatarBg: `${C.secondary}30` },
  { text: '"The team workspace has streamlined our resource sharing. No more digging through Slack for links."', name: 'James Chen', role: 'CTO @Startups', shadowColor: C.tertiary, avatarBg: `${C.tertiary}30` },
];

const logoNames = ['Figma', 'Notion', 'GitHub', 'Vercel', 'YouTube', 'Twitter/X', 'Medium', 'LinkedIn', 'Reddit', 'Instagram', 'Linear', 'Supabase'];

/* ─── Squiggly underline SVG ─── */
const SquigglyUnderline = ({ color = '#FBBF24', width = 200 }) => (
  <svg viewBox="0 0 200 12" width={width} height="12" fill="none" className="block mx-auto mt-1">
    <path d="M2 8 C 20 2, 40 14, 60 8 C 80 2, 100 14, 120 8 C 140 2, 160 14, 180 8 C 190 5, 195 6, 198 7" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

/* ─── Spring configs ─── */
const popSpring = { type: 'spring', stiffness: 300, damping: 15 };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const popItem = {
  hidden: { opacity: 0, scale: 0, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: popSpring },
};

/* ─── Hard shadow helper ─── */
const hardShadow = (color = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${color}`;

/* ─── 3D Tilt Card Hook ─── */
function use3DTilt() {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  return { ref, rotateX, rotateY, handleMouseMove, handleMouseLeave };
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tilt = use3DTilt();
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: C.cream, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* ═══════════════════════ NAVBAR ═══════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-md z-50" style={{ background: `${C.cream}E6`, borderBottom: `2px solid ${C.foreground}10` }} id="navbar">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
            >
              <Link2 size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>LinkVault</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {['Product', 'Features', 'Pricing', 'About'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{ color: C.muted }}
                onMouseEnter={e => { e.target.style.background = C.tertiary; e.target.style.color = C.foreground; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.muted; }}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/links" className="text-sm font-semibold transition-colors" style={{ color: C.muted }}>
              Login
            </Link>
            <Link
              to="/links"
              id="nav-cta"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all duration-300"
              style={{
                background: C.accent,
                border: `2px solid ${C.foreground}`,
                boxShadow: hardShadow(),
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
              onMouseEnter={e => { e.target.style.boxShadow = hardShadow(C.foreground, 6, 6); e.target.style.transform = 'translate(-2px, -2px)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = hardShadow(); e.target.style.transform = 'translate(0, 0)'; }}
            >
              Get Started
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center ml-1">
                <ArrowRight size={12} style={{ color: C.accent }} strokeWidth={3} />
              </span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden px-6 py-4 space-y-2"
            style={{ background: C.cream, borderTop: `2px solid ${C.foreground}10` }}
          >
            {['Product', 'Features', 'Pricing', 'About'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-sm font-medium" style={{ color: C.foreground }} onClick={() => setMobileMenuOpen(false)}>{item}</a>
            ))}
            <Link
              to="/links"
              className="block py-2.5 mt-2 rounded-full text-white text-center text-sm font-bold"
              style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started Free
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-6" id="product">
        {/* Dot grid background */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <FloatingShapes variant="hero" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={popSpring}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8"
              style={{ background: `${C.accent}15`, border: `2px solid ${C.accent}30`, color: C.accent }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.accent }}>
                <Sparkles size={10} className="text-white" strokeWidth={3} />
              </span>
              Introducing AI Smart Tags — <span className="font-normal" style={{ color: C.muted }}>Now live</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...popSpring, delay: 0.1 }}
              className="font-extrabold text-4xl sm:text-5xl md:text-7xl leading-[0.95] mb-2"
              style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}
            >
              Save every link.
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...popSpring, delay: 0.2 }}
            >
              <h1 className="font-extrabold text-4xl sm:text-5xl md:text-7xl leading-[0.95] mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
                <span style={{ color: C.accent }}>Find it </span>
                <span className="relative inline-block" style={{ color: C.secondary }}>
                  instantly.
                  <span className="absolute -bottom-2 left-0 w-full">
                    <SquigglyUnderline color={C.tertiary} width={200} />
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...popSpring, delay: 0.3 }}
              className="text-base md:text-lg max-w-xl mx-auto mt-6 mb-8"
              style={{ color: C.muted }}
            >
              LinkVault is the intelligent archive for your digital world. Capture, categorize, and search your bookmarks with the power of AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...popSpring, delay: 0.4 }}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              <Link
                to="/links"
                id="hero-cta-primary"
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-bold text-sm transition-all duration-300"
                style={{
                  background: C.accent,
                  border: `2px solid ${C.foreground}`,
                  boxShadow: hardShadow(),
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 6, 6); e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(); e.currentTarget.style.transform = 'translate(0, 0)'; }}
                onMouseDown={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 2, 2); e.currentTarget.style.transform = 'translate(2px, 2px)'; }}
                onMouseUp={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 6, 6); e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
              >
                Get Started Free
                <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <ArrowRight size={14} style={{ color: C.accent }} strokeWidth={3} />
                </span>
              </Link>
              <button
                id="hero-cta-secondary"
                className="px-7 py-3.5 rounded-full text-sm font-bold transition-all duration-300"
                style={{
                  color: C.foreground,
                  border: `2px solid ${C.foreground}`,
                  background: 'transparent',
                }}
                onMouseEnter={e => { e.target.style.background = C.tertiary; e.target.style.boxShadow = hardShadow(); }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = 'none'; }}
              >
                View Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs mt-5 flex items-center justify-center gap-2"
              style={{ color: C.muted }}
            >
              <span className="flex -space-x-2">
                {[C.accent, C.secondary, C.tertiary, C.quaternary].map((c, i) => (
                  <span key={i} className="w-6 h-6 rounded-full" style={{ background: c, border: `2px solid ${C.cream}` }} />
                ))}
              </span>
              Join 13,500+ creators and developers
            </motion.p>
          </div>

          {/* 3D Demo Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...popSpring, delay: 0.5 }}
            style={{ y: heroParallax, perspective: 1200 }}
            className="mt-12 md:mt-16 max-w-2xl mx-auto"
          >
            <div
              ref={tilt.ref}
              onMouseMove={tilt.handleMouseMove}
              onMouseLeave={tilt.handleMouseLeave}
              className="bg-white rounded-2xl p-5 md:p-6 transition-all duration-300"
              style={{
                border: `2px solid ${C.foreground}`,
                boxShadow: `8px 8px 0px 0px #E2E8F0`,
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  {[C.secondary, C.tertiary, C.quaternary].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ background: c, border: `1px solid ${C.foreground}15` }} />
                  ))}
                </div>
                <div className="flex-1 rounded-full h-7 flex items-center px-3" style={{ background: C.mutedBg, border: `1px solid ${C.foreground}08` }}>
                  <Search size={10} className="mr-1.5" style={{ color: C.muted }} strokeWidth={2.5} />
                  <span className="text-xs font-medium" style={{ color: C.muted }}>linkvault.io/dashboard</span>
                </div>
              </div>

              {/* Card content */}
              <div className="grid grid-cols-3 gap-3">
                {['Design Resources', 'AI Tools', 'Dev Links'].map((title, i) => (
                  <div
                    key={title}
                    className="rounded-xl p-3 text-left transition-all duration-300"
                    style={{
                      background: [`${C.accent}08`, `${C.secondary}08`, `${C.quaternary}08`][i],
                      border: `2px solid ${C.foreground}08`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                      style={{ background: [`${C.accent}15`, `${C.secondary}15`, `${C.quaternary}15`][i] }}
                    >
                      {[
                        <Bookmark key="b" size={14} style={{ color: C.accent }} strokeWidth={2.5} />,
                        <Sparkles key="s" size={14} style={{ color: C.secondary }} strokeWidth={2.5} />,
                        <Link2 key="l" size={14} style={{ color: C.quaternary }} strokeWidth={2.5} />,
                      ][i]}
                    </div>
                    <p className="text-xs font-bold" style={{ color: C.foreground }}>{title}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{[24, 18, 36][i]} links</p>
                  </div>
                ))}
              </div>

              {/* AI notification bar */}
              <div
                className="mt-3 rounded-xl p-3 flex items-center gap-2"
                style={{ background: C.accent, border: `2px solid ${C.foreground}15` }}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Sparkles size={12} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-xs text-white font-semibold">AI just tagged 5 new links automatically</span>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>1.2s avg</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ LOGO MARQUEE ═══════════════════════ */}
      <section className="py-6 overflow-hidden" style={{ borderTop: `2px solid ${C.foreground}08`, borderBottom: `2px solid ${C.foreground}08`, background: `${C.mutedBg}80` }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...logoNames, ...logoNames].map((name, i) => (
            <span key={`${name}-${i}`} className="mx-8 text-sm font-bold uppercase tracking-wider flex-shrink-0" style={{ color: `${C.muted}60` }}>
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="relative py-20 md:py-28 px-6">
        <FloatingShapes variant="features" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={popSpring}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: `${C.tertiary}20`, color: C.tertiary, border: `1px solid ${C.tertiary}40` }}
            >
              Features
            </span>
            <h2
              className="font-extrabold text-3xl md:text-5xl mb-3"
              style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}
            >
              Master Your <span style={{ color: C.accent }}>Digital Library</span>
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: C.muted }}>
              Powerful features designed to help you spend less time searching and more time doing.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, accentColor, shadowColor }, index) => (
              <motion.div
                key={title}
                variants={popItem}
                whileHover={{ rotate: -1, scale: 1.02 }}
                className="relative bg-white rounded-2xl p-6 pt-10 cursor-default transition-all duration-300"
                style={{
                  border: `2px solid ${C.foreground}`,
                  boxShadow: `6px 6px 0px 0px ${shadowColor}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `8px 8px 0px 0px ${shadowColor}`; e.currentTarget.style.transform = 'translate(-2px, -2px) rotate(-1deg) scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = `6px 6px 0px 0px ${shadowColor}`; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Floating icon circle */}
                <div
                  className="absolute -top-5 left-6 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: accentColor, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}
                >
                  <Icon size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="py-20 md:py-28 px-6 relative overflow-hidden" id="workflow" style={{ background: `${C.mutedBg}80` }}>
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={popSpring}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}
            >
              Workflow
            </span>
            <h2
              className="font-extrabold text-3xl md:text-5xl"
              style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}
            >
              Three Steps to{' '}
              <span className="relative inline-block">
                Organization
                <span className="absolute -bottom-2 left-0 w-full">
                  <SquigglyUnderline color={C.accent} width={220} />
                </span>
              </span>
            </h2>
          </motion.div>

          {/* Dashed connector line (desktop) */}
          <div
            className="hidden md:block absolute top-[58%] left-[15%] right-[15%] h-0.5 -translate-y-1/2"
            style={{ borderTop: `2px dashed ${C.foreground}20` }}
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {steps.map(({ num, title, desc, color, shadowColor, darkText }) => (
              <motion.div key={num} variants={popItem} className="text-center relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 hover:rotate-6"
                  style={{
                    background: color,
                    border: `2px solid ${C.foreground}`,
                    boxShadow: `4px 4px 0px 0px ${shadowColor}`,
                  }}
                >
                  <span
                    className="font-extrabold text-xl"
                    style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: darkText ? C.foreground : '#fff' }}
                  >
                    {num}
                  </span>
                </div>
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{
                    border: `2px solid ${C.foreground}`,
                    borderBottomLeftRadius: 0,
                    boxShadow: `8px 8px 0px 0px #E2E8F0`,
                  }}
                >
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section className="py-20 md:py-28 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={popSpring}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: `${C.secondary}15`, color: C.secondary, border: `1px solid ${C.secondary}30` }}
            >
              Testimonials
            </span>
            <h2
              className="font-extrabold text-3xl md:text-5xl"
              style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}
            >
              Loved by <span style={{ color: C.secondary }}>Creators</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map(({ text, name, role, shadowColor, avatarBg }, i) => (
              <motion.div
                key={name}
                variants={popItem}
                whileHover={{ rotate: i % 2 === 0 ? -2 : 2, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 transition-all duration-300"
                style={{
                  border: `2px solid ${C.foreground}`,
                  boxShadow: `6px 6px 0px 0px ${shadowColor}`,
                }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} style={{ color: C.tertiary, fill: C.tertiary }} strokeWidth={2.5} />
                  ))}
                </div>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: `${C.foreground}CC` }}>{text}</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ border: `2px solid ${C.foreground}`, background: avatarBg }}
                  >
                    <span className="font-bold text-sm" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.foreground }}>{name}</p>
                    <p className="text-xs" style={{ color: C.muted }}>{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="py-20 md:py-28 px-6 relative overflow-hidden" style={{ background: `${C.mutedBg}80` }}>
        <FloatingShapes variant="features" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={popSpring}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ background: `${C.quaternary}15`, color: C.quaternary, border: `1px solid ${C.quaternary}30` }}
            >
              Pricing
            </span>
            <h2
              className="font-extrabold text-3xl md:text-5xl mb-3"
              style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}
            >
              Simple, <span style={{ color: C.quaternary }}>Honest</span> Pricing
            </h2>
            <p style={{ color: C.muted }}>Start free. Upgrade when you're ready.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
          >
            {[
              { name: 'Free', price: '₹0', features: ['200 links', '5 collections', '1 public collection', 'Basic search'], cta: 'Get Started', highlight: false },
              { name: 'Pro', price: '₹299', sub: '/month', features: ['Unlimited links', 'Unlimited collections', 'AI auto-tagging', 'Browser extension', 'Analytics', 'Email support'], cta: 'Upgrade to Pro', highlight: true },
              { name: 'Teams', price: '₹999', sub: '/month', features: ['Everything in Pro', 'Up to 10 members', 'Custom domain', '1-year analytics', 'Priority support'], cta: 'Get Teams', highlight: false },
            ].map(({ name, price, sub, features: feat, cta, highlight }) => (
              <motion.div
                key={name}
                variants={popItem}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-6 transition-all duration-300 ${highlight ? 'md:scale-105 md:-translate-y-2 z-10' : ''}`}
                style={{
                  background: highlight ? C.accent : '#fff',
                  border: `2px solid ${C.foreground}`,
                  boxShadow: highlight ? `6px 6px 0px 0px ${C.accent}` : `8px 8px 0px 0px #E2E8F0`,
                }}
              >
                {/* Most Popular badge */}
                {highlight && (
                  <div
                    className="absolute -top-4 -right-3 text-xs font-extrabold px-3 py-1.5 rounded-full"
                    style={{
                      background: C.tertiary,
                      color: C.foreground,
                      border: `2px solid ${C.foreground}`,
                      boxShadow: hardShadow(C.foreground, 2, 2),
                      transform: 'rotate(12deg)',
                      fontFamily: '"Outfit", system-ui, sans-serif',
                    }}
                  >
                    ⭐ MOST POPULAR
                  </div>
                )}

                <h3
                  className="font-bold text-lg mb-1"
                  style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: highlight ? '#fff' : C.foreground }}
                >
                  {name}
                </h3>
                <div className="flex items-end gap-1 mb-5">
                  <span
                    className="font-extrabold text-4xl"
                    style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: highlight ? '#fff' : C.foreground }}
                  >
                    {price}
                  </span>
                  {sub && <span className="text-sm mb-1" style={{ color: highlight ? 'rgba(255,255,255,0.6)' : C.muted }}>{sub}</span>}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {feat.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: highlight ? 'rgba(255,255,255,0.2)' : `${C.quaternary}15` }}
                      >
                        <CheckCircle size={12} style={{ color: highlight ? '#fff' : C.quaternary }} strokeWidth={2.5} />
                      </span>
                      <span style={{ color: highlight ? 'rgba(255,255,255,0.9)' : C.muted }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/links"
                  className="block text-center py-3 rounded-full font-bold text-sm transition-all duration-300"
                  style={{
                    background: highlight ? '#fff' : C.accent,
                    color: highlight ? C.accent : '#fff',
                    border: `2px solid ${C.foreground}`,
                    boxShadow: hardShadow(C.foreground, 2, 2),
                  }}
                  onMouseEnter={e => { e.target.style.boxShadow = hardShadow(C.foreground, 4, 4); e.target.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.target.style.boxShadow = hardShadow(C.foreground, 2, 2); e.target.style.transform = 'none'; }}
                >
                  {cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ CTA BANNER ═══════════════════════ */}
      <section className="py-20 md:py-28 px-6 relative overflow-hidden">
        <FloatingShapes variant="cta" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={popSpring}
          className="max-w-4xl mx-auto relative"
        >
          <div
            className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{
              background: C.accent,
              border: `2px solid ${C.foreground}`,
              boxShadow: hardShadow(C.foreground, 8, 8),
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

            <h2
              className="font-extrabold text-3xl md:text-5xl text-white mb-4 relative"
              style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
            >
              Ready to vault <br className="hidden md:block" />your links?
            </h2>
            <p className="mb-8 max-w-md mx-auto relative" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Join thousands of creators who trust LinkVault to keep their digital world organized.
            </p>
            <Link
              to="/links"
              id="cta-banner-button"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 relative"
              style={{
                background: '#fff',
                color: C.accent,
                border: `2px solid ${C.foreground}`,
                boxShadow: hardShadow(),
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = hardShadow(C.foreground, 6, 6); e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = hardShadow(); e.currentTarget.style.transform = 'translate(0, 0)'; }}
            >
              Get Started Free
              <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: C.accent }}>
                <ArrowRight size={14} className="text-white" strokeWidth={3} />
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="relative" style={{ background: C.cream, borderTop: `2px solid ${C.foreground}10` }} id="about">
        {/* Squiggly divider */}
        <div className="absolute -top-3 left-0 right-0">
          <svg viewBox="0 0 1200 12" width="100%" height="12" fill="none" preserveAspectRatio="none">
            <path d="M0 6 C 40 0, 80 12, 120 6 C 160 0, 200 12, 240 6 C 280 0, 320 12, 360 6 C 400 0, 440 12, 480 6 C 520 0, 560 12, 600 6 C 640 0, 680 12, 720 6 C 760 0, 800 12, 840 6 C 880 0, 920 12, 960 6 C 1000 0, 1040 12, 1080 6 C 1120 0, 1160 12, 1200 6" stroke="#E2E8F0" strokeWidth="2" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}
              >
                <Link2 size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>LinkVault</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: C.muted }}>
              The intelligent archive tool for modern creators and developers. Save, organize, and share your digital world.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Download', 'Integrations'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            { title: 'Community', links: ['Twitter/X', 'Discord', 'Blog', 'Changelog'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}
              >
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm font-medium transition-colors"
                      style={{ color: C.muted }}
                      onMouseEnter={e => { e.target.style.color = C.accent; }}
                      onMouseLeave={e => { e.target.style.color = C.muted; }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="py-6 text-center text-xs" style={{ borderTop: `2px solid ${C.foreground}08`, color: C.muted }}>
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <span>© 2025 LinkVault. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Made with <span style={{ color: C.secondary }}>♥</span> for link hoarders everywhere
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
