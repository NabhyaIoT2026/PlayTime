import React, { useState } from 'react';
import { 
  Film, 
  Clock, 
  Timer, 
  Zap, 
  Copy, 
  Share2, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { formatClockTime, formatDetailedDuration } from '../utils/calculations.js';

export default function ResultsSummary({ playlistData, onReset, selectedSpeed = 1.0 }) {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!playlistData) return null;

  const {
    title,
    channelTitle,
    totalVideosCount = 0,
    processedVideosCount = 0,
    unavailableCount = 0,
    totalDurationSeconds = 0,
    averageDurationSeconds = 0,
    isSample = false,
    videos = [],
    playlistId,
  } = playlistData;

  const detailedTotal = formatDetailedDuration(totalDurationSeconds);
  const halfDurationSeconds = Math.round(totalDurationSeconds / 2);
  const detailedAt2x = formatDetailedDuration(halfDurationSeconds);

  // Copy results summary text
  const handleCopySummary = async () => {
    const text = [
      `🎬 YouTube Playlist: ${title}`,
      `👤 Channel: ${channelTitle || 'N/A'}`,
      `📹 Total Videos: ${totalVideosCount} (${processedVideosCount} processed)`,
      `⏱️ Total Duration: ${detailedTotal.formatted} (${formatClockTime(totalDurationSeconds)})`,
      `⚡ Watch at 1.5×: ${formatClockTime(Math.round(totalDurationSeconds / 1.5))}`,
      `🚀 Watch at 2.0×: ${formatClockTime(halfDurationSeconds)} (Saves 50%!)`,
      `📊 Calculated with Playtime (https://playtime.app)`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // Share via Web Share API or copy link
  const handleShare = async () => {
    const shareData = {
      title: `Playtime: ${title}`,
      text: `Playlist length: ${detailedTotal.formatted}. Watch in ${detailedAt2x.formatted} at 2x!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      handleCopySummary();
    }
  };

  // Export video list to CSV
  const handleExportCSV = () => {
    if (!videos || videos.length === 0) return;

    const headers = ['Position', 'Title', 'Channel', 'Duration (Seconds)', 'Formatted Duration', 'Status', 'Video URL'];
    const rows = videos.map((v) => [
      v.position || '',
      `"${(v.title || '').replace(/"/g, '""')}"`,
      `"${(v.channelTitle || '').replace(/"/g, '""')}"`,
      v.durationSeconds || 0,
      v.isUnavailable ? 'Unavailable' : formatClockTime(v.durationSeconds),
      v.isUnavailable ? (v.statusReason || 'Unavailable') : 'Available',
      v.id && !v.isUnavailable ? `https://www.youtube.com/watch?v=${v.id}` : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(title || 'playlist').replace(/[^a-zA-Z0-9]/g, '_')}_playtime.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="mb-14 scroll-mt-24">
      {/* Sample Demo Banner */}
      {isSample && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Sample Demo Mode Active:</strong> Displaying representative data from a curated 18-video web development masterclass. All calculations, filters, and speeds are fully interactive!
            </span>
          </div>
          <span className="shrink-0 text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
            Demo Data
          </span>
        </div>
      )}

      {/* Playlist Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800 dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>{channelTitle || 'YouTube Channel'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            {title}
            {playlistId && !isSample && (
              <a
                href={`https://www.youtube.com/playlist?list=${playlistId}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in YouTube"
                className="text-slate-400 hover:text-brand-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 dark:bg-dark-card dark:hover:bg-dark-cardHover border border-slate-700 dark:border-dark-border rounded-lg transition-all flex items-center gap-1.5"
            title="Copy summary text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 dark:bg-dark-card dark:hover:bg-dark-cardHover border border-slate-700 dark:border-dark-border rounded-lg transition-all flex items-center gap-1.5"
            title="Share summary"
          >
            {shareSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shareSuccess ? 'Shared!' : 'Share'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 dark:bg-dark-card dark:hover:bg-dark-cardHover border border-slate-700 dark:border-dark-border rounded-lg transition-all flex items-center gap-1.5"
            title="Export video list to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onReset}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 dark:bg-dark-bg border border-slate-800 dark:border-dark-border rounded-lg transition-all flex items-center gap-1.5"
            title="Reset calculator"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Unavailable Videos Warning Alert */}
      {unavailableCount > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{unavailableCount} {unavailableCount === 1 ? 'video is' : 'videos are'} unavailable or private</span> in this playlist. These videos have 0 duration and are excluded from the calculated watch time total.
          </div>
        </div>
      )}

      {/* 4 Primary Summary Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Videos */}
        <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Videos</span>
            <div className="p-2 rounded-lg bg-slate-800 dark:bg-dark-bg text-brand-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {totalVideosCount}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">{processedVideosCount} processed</span>
            {unavailableCount > 0 && (
              <>
                <span>•</span>
                <span className="text-yellow-400">{unavailableCount} private/hidden</span>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Total Duration */}
        <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Duration</span>
            <div className="p-2 rounded-lg bg-slate-800 dark:bg-dark-bg text-brand-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatClockTime(totalDurationSeconds)}
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate" title={detailedTotal.formatted}>
            {detailedTotal.formatted}
          </div>
        </div>

        {/* Card 3: Average Video Duration */}
        <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Video Length</span>
            <div className="p-2 rounded-lg bg-slate-800 dark:bg-dark-bg text-brand-400">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatClockTime(averageDurationSeconds)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {formatDetailedDuration(averageDurationSeconds).concise} per video
          </div>
        </div>

        {/* Card 4: Estimated Watch Time at 2x */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/30 dark:from-dark-card dark:via-dark-card dark:to-brand-900/20 border border-brand-500/30 shadow-glow-sm relative overflow-hidden group transition-all">
          <div className="flex items-center justify-between text-brand-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">At 2.0× Speed</span>
            <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatClockTime(halfDurationSeconds)}
          </div>
          <div className="mt-2 text-xs text-brand-300 font-medium flex items-center gap-1">
            <span>Saves {formatDetailedDuration(halfDurationSeconds).concise}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-brand-500/20 text-[10px] font-bold">50% faster</span>
          </div>
        </div>
      </div>
    </section>
  );
}
