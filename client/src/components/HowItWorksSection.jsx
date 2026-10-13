import React from 'react';
import { Link2, Gauge, CalendarCheck, Zap } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: Link2,
      title: 'Paste Any YouTube Playlist',
      description:
        'Copy the playlist URL from your browser address bar or share sheet. Playtime extracts the playlist ID and fetches all video lengths in seconds.',
    },
    {
      step: '02',
      icon: Gauge,
      title: 'Choose Your Playback Speed',
      description:
        'Select from 10 preset multipliers (from 0.5× to 3×) or drag the custom speed slider. See adjusted durations and total saved hours calculated instantly.',
    },
    {
      step: '03',
      icon: CalendarCheck,
      title: 'Plan Your Daily Schedule',
      description:
        'Configure your available study time per day. Playtime generates an exact completion date, daily video targets, and evaluates deadline feasibility.',
    },
  ];

  return (
    <section id="how-it-works" className="mb-20 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Streamlined Workflow</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          How Playtime Works
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Turn hours of video lectures into structured, achievable milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-slate-900/80 dark:bg-dark-card/80 border border-slate-800 dark:border-dark-border relative group hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-800 select-none">
                  {item.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
