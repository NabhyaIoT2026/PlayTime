import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  PlayCircle,
  Sun,
  Moon,
  Github,
  Menu,
  X,
  Calculator,
  Calendar,
  BarChart2,
  Home,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const navLinks = [
  { name: 'Home', to: '/', icon: Home, end: true },
  { name: 'Calculator', to: '/calculator', icon: PlayCircle },
  { name: 'Study Planner', to: '/planner', icon: Calendar },
  { name: 'Channel Analytics', to: '/analytics', icon: BarChart2 },
];

const activeCls =
  'text-white bg-brand-500/10 border border-brand-500/20';
const inactiveCls =
  'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent';

export default function Navbar() {
  const { isDark, toggleTheme, apiStatus } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/your-username/playtime';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-red-500 text-white shadow-glow-sm group-hover:scale-105 transition-transform">
              <PlayCircle className="w-5 h-5 fill-white/20 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Playtime
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Pro
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive ? activeCls : inactiveCls
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* API Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                apiStatus?.isApiKeyConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
              title={apiStatus?.message}
            >
              {apiStatus?.isApiKeyConfigured ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>{apiStatus?.isApiKeyConfigured ? 'API Connected' : 'Demo Mode'}</span>
            </div>

            {/* GitHub Link */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-900/95 px-4 pt-2 pb-4 space-y-1 backdrop-blur-lg">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
            <span>API Status:</span>
            <span className={apiStatus?.isApiKeyConfigured ? 'text-emerald-400 font-medium' : 'text-amber-300 font-medium'}>
              {apiStatus?.isApiKeyConfigured ? 'YouTube API Connected' : 'Demo & Manual Mode'}
            </span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.to}
                end={link.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-white border border-brand-500/20'
                      : 'text-slate-300 hover:bg-slate-800 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-brand-500" />
                {link.name}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
