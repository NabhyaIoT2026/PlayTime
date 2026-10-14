import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  CalendarDays, 
  BookOpen, 
  Sparkles,
  Info,
  X,
  Plus,
  Download,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { calculateStudyPlan, formatClockTime, formatDetailedDuration } from '../utils/calculations.js';
import { 
  generateIcsContent, 
  downloadFile, 
  createGoogleCalendarUrl, 
  generateStudyMarkdown 
} from '../utils/calendarExport.js';
import { useApp } from '../context/AppContext.jsx';

// Format Date object to YYYY-MM-DD input string using local time
function toInputDateString(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StudyPlanner({ 
  totalDurationSeconds, 
  totalVideosCount, 
  averageDurationSeconds, 
  selectedSpeed 
}) {
  const { playlistData } = useApp();
  const [dailyMinutes, setDailyMinutes] = useState(60); // default 1 hour / day
  const [startDate, setStartDate] = useState(() => toInputDateString(new Date()));
  const [targetDate, setTargetDate] = useState('');
  const [copiedNotion, setCopiedNotion] = useState(false);
  const targetDateInputRef = useRef(null);

  const plan = calculateStudyPlan({
    totalDurationSeconds,
    totalVideosCount,
    averageDurationSeconds,
    playbackSpeed: selectedSpeed,
    dailyMinutes,
    startDate,
    targetDate: targetDate || null,
  });

  const quickMinutes = [30, 45, 60, 90, 120, 180, 240];

  const formatDateString = (dateObj) => {
    if (!dateObj) return 'N/A';
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to add days from start date to target deadline
  const handleAddDays = (days) => {
    const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
    const target = new Date(base.getTime());
    target.setDate(target.getDate() + days);
    setTargetDate(toInputDateString(target));
  };

  // Helper to set target deadline to match calculated completion date
  const handleMatchCompletionDate = () => {
    if (plan.completionDate) {
      setTargetDate(toInputDateString(plan.completionDate));
    }
  };

  // Export 1: Download .ics calendar file
  const handleDownloadIcs = () => {
    const courseTitle = playlistData?.title || 'Course';
    const ics = generateIcsContent({
      title: courseTitle,
      startDate: startDate ? new Date(`${startDate}T00:00:00`) : new Date(),
      daysNeeded: plan.daysNeeded,
      dailyMinutes,
      selectedSpeed,
    });
    const sanitizedFilename = `${courseTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_study_schedule.ics`;
    downloadFile(sanitizedFilename, ics);
  };

  // Export 2: Open Google Calendar in new tab
  const handleOpenGoogleCalendar = () => {
    const courseTitle = playlistData?.title || 'YouTube Course';
    const url = createGoogleCalendarUrl({
      title: courseTitle,
      startDate: startDate ? new Date(`${startDate}T00:00:00`) : new Date(),
      dailyMinutes,
      selectedSpeed,
      daysNeeded: plan.daysNeeded,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Export 3: Copy Notion / Markdown Checklist
  const handleCopyNotion = async () => {
    const courseTitle = playlistData?.title || 'Course';
    const md = generateStudyMarkdown({
      playlistTitle: courseTitle,
      videos: playlistData?.videos || [],
      selectedSpeed,
      plan: {
        dailyMinutes,
        daysNeeded: plan.daysNeeded,
        completionDate: plan.completionDate,
      },
    });

    try {
      await navigator.clipboard.writeText(md);
      setCopiedNotion(true);
      setTimeout(() => setCopiedNotion(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <section id="planner" className="mb-14 p-6 sm:p-8 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-xl scroll-mt-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Study & Viewing Planner</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Plan Your Watch Schedule
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Set your daily commitment and calculate exactly when you'll complete this playlist at {selectedSpeed}× speed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Time Slider */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-slate-200">Daily Study / Viewing Time</span>
              <span className="font-bold text-brand-400">
                {Math.floor(dailyMinutes / 60) > 0 ? `${Math.floor(dailyMinutes / 60)}h ` : ''}
                {dailyMinutes % 60 > 0 ? `${dailyMinutes % 60}m` : ''} / day
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="720"
              step="15"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500 mb-3"
            />

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickMinutes.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    dailyMinutes === mins
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-800 dark:bg-dark-bg text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Dates Config */}
          <div className="space-y-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
              />
            </div>

            {/* Target Deadline Input & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-brand-400" />
                  <span>Target Deadline</span>
                </label>
                {targetDate && (
                  <button
                    type="button"
                    onClick={() => setTargetDate('')}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Deadline</span>
                  </button>
                )}
              </div>

              {/* Target Date Input Field */}
              <div className="relative flex items-center">
                <input
                  ref={targetDateInputRef}
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border text-white text-sm focus:outline-none focus:border-brand-500 cursor-pointer"
                  placeholder="Select deadline date"
                />
              </div>

              {/* Quick Deadline Presets */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 mr-1">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => handleAddDays(3)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(7)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(14)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDays(30)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
                >
                  +1 Month
                </button>
                <button
                  type="button"
                  onClick={handleMatchCompletionDate}
                  className="px-2 py-0.5 rounded-md bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-[11px] font-semibold border border-brand-500/30 transition-colors"
                  title="Match calculated pace"
                >
                  Match Plan Date
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 dark:bg-dark-bg/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Calculations utilize your active <strong>{selectedSpeed}×</strong> playback speed ({formatClockTime(plan.adjustedSeconds)} total watch time).
            </span>
          </div>
        </div>

        {/* Results / Roadmap Column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Days Needed */}
            <div className="p-4 rounded-xl bg-slate-800/60 dark:bg-dark-bg/80 border border-slate-700/60 dark:border-dark-border text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Days Required
              </span>
              <span className="text-3xl font-extrabold text-white">
                {plan.daysNeeded}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                {plan.daysNeeded === 1 ? '1 day to finish' : `~${plan.daysNeeded} study sessions`}
              </span>
            </div>

            {/* Daily Videos */}
            <div className="p-4 rounded-xl bg-slate-800/60 dark:bg-dark-bg/80 border border-slate-700/60 dark:border-dark-border text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Daily Videos
              </span>
              <span className="text-3xl font-extrabold text-white">
                {plan.estimatedDailyVideos}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                videos per day
              </span>
            </div>

            {/* Estimated Finish Date */}
            <div className="p-4 rounded-xl bg-slate-800/60 dark:bg-dark-bg/80 border border-slate-700/60 dark:border-dark-border text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Completion Date
              </span>
              <span className="text-base font-bold text-brand-400 block mt-1">
                {formatDateString(plan.completionDate)}
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                estimated finish
              </span>
            </div>
          </div>

          {/* Target Feasibility Card (if target deadline is chosen) */}
          {plan.targetAnalysis ? (
            <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
              plan.targetAnalysis.status === 'achievable'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : plan.targetAnalysis.status === 'pace_adjustment_needed'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}>
              {plan.targetAnalysis.status === 'achievable' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {plan.targetAnalysis.status === 'achievable' 
                    ? 'Target Date Achievable!' 
                    : 'Pace Adjustment Recommended'}
                </p>
                <p className="text-xs mt-1 leading-relaxed">
                  {plan.targetAnalysis.message}
                </p>
                <div className="mt-2 text-xs font-medium">
                  Available window: <strong>{plan.targetAnalysis.daysAvailable} days</strong> (Target: {formatDateString(new Date(`${targetDate}T00:00:00`))}) • Required pace: <strong>{plan.targetAnalysis.requiredDailyClock} per day</strong>
                </div>
              </div>
            </div>
          ) : (
            /* Helpful hint when no target deadline is selected yet */
            <div className="p-4 rounded-xl bg-slate-800/30 dark:bg-dark-bg/40 border border-dashed border-slate-700/80 text-xs text-slate-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-400 shrink-0" />
                <span>
                  Want to finish by a specific date? Set a <strong>Target Deadline</strong> above or click one of the quick presets to analyze feasibility.
                </span>
              </div>
            </div>
          )}

          {/* Export Schedule to Calendar & Notes */}
          <div className="p-4 rounded-xl bg-slate-800/40 dark:bg-dark-bg/60 border border-slate-700/80 dark:border-dark-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>Export & Sync Your Study Plan</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Button 1: Download .ics */}
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                title="Download iCal (.ics) file compatible with Apple Calendar, Outlook, and Google Calendar"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" />
                <span>iCal / .ics File</span>
              </button>

              {/* Button 2: Google Calendar */}
              <button
                type="button"
                onClick={handleOpenGoogleCalendar}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                title="Create event directly in Google Calendar"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Calendar</span>
              </button>

              {/* Button 3: Notion / Markdown */}
              <button
                type="button"
                onClick={handleCopyNotion}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                title="Copy formatted markdown checklist ready to paste into Notion, Obsidian, or Notes"
              >
                {copiedNotion ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{copiedNotion ? 'Copied MD!' : 'Notion / MD'}</span>
              </button>
            </div>
          </div>

          {/* Realistic Disclaimer */}
          <p className="text-[11px] text-slate-400 italic">
            * Note: These calculations represent mathematical approximations based on average video durations and constant playback speeds. Actual study time may vary depending on breaks and note-taking.
          </p>
        </div>
      </div>
    </section>
  );
}
