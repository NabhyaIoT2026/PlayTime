import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/your-username/playtime';

  const footerLinks = [
    { label: 'Calculator', to: '/calculator' },
    { label: 'Study Planner', to: '/planner' },
    { label: 'Channel Analytics', to: '/analytics' },
  ];

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/60">
          {/* Logo & description */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600 text-white shadow-glow-sm">
                <PlayCircle className="w-4 h-4 fill-white/20 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Playtime</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm">
              YouTube Playlist Length Calculator & Study Planner. Track watch times at higher speeds and optimize your learning hours.
            </p>
          </div>

          {/* Page Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            {footerLinks.map(({ label, to }) => (
              <Link key={label} to={to} className="hover:text-white transition-colors">
                {label}
              </Link>
            ))}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 text-center sm:text-left">
          <p>
            © {currentYear} Playtime. Built with React, Vite, Tailwind CSS, Fastify & YouTube Data API v3.
          </p>
          <p className="max-w-md text-slate-500">
            Playtime is an independent utility and is not affiliated with YouTube, Google LLC, or Alphabet Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
