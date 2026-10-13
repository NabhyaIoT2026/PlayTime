import React, { useState } from 'react';
import { X, Sliders, Calculator, Check, Clock, Film } from 'lucide-react';

export default function ManualCalculatorModal({ isOpen, onClose, onSubmitManual }) {
  const [mode, setMode] = useState('total'); // 'total' (hours/mins) or 'average' (videos * avg length)
  const [title, setTitle] = useState('My Custom Video Course');
  const [videoCount, setVideoCount] = useState(25);
  
  // Total duration mode
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  // Average duration mode
  const [avgMinutes, setAvgMinutes] = useState(20);
  const [avgSeconds, setAvgSeconds] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let totalDurationSeconds = 0;
    const vCount = Math.max(1, parseInt(videoCount, 10) || 1);

    if (mode === 'total') {
      const h = Math.max(0, parseInt(hours, 10) || 0);
      const m = Math.max(0, parseInt(minutes, 10) || 0);
      const s = Math.max(0, parseInt(seconds, 10) || 0);
      totalDurationSeconds = h * 3600 + m * 60 + s;
    } else {
      const avgSec = Math.max(0, parseInt(avgMinutes, 10) || 0) * 60 + Math.max(0, parseInt(avgSeconds, 10) || 0);
      totalDurationSeconds = vCount * avgSec;
    }

    if (totalDurationSeconds <= 0) return;

    const avgDurationSeconds = Math.round(totalDurationSeconds / vCount);

    // Build mock videos array
    const generatedVideos = Array.from({ length: vCount }, (_, idx) => ({
      id: `manual_vid_${idx + 1}`,
      playlistItemId: `manual_item_${idx + 1}`,
      position: idx + 1,
      title: `Lesson ${idx + 1} - Video Lecture`,
      channelTitle: 'Manual Calculation',
      durationSeconds: avgDurationSeconds,
      durationIso: 'PT0S',
      thumbnail: '',
      isUnavailable: false,
    }));

    onSubmitManual({
      title: title.trim() || 'Custom Playlist Calculation',
      channelTitle: 'Manual Mode',
      isSample: false,
      isManual: true,
      totalVideosCount: vCount,
      processedVideosCount: vCount,
      unavailableCount: 0,
      totalDurationSeconds,
      averageDurationSeconds: avgDurationSeconds,
      videos: generatedVideos,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-2xl bg-slate-900 dark:bg-dark-card border border-slate-700 dark:border-dark-border shadow-2xl p-6 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Manual Duration Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Calculate watch times without needing a YouTube URL or API Key.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 dark:bg-dark-bg rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('total')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'total' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Total Length (HH:MM)
          </button>
          <button
            type="button"
            onClick={() => setMode('average')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'average' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Video Count × Avg Length
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Playlist Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course / Playlist Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Design Interview Course"
              className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Video Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Total Number of Videos
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={videoCount}
              onChange={(e) => setVideoCount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Mode Inputs */}
          {mode === 'total' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Duration
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white text-center focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Hours</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white text-center focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Minutes</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Seconds"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white text-center focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Seconds</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Average Video Length
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Minutes"
                    value={avgMinutes}
                    onChange={(e) => setAvgMinutes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white text-center focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Minutes / video</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Seconds"
                    value={avgSeconds}
                    onChange={(e) => setAvgSeconds(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white text-center focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Seconds</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-glow-sm"
            >
              Calculate Watch Times
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
