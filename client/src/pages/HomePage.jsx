import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle,
  Calendar,
  BarChart2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  Film,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    id: 'calculator',
    to: '/calculator',
    icon: PlayCircle,
    color: 'from-brand-600 to-red-600',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.25)]',
    border: 'border-brand-500/30',
    badge: 'Core Feature',
    badgeColor: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    title: 'Playlist Calculator',
    subtitle: 'YouTube URL → Full Stats',
    description:
      'Paste any YouTube playlist URL and instantly get total duration, per-video breakdown, playback speed comparisons, and sortable video list.',
    bullets: ['Handles 500+ video playlists', 'Works with any public playlist', 'Speed 0.25× – 2×'],
  },
  {
    id: 'planner',
    to: '/planner',
    icon: Calendar,
    color: 'from-emerald-600 to-teal-600',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    border: 'border-emerald-500/30',
    badge: 'Plan Ahead',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    title: 'Study Planner',
    subtitle: 'Schedule Your Watch Time',
    description:
      'Set a target deadline or daily session time, and instantly see how many videos per day you need to complete your course on time.',
    bullets: ['Set target completion date', 'Choose daily hours limit', 'Speed-adjusted scheduling'],
  },
  {
    id: 'analytics',
    to: '/analytics',
    icon: BarChart2,
    color: 'from-sky-600 to-blue-600',
    glow: 'shadow-[0_0_30px_rgba(14,165,233,0.25)]',
    border: 'border-sky-500/30',
    badge: 'Channel Intelligence',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    title: 'Channel Analytics',
    subtitle: 'Deep Channel Insights',
    description:
      'Enter a channel URL to browse all videos with live filters by views, likes, date, and duration — plus full-text search across descriptions.',
    bullets: ['Filter by views / likes / date', 'Search in descriptions', 'Sort & export results'],
  },
];

const stats = [
  { icon: Film, label: 'Max videos / playlist', value: '500+' },
  { icon: Zap, label: 'Playback speeds', value: '8' },
  { icon: Clock, label: 'Time saved insight', value: '∞' },
];

export default function HomePage() {
  return (
    <div className="pt-10 pb-24">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5" />
          <span>YouTube Playlist Intelligence — All in One Place</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-brand-400 to-red-400 bg-clip-text text-transparent">
            Playtime
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Calculate playlist durations, plan your study schedule, explore channel analytics, and
          more — each feature lives on its own dedicated page so you can jump straight to what
          you need.
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-8">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 justify-center">
                <Icon className="w-3 h-3 text-brand-500" />
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature Cards Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <Link
              key={feat.id}
              to={feat.to}
              className={`
                group relative flex flex-col p-6 rounded-2xl
                bg-slate-900/80 border ${feat.border}
                hover:${feat.glow} hover:scale-[1.02]
                transition-all duration-300 cursor-pointer
                backdrop-blur-sm overflow-hidden
              `}
            >
              {/* Background gradient blob */}
              <div
                className={`absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gradient-to-br ${feat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
              />

              {/* Badge */}
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider w-fit mb-4 ${feat.badgeColor}`}
              >
                {feat.badge}
              </div>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-md`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-lg font-extrabold text-white mb-0.5">{feat.title}</h2>
              <p className="text-xs text-slate-400 font-medium mb-3">{feat.subtitle}</p>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-4">
                {feat.description}
              </p>

              {/* Bullets */}
              <ul className="space-y-1 mb-5">
                {feat.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-slate-400">
                    <ChevronRight className="w-3 h-3 text-brand-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div
                className={`flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r ${feat.color} bg-clip-text text-transparent group-hover:gap-2.5 transition-all`}
              >
                <span>Open {feat.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Start Banner ───────────────────────────── */}
      <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-brand-900/40 via-slate-900 to-slate-900 border border-brand-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-extrabold text-white mb-1">
            🚀 Quick Start — Calculate a Playlist in Seconds
          </h3>
          <p className="text-sm text-slate-400">
            Paste your YouTube playlist URL, hit Calculate, and get a complete duration breakdown
            instantly.
          </p>
        </div>
        <Link
          to="/calculator"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-bold text-sm shadow-glow-sm transition-all"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Go to Calculator</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
