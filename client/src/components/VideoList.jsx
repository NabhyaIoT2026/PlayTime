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
  Table as TableIcon
} from 'lucide-react';
import { formatClockTime } from '../utils/calculations.js';

export default function VideoList({ videos = [], selectedSpeed = 1.0 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('position_asc');
  const [filterDuration, setFilterDuration] = useState('all'); // all, short (<10m), medium (10-30m), long (>30m), unavailable
  const [viewMode, setViewMode] = useState('cards'); // cards or table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = (video.title || '').toLowerCase().includes(term);
          const matchChannel = (video.channelTitle || '').toLowerCase().includes(term);
          if (!matchTitle && !matchChannel) return false;
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
  }, [videos, searchTerm, sortBy, filterDuration]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVideos = filteredVideos.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className="mb-14 scroll-mt-24">
      {/* Header & Controls */}
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

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 dark:border-dark-border mb-6 flex flex-col md:flex-row items-center gap-3">
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
            placeholder="Search by video title..."
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
            <option value="all">All Durations</option>
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

      {/* Render Empty State */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 dark:bg-dark-card/40 border border-slate-800 text-slate-400">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-white">No matching videos found</p>
          <p className="text-xs mt-1">Try clearing your search keyword or relaxing filters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDuration('all');
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
            const adjustedSec = Math.round((video.durationSeconds || 0) / selectedSpeed);
            const isDifferentSpeed = Math.abs(selectedSpeed - 1.0) > 0.01;

            return (
              <div
                key={video.playlistItemId || video.id}
                className="group p-3 rounded-xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border hover:border-slate-700 shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800 mb-2.5">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[11px] font-mono font-bold text-white">
                      {video.isUnavailable ? 'Unavailable' : formatClockTime(video.durationSeconds)}
                    </div>
                  </div>

                  {/* Title & Status */}
                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors">
                    {video.title}
                  </h4>

                  {video.channelTitle && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {video.channelTitle}
                    </p>
                  )}
                </div>

                {/* Footer info: Speed calculation & YouTube link */}
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
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Video Title</th>
                  <th className="py-3 px-4">Original Duration</th>
                  <th className="py-3 px-4">At {selectedSpeed}×</th>
                  <th className="py-3 px-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 dark:divide-dark-border/60">
                {paginatedVideos.map((video) => {
                  const adjustedSec = Math.round((video.durationSeconds || 0) / selectedSpeed);

                  return (
                    <tr key={video.playlistItemId || video.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400 text-center">
                        {video.position}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white line-clamp-1 max-w-md">
                          {video.title}
                        </div>
                        {video.isUnavailable && (
                          <span className="text-[10px] text-yellow-400 font-medium">
                            {video.statusReason || 'Unavailable video'}
                          </span>
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

      {/* Pagination Controls */}
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
