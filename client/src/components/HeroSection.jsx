import React, { useState } from 'react';
import { 
  Search, 
  ClipboardPaste, 
  X, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Gauge, 
  ShieldCheck, 
  Play, 
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { extractPlaylistId } from '../utils/urlParser.js';

export default function HeroSection({ 
  onCalculate, 
  onLoadSample, 
  onOpenManualModal, 
  isLoading, 
  urlInput, 
  setUrlInput 
}) {
  const [inputError, setInputError] = useState('');
  const [copiedPills, setCopiedPills] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setInputError('');
      }
    } catch (err) {
      // Clipboard permissions may be restricted in some browsers
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setInputError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setInputError('Please enter a YouTube playlist URL or ID.');
      return;
    }

    const playlistId = extractPlaylistId(urlInput);
    if (!playlistId) {
      setInputError('Invalid YouTube playlist URL or ID. Make sure it contains "list=PL..." or similar.');
      return;
    }

    setInputError('');
    onCalculate(urlInput.trim());
  };

  return (
    <section id="calculator" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-glow pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs sm:text-sm font-medium mb-6 animate-pulse-subtle">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Supercharge your YouTube binge & study sessions</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          Your Playlist.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-brand-500 to-rose-400">
            Your Time.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-300 dark:text-slate-400 mb-10 leading-relaxed">
          Calculate the total length of any YouTube playlist and discover how quickly you can finish it at your favorite playback speed.
        </p>

        {/* Search / Input Box Card */}
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/95 border border-slate-700/80 dark:border-dark-border shadow-2xl backdrop-blur-xl transition-all focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20"
          >
            <div className="relative flex flex-col sm:flex-row items-center gap-2">
              {/* Input wrapper */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 absolute pointer-events-none" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  placeholder="Paste YouTube playlist URL (e.g. youtube.com/playlist?list=PL...)"
                  className="w-full pl-11 pr-20 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 bg-transparent rounded-xl focus:outline-none"
                  aria-label="YouTube Playlist URL"
                />

                {/* Inline Action Icons (Clear / Paste) */}
                <div className="absolute right-2 flex items-center gap-1">
                  {urlInput && (
                    <button
                      type="button"
                      onClick={handleClear}
                      aria-label="Clear input"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePaste}
                    aria-label="Paste from clipboard"
                    className="p-1.5 text-slate-400 hover:text-brand-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white text-sm sm:text-base font-semibold rounded-xl shadow-glow-sm hover:shadow-glow transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Calculate Watch Time</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Validation Error Message */}
          {inputError && (
            <p className="mt-2.5 text-sm font-medium text-red-400 text-left pl-3 flex items-center gap-1.5">
              <span>⚠️</span> {inputError}
            </p>
          )}

          {/* Quick Action Helpers */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Supports public & unlisted YouTube playlists.</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLoadSample}
                className="hover:text-brand-400 underline decoration-slate-600 hover:decoration-brand-400 transition-colors flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample Course</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={onOpenManualModal}
                className="hover:text-brand-400 underline decoration-slate-600 hover:decoration-brand-400 transition-colors flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>Manual Duration Calculator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Speed Visualization Pills */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 dark:border-dark-border/60 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
            Supported Playback Speeds with Instant Time Savings
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {[
              { speed: '1.0×', label: 'Normal', save: 'Baseline' },
              { speed: '1.25×', label: 'Crisp', save: 'Save 20%' },
              { speed: '1.5×', label: 'Swift', save: 'Save 33%' },
              { speed: '1.75×', label: 'Fast', save: 'Save 43%' },
              { speed: '2.0×', label: 'Binge', save: 'Save 50%' },
              { speed: '2.5×', label: 'Turbo', save: 'Save 60%' },
            ].map((pill) => (
              <div
                key={pill.speed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 dark:border-dark-border text-xs text-slate-300"
              >
                <span className="font-bold text-white">{pill.speed}</span>
                <span className="text-slate-400">({pill.save})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
