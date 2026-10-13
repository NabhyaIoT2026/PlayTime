import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0); // first open by default

  const faqs = [
    {
      q: 'How do I calculate the length of a YouTube playlist?',
      a: 'Simply copy the playlist link from YouTube (for instance, https://www.youtube.com/playlist?list=PL...) and paste it into Playtime. Click "Calculate Watch Time" and Playtime will parse every video, compute the exact total duration, and display breakdown statistics.',
    },
    {
      q: 'How does playback speed affect watch time?',
      a: 'Watching at a higher playback speed compresses the time required by the exact multiplier: Adjusted Time = Original Duration / Playback Speed. For example, watching an 8-hour playlist at 1.5× speed cuts the time to 5 hours and 20 minutes (saving 33%). At 2.0× speed, the watch time is cut in half to 4 hours (saving 50%).',
    },
    {
      q: 'Can I calculate the length of a large playlist?',
      a: 'Yes. Playtime handles multi-page YouTube API pagination with pagination tokens to retrieve up to hundreds of videos per playlist. Large playlists are rendered using efficient card pagination and responsive tables so your browser stays blazing fast.',
    },
    {
      q: 'Does this calculator work without a YouTube API key?',
      a: 'Yes! Playtime is built to be resilient. If a YouTube API key is not yet configured on the server, Playtime provides a full Demo Mode (featuring a realistic 18-episode development course) and a built-in Manual Duration Calculator where you can input custom hours or video counts.',
    },
    {
      q: 'Can I calculate how many days I need to finish a playlist?',
      a: 'Absolutely. Use our built-in "Plan Your Watch Time" study planner. Specify how many minutes or hours you can commit each day, and Playtime will calculate the exact number of days required, your estimated finish date, and evaluate whether your target deadline is feasible.',
    },
    {
      q: 'What happens if some videos are private or deleted?',
      a: 'Playtime detects inaccessible, private, or deleted videos from the playlist response, counts them separately, and displays a warning banner. Unavailable videos are assigned zero duration so your total watch time calculations remain accurate.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="mb-20 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Everything you need to know about playlist calculations, playback multipliers, and API setups.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/80 dark:bg-dark-card/80 border border-slate-800 dark:border-dark-border overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-brand-400 transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 dark:text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
