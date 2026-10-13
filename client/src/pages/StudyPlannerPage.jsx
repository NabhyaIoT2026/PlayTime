import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import StudyPlanner from '../components/StudyPlanner.jsx';
import { 
  Calendar, 
  Sparkles, 
  Sliders, 
  BookOpen, 
  Clock, 
  Film, 
  Gauge, 
  ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSamplePlaylist } from '../services/api.js';

export default function StudyPlannerPage() {
  const { playlistData, setPlaylistData, selectedSpeed, setSelectedSpeed } = useApp();

  // Local fallback if user wants to customize duration on this page directly
  const [customHours, setCustomHours] = useState(8);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customVideos, setCustomVideos] = useState(20);

  // If no playlist loaded in context, use local custom figures
  const effectiveDurationSeconds = playlistData
    ? playlistData.totalDurationSeconds
    : (customHours * 3600 + customMinutes * 60);

  const effectiveVideosCount = playlistData
    ? playlistData.totalVideosCount
    : customVideos;

  const effectiveAvgSeconds = effectiveVideosCount > 0
    ? Math.round(effectiveDurationSeconds / effectiveVideosCount)
    : 0;

  const handleLoadSample = async () => {
    const sample = await getSamplePlaylist();
    setPlaylistData(sample);
  };

  const speedOptions = [1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <div className="pt-8 pb-20 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Badge */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Calculator</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Dedicated Study Planner</span>
        </div>
      </div>

      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Plan Your Watch Time
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Calculate how many days you need to complete your video course, set target deadlines, and optimize daily study sessions.
        </p>
      </div>

      {/* Active Course Source Card */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-brand-400 font-bold block mb-1">
            Current Course Source
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            <span>{playlistData?.title || 'Custom Study Schedule'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {playlistData
              ? `${playlistData.totalVideosCount} videos • ${Math.round(playlistData.totalDurationSeconds / 3600 * 10) / 10} total hours`
              : 'Using custom time inputs below. You can also import any playlist from the Calculator.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!playlistData && (
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample Course</span>
            </button>
          )}

          <Link
            to="/"
            className="px-3.5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-sm transition-all"
          >
            Import YouTube Playlist
          </Link>
        </div>
      </div>

      {/* Speed Multiplier Quick Selector for the Planner */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-brand-500" />
          <span>Planned Playback Multiplier:</span>
        </span>

        <div className="flex items-center gap-2">
          {speedOptions.map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setSelectedSpeed(spd)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                Math.abs(selectedSpeed - spd) < 0.05
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {spd}×
            </button>
          ))}
        </div>
      </div>

      {/* Main Study Planner Component */}
      <StudyPlanner
        totalDurationSeconds={effectiveDurationSeconds}
        totalVideosCount={effectiveVideosCount}
        averageDurationSeconds={effectiveAvgSeconds}
        selectedSpeed={selectedSpeed}
      />
    </div>
  );
}
