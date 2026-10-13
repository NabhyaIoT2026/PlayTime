import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart2, 
  Search, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Film, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon,
  X,
  ClipboardPaste,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  FileSearch,
} from 'lucide-react';
import { fetchChannelAnalytics, getSampleChannel } from '../services/api.js';
import { formatClockTime } from '../utils/calculations.js';

// Number formatter: 1,400,000 -> 1.4M
function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  const n = Number(num);
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

export default function ChannelAnalyticsSection() {
  const [channelInput, setChannelInput] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('views_desc');
  const [filterDuration, setFilterDuration] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Pagination
  const VIDEOS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search / sort / filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, filterDuration, channelData]);

  // Toggle individual description expand
  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!channelInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchChannelAnalytics(channelInput.trim());
      setChannelData(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze channel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSampleChannel();
      setChannelData(data);
      setChannelInput('@codecraftengineering');
    } catch (err) {
      setError(err.message || 'Failed to load sample channel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setChannelInput(text.trim());
    } catch {
      // ignore
    }
  };

  // Filtered and Sorted Videos
  const filteredVideos = useMemo(() => {
    if (!channelData?.videos) return [];

    return channelData.videos
      .filter((video) => {
        // Search in title AND description
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = (video.title || '').toLowerCase().includes(term);
          const matchDesc = (video.description || '').toLowerCase().includes(term);
          if (!matchTitle && !matchDesc) return false;
        }

        // Duration filters
        if (filterDuration === 'shorts') {
          return video.durationSeconds > 0 && video.durationSeconds <= 60;
        }
        if (filterDuration === 'short') {
          return video.durationSeconds > 60 && video.durationSeconds < 600;
        }
        if (filterDuration === 'medium') {
          return video.durationSeconds >= 600 && video.durationSeconds <= 1800;
        }
        if (filterDuration === 'long') {
          return video.durationSeconds > 1800;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'views_desc') return (b.viewCount || 0) - (a.viewCount || 0);
        if (sortBy === 'likes_desc') return (b.likeCount || 0) - (a.likeCount || 0);
        if (sortBy === 'comments_desc') return (b.commentCount || 0) - (a.commentCount || 0);
        if (sortBy === 'engagement_desc') return (b.engagementRate || 0) - (a.engagementRate || 0);
        if (sortBy === 'newest') return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
        if (sortBy === 'oldest') return new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0);
        if (sortBy === 'duration_desc') return (b.durationSeconds || 0) - (a.durationSeconds || 0);
        return 0;
      });
  }, [channelData, searchTerm, sortBy, filterDuration]);

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));
  const pagedVideos = filteredVideos.slice(
    (currentPage - 1) * VIDEOS_PER_PAGE,
    currentPage * VIDEOS_PER_PAGE
  );

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <section id="channel-analytics" className="mb-24 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Channel Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          YouTube Channel Analytics & Search
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Enter any channel link or handle to analyze likes, views, comments, and search video libraries using full descriptions.
        </p>
      </div>

      {/* Channel URL Input Box */}
      <div className="max-w-3xl mx-auto mb-10">
        <form
          onSubmit={handleSearch}
          className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/95 border border-slate-700/80 dark:border-dark-border shadow-xl backdrop-blur-xl focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20"
        >
          <div className="relative flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center">
              <Users className="w-5 h-5 text-slate-400 ml-3.5 absolute pointer-events-none" />
              <input
                type="text"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                placeholder="Enter channel link or handle (e.g. @mkbhd, youtube.com/@veritasium)"
                className="w-full pl-11 pr-16 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 bg-transparent rounded-xl focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {channelInput && (
                  <button
                    type="button"
                    onClick={() => setChannelInput('')}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    title="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="p-1.5 text-slate-400 hover:text-brand-400 rounded-lg hover:bg-slate-800"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-brand-600 to-red-600 hover:from-brand-500 hover:to-red-500 text-white text-sm font-semibold rounded-xl shadow-glow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Channel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
          <span>Supports @handles, channel URLs, and channel IDs.</span>
          <button
            type="button"
            onClick={handleLoadSample}
            className="hover:text-brand-400 underline decoration-slate-600 hover:decoration-brand-400 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Channel (@codecraftengineering)</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error analyzing channel</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Channel Analytics Dashboard */}
      {channelData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Channel Profile Banner & Identity Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-xl relative overflow-hidden">
            {channelData.isSample && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Channel Analytics</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Avatar & Title */}
              <div className="flex items-center gap-4">
                <img
                  src={channelData.channel.thumbnail}
                  alt={channelData.channel.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-lg"
                />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {channelData.channel.title}
                    {channelData.channel.id && !channelData.isSample && (
                      <a
                        href={`https://www.youtube.com/channel/${channelData.channel.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-brand-400 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </h3>
                  <p className="text-sm text-brand-400 font-medium">
                    {channelData.channel.customUrl || '@channel'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                    {channelData.channel.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Overall Channel Metrics Pills */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4 shrink-0">
                <div className="px-4 py-2.5 rounded-xl bg-slate-800/60 dark:bg-dark-bg/60 border border-slate-700/60 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscribers</span>
                  <span className="text-lg font-extrabold text-white">
                    {formatNumber(channelData.channel.subscriberCount)}
                  </span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-slate-800/60 dark:bg-dark-bg/60 border border-slate-700/60 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Channel Views</span>
                  <span className="text-lg font-extrabold text-white">
                    {formatNumber(channelData.channel.totalViewCount)}
                  </span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-slate-800/60 dark:bg-dark-bg/60 border border-slate-700/60 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Videos</span>
                  <span className="text-lg font-extrabold text-white">
                    {channelData.channel.videoCount || channelData.videos.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Video Aggregated Analytics Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Analyzed Views */}
            <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Analyzed Views</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatNumber(channelData.analytics.totalViews)}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Avg. {formatNumber(channelData.analytics.averageViews)} per video
              </div>
            </div>

            {/* Total Likes */}
            <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ThumbsUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatNumber(channelData.analytics.totalLikes)}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Avg. {formatNumber(channelData.analytics.averageLikes)} per video
              </div>
            </div>

            {/* Total Comments */}
            <div className="p-5 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Comments</span>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatNumber(channelData.analytics.totalComments)}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Avg. {formatNumber(channelData.analytics.averageComments)} per video
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/30 border border-brand-500/30 shadow-glow-sm">
              <div className="flex items-center justify-between text-brand-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Engagement Rate</span>
                <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {channelData.analytics.engagementRate}%
              </div>
              <div className="mt-2 text-xs text-brand-300 font-medium">
                (Likes + Comments) ÷ Views
              </div>
            </div>
          </div>

          {/* Video Library Search & Filtering Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 dark:bg-dark-card/80 border border-slate-800 dark:border-dark-border shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Channel Uploads Explorer</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
                  </span>
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <FileSearch className="w-3 h-3 text-brand-500" />
                  Searches inside titles <strong className="text-slate-300">and</strong> full descriptions
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-800 dark:bg-dark-bg border border-slate-700/60 rounded-xl self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                    viewMode === 'cards' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
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
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>
            </div>

            {/* Search Input using Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 ml-3 absolute top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title OR description keywords..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="md:col-span-3 flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="views_desc">Most Views</option>
                  <option value="likes_desc">Most Likes</option>
                  <option value="comments_desc">Most Comments</option>
                  <option value="engagement_desc">Highest Engagement</option>
                  <option value="newest">Newest Uploads</option>
                  <option value="oldest">Oldest Uploads</option>
                  <option value="duration_desc">Longest Duration</option>
                </select>
              </div>

              {/* Duration Filter Dropdown */}
              <div className="md:col-span-3 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-800 dark:bg-dark-bg border border-slate-700 dark:border-dark-border rounded-xl text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="all">All Durations</option>
                  <option value="shorts">Shorts (&lt; 60s)</option>
                  <option value="short">Short (&lt; 10 mins)</option>
                  <option value="medium">Medium (10–30 mins)</option>
                  <option value="long">Long (&gt; 30 mins)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render Videos */}
          {filteredVideos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
              <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="font-semibold text-white">No videos matched your description or filter</p>
              <p className="text-xs mt-1">Try another search keyword or reset filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterDuration('all');
                }}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
              >
                Clear Search
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* Card Grid View — 2 columns = 4 rows × 2 cols = 8 videos/page */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pagedVideos.map((video) => {
                const isExpanded = expandedDescriptions[video.id];

                return (
                  <div
                    key={video.id}
                    className="p-4 rounded-2xl bg-slate-900/90 dark:bg-dark-card/90 border border-slate-800 dark:border-dark-border hover:border-slate-700 shadow-lg flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Thumbnail & Duration */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 mb-3">
                        {video.thumbnail && (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[11px] font-mono font-bold text-white">
                          {formatClockTime(video.durationSeconds)}
                        </div>
                      </div>

                      {/* Video Title */}
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors">
                        {video.title}
                      </h4>

                      {/* Video Stats Bar (Views, Likes, Comments) */}
                      <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-800/50 dark:bg-dark-bg/60 border border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Views</span>
                          <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3 text-blue-400" />
                            {formatNumber(video.viewCount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Likes</span>
                          <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-400" />
                            {formatNumber(video.likeCount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Comments</span>
                          <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                            <MessageSquare className="w-3 h-3 text-purple-400" />
                            {formatNumber(video.commentCount)}
                          </span>
                        </div>
                      </div>

                      {/* Description Preview */}
                      {video.description && (
                        <div className="mt-3 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                          <p className={`leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {video.description}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleDescription(video.id)}
                            className="mt-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <>
                                <span>Show less</span>
                                <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>Read description</span>
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer: Date & Direct Link */}
                    <div className="mt-4 pt-3 border-t border-slate-800 dark:border-dark-border flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ''}
                      </span>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Watch Video</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
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
                      <th className="py-3 px-4">Video Title</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4">Likes</th>
                      <th className="py-3 px-4">Comments</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 dark:divide-dark-border/60">
                    {pagedVideos.map((video) => (
                      <tr key={video.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-semibold text-white line-clamp-1">
                            {video.title}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {video.description}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          {formatNumber(video.viewCount)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {formatNumber(video.likeCount)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-400">
                          {formatNumber(video.commentCount)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {formatClockTime(video.durationSeconds)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold text-xs"
                          >
                            <span>Watch</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Pagination Controls ─────────────────────────── */}
          {filteredVideos.length > VIDEOS_PER_PAGE && (
            <div className="flex items-center justify-between pt-2">
              {/* Left: page info */}
              <p className="text-xs text-slate-400">
                Showing{' '}
                <span className="text-white font-semibold">
                  {(currentPage - 1) * VIDEOS_PER_PAGE + 1}–{Math.min(currentPage * VIDEOS_PER_PAGE, filteredVideos.length)}
                </span>{' '}
                of{' '}
                <span className="text-white font-semibold">{filteredVideos.length}</span>{' '}
                videos
              </p>

              {/* Right: prev / page bubbles / next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>

                {/* Page number bubbles (show up to 5) */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 5) return true;
                      if (p === 1 || p === totalPages) return true;
                      return Math.abs(p - currentPage) <= 1;
                    })
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-500 text-xs">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === item
                              ? 'bg-brand-600 text-white shadow-glow-sm'
                              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )
                  }
                </div>

                {/* Mobile: just current/total */}
                <span className="sm:hidden text-xs text-slate-400 font-medium">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
