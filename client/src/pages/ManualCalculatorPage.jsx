import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import PlaybackSpeedSelector from '../components/PlaybackSpeedSelector.jsx';
import ResultsSummary from '../components/ResultsSummary.jsx';
import { 
  Calculator, 
  ArrowLeft, 
  Sliders, 
  Clock, 
  Film, 
  Calendar, 
  ArrowRight 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ManualCalculatorPage() {
  const { setPlaylistData, selectedSpeed, setSelectedSpeed } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState('total');
  const [title, setTitle] = useState('My Custom Video Course');
  const [videoCount, setVideoCount] = useState(25);
  
  // Total duration mode
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  // Average duration mode
  const [avgMinutes, setAvgMinutes] = useState(20);
  const [avgSeconds, setAvgSeconds] = useState(0);

  // Result state
  const [calculatedData, setCalculatedData] = useState(null);

  const handleCalculate = (e) => {
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

    const result = {
      title: title.trim() || 'Custom Playlist Calculation',
      channelTitle: 'Manual Calculator',
      isSample: false,
      isManual: true,
      totalVideosCount: vCount,
      processedVideosCount: vCount,
      unavailableCount: 0,
      totalDurationSeconds,
      averageDurationSeconds: avgDurationSeconds,
      videos: generatedVideos,
    };

    setCalculatedData(result);
    setPlaylistData(result);
  };

  return (
    <div className="pt-8 pb-20 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Calculator</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Manual Mode (No URL / API Needed)</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Manual Duration Calculator
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Calculate watch time, speed savings, and schedules without needing an API key or YouTube URL.
        </p>
      </div>

      {/* Manual Input Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-xl mb-12">
        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800 dark:bg-dark-bg rounded-xl mb-6 text-xs sm:text-sm font-semibold max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMode('total')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'total' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Total Length (HH:MM:SS)
          </button>
          <button
            type="button"
            onClick={() => setMode('average')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'average' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Video Count × Avg Duration
          </button>
        </div>

        <form onSubmit={handleCalculate} className="space-y-5 max-w-2xl mx-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course / Playlist Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems Course"
              className="w-full px-4 py-2.5 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Number of Videos
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={videoCount}
              onChange={(e) => setVideoCount(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {mode === 'total' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Course Duration
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 text-center text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
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
                    className="w-full px-3 py-2 text-center text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
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
                    className="w-full px-3 py-2 text-center text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Seconds</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                    className="w-full px-3 py-2 text-center text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
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
                    className="w-full px-3 py-2 text-center text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">Seconds</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white font-bold rounded-xl shadow-glow-sm transition-all"
          >
            Calculate Watch Times
          </button>
        </form>
      </div>

      {/* Calculated Results */}
      {calculatedData && (
        <div className="space-y-8 animate-fadeIn">
          <ResultsSummary
            playlistData={calculatedData}
            onReset={() => setCalculatedData(null)}
            selectedSpeed={selectedSpeed}
          />

          <PlaybackSpeedSelector
            totalDurationSeconds={calculatedData.totalDurationSeconds}
            selectedSpeed={selectedSpeed}
            onSelectSpeed={setSelectedSpeed}
          />

          <div className="p-6 rounded-2xl bg-slate-900 border border-brand-500/30 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Ready to schedule your daily viewing?</h4>
              <p className="text-xs text-slate-400">Open the Study Planner to calculate completion dates.</p>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <span>Go to Study Planner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
