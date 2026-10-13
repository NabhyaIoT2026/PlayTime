import React from 'react';
import { Gauge, Check, SlidersHorizontal, Clock, Zap } from 'lucide-react';
import { calculateSpeedStats, formatClockTime } from '../utils/calculations.js';

const PRESET_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0];

export default function PlaybackSpeedSelector({ 
  totalDurationSeconds, 
  selectedSpeed, 
  onSelectSpeed 
}) {
  const currentStats = calculateSpeedStats(totalDurationSeconds, selectedSpeed);

  return (
    <section className="mb-14 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span>Playback Speed Calculator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Adjust Speed & Discover Your Time Savings
          </h3>
        </div>

        {/* Selected Speed Highlight Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-dark-card border border-brand-500/40 text-xs font-medium text-slate-300">
          <span>Active Speed:</span>
          <span className="font-extrabold text-sm text-brand-400">{selectedSpeed}×</span>
          <span className="text-slate-500">|</span>
          <span className="text-white font-semibold">{currentStats.clockTime}</span>
          {currentStats.savedSeconds > 0 && (
            <span className="text-emerald-400 text-[11px] font-bold">
              (-{currentStats.percentSaved}%)
            </span>
          )}
        </div>
      </div>

      {/* Custom Speed Slider & Input Bar */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 dark:border-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-brand-500" />
          <span>Custom Playback Multiplier:</span>
        </div>

        <div className="flex items-center gap-4 w-full md:w-2/3">
          <input
            type="range"
            min="0.25"
            max="3.5"
            step="0.05"
            value={selectedSpeed}
            onChange={(e) => onSelectSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            aria-label="Custom speed slider"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              min="0.25"
              max="4.0"
              step="0.05"
              value={selectedSpeed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0.25 && val <= 4.0) {
                  onSelectSpeed(val);
                }
              }}
              className="w-20 px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border text-center font-bold text-white text-sm focus:outline-none focus:border-brand-500"
              aria-label="Custom speed input"
            />
            <span className="text-sm font-bold text-slate-400">×</span>
          </div>
        </div>
      </div>

      {/* Preset Speeds Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {PRESET_SPEEDS.map((speed) => {
          const stats = calculateSpeedStats(totalDurationSeconds, speed);
          const isSelected = Math.abs(selectedSpeed - speed) < 0.01;

          return (
            <button
              key={speed}
              type="button"
              onClick={() => onSelectSpeed(speed)}
              className={`p-3.5 rounded-xl text-left border transition-all relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 dark:bg-dark-card border-brand-500 ring-2 ring-brand-500/20 shadow-glow-sm'
                  : 'bg-slate-900/50 dark:bg-dark-card/50 border-slate-800/80 dark:border-dark-border hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-base font-extrabold ${isSelected ? 'text-brand-400' : 'text-white'}`}>
                  {speed}×
                </span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Watch Time */}
              <div className="text-sm font-bold text-white tracking-tight">
                {stats.clockTime}
              </div>

              {/* Savings Details */}
              <div className="mt-1 text-[11px] text-slate-400">
                {speed === 1.0 ? (
                  <span className="text-slate-400">Original speed</span>
                ) : speed < 1.0 ? (
                  <span className="text-amber-400/90">+{stats.adjustedSeconds - totalDurationSeconds > 0 ? formatClockTime(stats.adjustedSeconds - totalDurationSeconds) : '0s'} slower</span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    Save {stats.savedDetailed.shortText} ({stats.percentSaved}%)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
