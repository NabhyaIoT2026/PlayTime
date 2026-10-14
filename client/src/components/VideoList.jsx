import React, { useState, useMemo } from 'react';
import { 
  ListOrdered, 
  Search, 
  ArrowUpDown, 
  ExternalLink, 
  Play, 
  Clock, 
  Zap, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Circle,
  RotateCcw,
  Sliders,
  CheckSquare,
  Sparkles,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatClockTime, formatDetailedDuration } from '../utils/calculations.js';
import { useApp } from '../context/AppContext.jsx';

export default function VideoList({ videos = [], selectedSpeed = 1.0 }) {
  const {
    playlistData,
    getWatchedVideos,
    toggleWatchedVideo,
    markAllWatched,
    clearWatchedVideos,
  } = useApp();

  const playlistId = playlistData?.playlistId || playlistData?.id || 'default_playlist';
  const watchedList = getWatchedVideos(playlistId);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchInDescription, setSearchInDescription] = useState(true);
  const [sortBy, setSortBy] = useState('position_asc');
  const [filterDuration, setFilterDuration] = useState('all'); // all, unwatched, watched, short, medium, long, unavailable
  const [viewMode, setViewMode] = useState('cards'); // cards or table
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDescMap, setExpandedDescMap] = useState({});
  const pageSize = 12;

  const toggleExpandDesc = (key) => {
    setExpandedDescMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Custom Range State
  const [isRangeActive, setIsRangeActive] = useState(false);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(videos.length || 1);

  // Calculate Watched Statistics across entire playlist
  const watchedStats = useMemo(() => {
    let watchedSeconds = 0;
    let watchedCount = 0;

    videos.forEach((v) => {
      const vidKey = v.id || v.playlistItemId || String(v.position);
      if (watchedList.includes(vidKey)) {
        watchedCount++;
        watchedSeconds += v.durationSeconds || 0;
      }
    });

    const totalSec = videos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
    const remainingSec = Math.max(0, totalSec - watchedSeconds);
    const remainingAdjustedSec = Math.round(remainingSec / selectedSpeed);
    const percentWatched = videos.length > 0 ? Math.round((watchedCount / videos.length) * 100) : 0;

    return {
      watchedCount,
      totalCount: videos.length,
      watchedSeconds,
      remainingSec,
      remainingAdjustedSec,
      percentWatched,
      remainingClock: formatClockTime(remainingAdjustedSec),
      remainingDetailed: formatDetailedDuration(remainingAdjustedSec),
    };
  }, [videos, watchedList, selectedSpeed]);

  // Handle Custom Range Slicing
  const rangedVideos = useMemo(() => {
    if (!isRangeActive) return videos;
    const start = Math.max(1, Number(rangeStart) || 1);
    const end = Math.max(start, Number(rangeEnd) || videos.length);
    return videos.filter((v) => {
      const pos = v.position || 1;
      return pos >= start && pos <= end;
    });
  }, [videos, isRangeActive, rangeStart, rangeEnd]);

  // Range-specific duration summary
  const rangeDurationStats = useMemo(() => {
    if (!isRangeActive) return null;
    const sec = rangedVideos.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
    const adjSec = Math.round(sec / selectedSpeed);
    return {
      count: rangedVideos.length,
      totalSeconds: sec,
      adjustedSeconds: adjSec,
      clock: formatClockTime(adjSec),
      detailed: formatDetailedDuration(adjSec),
    };
  }, [rangedVideos, isRangeActive, selectedSpeed]);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    return rangedVideos
      .filter((video) => {
        const vidKey = video.id || video.playlistItemId || String(video.position);
        const isWatched = watchedList.includes(vidKey);

        // Watched status filter
        if (filterDuration === 'watched' && !isWatched) return false;
        if (filterDuration === 'unwatched' && isWatched) return false;

        // Search filter (Title, Channel, and Optional Description)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = (video.title || '').toLowerCase().includes(term);
          const matchChannel = (video.channelTitle || '').toLowerCase().includes(term);
          const matchDesc = searchInDescription && (video.description || '').toLowerCase().includes(term);
          if (!matchTitle && !matchChannel && !matchDesc) return false;
        }

        // Duration filter
        if (filterDuration === 'unavailable') {
          return video.isUnavailable;
        }
        if (filterDuration === 'short') {
          return !video.isUnavailable && video.durationSeconds < 600; // < 10 mins
        }
        if (filterDuration === 'medium') {
          return !video.isUnavailable && video.durationSeconds >= 600 && video.durationSeconds <= 1800; // 10-30 mins
        }
        if (filterDuration === 'long') {
          return !video.isUnavailable && video.durationSeconds > 1800; // > 30 mins
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'position_asc') {
          return (a.position || 0) - (b.position || 0);
        }
        if (sortBy === 'position_desc') {
          return (b.position || 0) - (a.position || 0);
        }
        if (sortBy === 'duration_desc') {
          return (b.durationSeconds || 0) - (a.durationSeconds || 0);
        }
        if (sortBy === 'duration_asc') {
          return (a.durationSeconds || 0) - (b.durationSeconds || 0);
        }
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [rangedVideos, watchedList, searchTerm, searchInDescription, sortBy, filterDuration]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVideos = filteredVideos.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleToggleWatch = (video) => {
    const key = video.id || video.playlistItemId || String(video.position);
    toggleWatchedVideo(playlistId, key);
  };

  const handleMarkAllVisible = () => {
    const visibleKeys = filteredVideos.map((v) => v.id || v.playlistItemId || String(v.position));
    markAllWatched(playlistId, [...watchedList, ...visibleKeys]);
  };

  const handleClearWatched = () => {
    clearWatchedVideos(playlistId);
  };

  // Helper to highlight matching terms or show snippet
  const getHighlightSnippet = (text, query) => {
    if (!text || !query.trim()) return null;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(query.toLowerCase());
    if (idx === -1) return null;

    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + query.length + 50);
    const snippet = (start > 0 ? '…' : '') + text.substring(start, end) + (end < text.length ? '…' : '');
    return snippet;
  };

  return (
    <section className="mb-14 scroll-mt-24">
      {/* ── Watch Progress Bar & Stats Banner ─────────────────────── */}
      <div className="mb-6 p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Watch Progress Tracker</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
                  {watchedStats.percentWatched}%
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {watchedStats.watchedCount} of {watchedStats.totalCount} videos completed •{' '}
                <strong className="text-slate-200">
                  {watchedStats.remainingDetailed.concise} remaining
                </strong>{' '}
                at {selectedSpeed}× speed
              </p>
            </div>
          </div>

          {/* Quick Progress Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleMarkAllVisible}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Mark visible videos as watched"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark All Watched</span>
            </button>
            {watchedStats.watchedCount > 0 && (
              <button
                type="button"
                onClick={handleClearWatched}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Reset progress for this playlist"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${watchedStats.percentWatched}%` }}
          />
        </div>
      </div>

      {/* ── Custom Range Selector Tray ────────────────────────────── */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 dark:border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-range"
              checked={isRangeActive}
              onChange={(e) => setIsRangeActive(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="enable-range" className="text-xs sm:text-sm font-semibold text-white cursor-pointer flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand-400" />
              <span>Calculate Custom Range (e.g. Episode #X to #Y)</span>
            </label>
          </div>

          {isRangeActive && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">From Video:</span>
              <input
                type="number"
                min="1"
                max={videos.length}
                value={rangeStart}
                onChange={(e) => setRangeStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-bold"
              />
              <span className="text-slate-400">To:</span>
              <input
                type="number"
                min={rangeStart}
                max={videos.length}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Math.max(rangeStart, parseInt(e.target.value, 10) || rangeStart))}
                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-white font-bold"
              />
              <button
                type="button"
                onClick={() => {
                  setRangeStart(1);
                  setRangeEnd(videos.length);
                }}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Range Result Callout */}
        {isRangeActive && rangeDurationStats && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-300 bg-brand-500/10 px-3 py-2 rounded-lg">
            <span>
              🎯 Videos #{rangeStart} to #{rangeEnd} ({rangeDurationStats.count} videos):
            </span>
            <span>
              Total duration: <strong>{rangeDurationStats.detailed.formatted}</strong> • At {selectedSpeed}×:{' '}
              <strong className="text-white font-mono">{rangeDurationStats.clock}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Header & View Mode Controls ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Playlist Breakdown</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Video Library</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
              {filteredVideos.length} of {videos.length} videos
            </span>
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 dark:bg-dark-card border border-slate-800 dark:border-dark-border rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === 'cards' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              viewMode === 'table' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Table View"
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* ── Filter and Search Bar ───────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 dark:border-dark-border mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 ml-3 absolute top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                searchInDescription
                  ? "Search by title, channel, or keywords inside descriptions..."
                  : "Search by video title or channel..."
              }
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Duration Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterDuration}
              onChange={(e) => {
                setFilterDuration(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Videos</option>
              <option value="unwatched">⏳ Unwatched Only</option>
              <option value="watched">✅ Watched Only</option>
              <option value="short">Short (&lt; 10 mins)</option>
              <option value="medium">Medium (10–30 mins)</option>
              <option value="long">Long (&gt; 30 mins)</option>
              <option value="unavailable">Unavailable / Private</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="position_asc">Playlist Order (1 → N)</option>
              <option value="position_desc">Reverse Order (N → 1)</option>
              <option value="duration_desc">Duration (Longest first)</option>
              <option value="duration_asc">Duration (Shortest first)</option>
              <option value="title_asc">Title (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Search Options Sub-Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={searchInDescription}
              onChange={(e) => {
                setSearchInDescription(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-3.5 h-3.5 rounded text-brand-500 accent-brand-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              <span>Search through video descriptions</span>
            </span>
          </label>

          {searchTerm.trim() && (
            <span className="text-[11px] text-brand-300">
              Found {filteredVideos.length} matching {filteredVideos.length === 1 ? 'video' : 'videos'}
            </span>
          )}
        </div>
      </div>

      {/* ── Video Listing Render ─────────────────────────────────── */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 dark:bg-dark-card/40 border border-slate-800 text-slate-400">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-white">No matching videos found</p>
          <p className="text-xs mt-1">
            {searchInDescription
              ? "No videos found matching your keyword in titles, channels, or descriptions."
              : "Try enabling 'Search through video descriptions' or adjusting your filters."}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDuration('all');
              setIsRangeActive(false);
            }}
            className="mt-3 px-3 py-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedVideos.map((video) => {
            const vidKey = video.id || video.playlistItemId || String(video.position);
            const isWatched = watchedList.includes(vidKey);
            const adjustedSec = Math.round((video.durationSeconds || 0) / selectedSpeed);
            const isDifferentSpeed = Math.abs(selectedSpeed - 1.0) > 0.01;
            const isDescExpanded = !!expandedDescMap[vidKey];

            // Check if description matched query
            const descSnippet = searchTerm.trim() && searchInDescription 
              ? getHighlightSnippet(video.description, searchTerm)
              : null;

            return (
              <div
                key={video.playlistItemId || video.id}
                className={`group p-3 rounded-xl border shadow-md flex flex-col justify-between transition-all ${
                  isWatched
                    ? 'bg-slate-950/70 border-emerald-900/50 opacity-75 hover:opacity-100'
                    : 'bg-slate-900/90 dark:bg-dark-card/90 border-slate-800 dark:border-dark-border hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800 mb-2.5">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          isWatched ? 'grayscale-[50%]' : ''
                        }`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800/80 text-slate-400">
                        <Play className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Position Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-bold text-white">
                      #{video.position}
                    </div>

                    {/* Watched Toggle Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleWatch(video)}
                      className={`absolute top-2 right-2 p-1 rounded-md backdrop-blur-md transition-all ${
                        isWatched
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
                      }`}
                      title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                    >
                      {isWatched ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[11px] font-mono font-bold text-white">
                      {video.isUnavailable ? 'Unavailable' : formatClockTime(video.durationSeconds)}
                    </div>
                  </div>

                  {/* Title & Status */}
                  <h4
                    className={`text-xs sm:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors ${
                      isWatched ? 'text-slate-400 line-through' : 'text-white'
                    }`}
                  >
                    {video.title}
                  </h4>

                  {video.channelTitle && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {video.channelTitle}
                    </p>
                  )}

                  {/* Description match snippet or description drawer */}
                  {descSnippet && (
                    <div className="mt-2 p-1.5 rounded bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-300">
                      <span className="font-semibold block text-[10px] uppercase tracking-wider text-brand-400 mb-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Matched in description:</span>
                      </span>
                      <p className="italic line-clamp-2">"{descSnippet}"</p>
                    </div>
                  )}

                  {/* Expandable description if present */}
                  {video.description && !descSnippet && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpandDesc(vidKey)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{isDescExpanded ? 'Hide description' : 'Show description'}</span>
                        {isDescExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                      </button>
                      {isDescExpanded && (
                        <p className="text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer info */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 dark:border-dark-border/80 flex items-center justify-between text-[11px]">
                  {video.isUnavailable ? (
                    <span className="text-yellow-400 font-medium">
                      {video.statusReason || 'Private Video'}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-brand-500" />
                      {isDifferentSpeed ? (
                        <span>
                          <strong className="text-white">{formatClockTime(adjustedSec)}</strong>
                          <span className="text-[10px] text-slate-400 ml-1">(@ {selectedSpeed}×)</span>
                        </span>
                      ) : (
                        <span>{formatClockTime(video.durationSeconds)}</span>
                      )}
                    </div>
                  )}

                  {video.id && !video.isUnavailable && (
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                      title="Watch on YouTube"
                    >
                      <span>Watch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-slate-800 dark:border-dark-border overflow-hidden bg-slate-900/80 dark:bg-dark-card/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-800/70 dark:bg-dark-bg/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">Done</th>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Video Title & Description</th>
                  <th className="py-3 px-4">Original Duration</th>
                  <th className="py-3 px-4">At {selectedSpeed}×</th>
                  <th className="py-3 px-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 dark:divide-dark-border/60">
                {paginatedVideos.map((video) => {
                  const vidKey = video.id || video.playlistItemId || String(video.position);
                  const isWatched = watchedList.includes(vidKey);
                  const adjustedSec = Math.round((video.durationSeconds || 0) / selectedSpeed);
                  const descSnippet = searchTerm.trim() && searchInDescription 
                    ? getHighlightSnippet(video.description, searchTerm)
                    : null;

                  return (
                    <tr
                      key={video.playlistItemId || video.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isWatched ? 'bg-slate-950/40 text-slate-400' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleWatch(video)}
                          className={`p-1 rounded transition-colors ${
                            isWatched ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title={isWatched ? 'Mark unwatched' : 'Mark watched'}
                        >
                          {isWatched ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-400 text-center">
                        {video.position}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`font-semibold line-clamp-1 max-w-md ${
                            isWatched ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {video.title}
                        </div>
                        {video.isUnavailable && (
                          <span className="text-[10px] text-yellow-400 font-medium block">
                            {video.statusReason || 'Unavailable video'}
                          </span>
                        )}
                        {descSnippet && (
                          <div className="mt-1 text-[11px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded inline-block max-w-md truncate">
                            <span className="font-semibold text-[10px] uppercase">Desc match:</span> "{descSnippet}"
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {video.isUnavailable ? '—' : formatClockTime(video.durationSeconds)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-brand-400">
                        {video.isUnavailable ? '—' : formatClockTime(adjustedSec)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {video.id && !video.isUnavailable ? (
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-brand-400"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination Controls ─────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {(safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredVideos.length)} of {filteredVideos.length} videos
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg bg-slate-800 dark:bg-dark-card border border-slate-700 dark:border-dark-border disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-white px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 dark:bg-dark-card border border-slate-700 dark:border-dark-border disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
