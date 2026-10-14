import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection.jsx';
import ResultsSummary from '../components/ResultsSummary.jsx';
import PlaybackSpeedSelector from '../components/PlaybackSpeedSelector.jsx';
import VideoList from '../components/VideoList.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ManualCalculatorModal from '../components/ManualCalculatorModal.jsx';
import { fetchPlaylist, getSamplePlaylist } from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';

export default function PlaylistCalculatorPage() {
  const {
    urlInput,
    setUrlInput,
    playlistData,
    setPlaylistData,
    selectedSpeed,
    setSelectedSpeed,
    addRecentSearch,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Calculate Playlist from URL
  const handleCalculate = async (inputUrl) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPlaylist(inputUrl);
      setPlaylistData(data);
      if (data && (data.playlistId || data.id)) {
        addRecentSearch({
          id: data.playlistId || data.id,
          title: data.title,
          channelTitle: data.channelTitle,
          totalVideosCount: data.totalVideosCount,
          totalDurationSeconds: data.totalDurationSeconds,
          url: inputUrl,
        });
      }
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Sample Demo Playlist
  const handleLoadSample = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sample = await getSamplePlaylist();
      setPlaylistData(sample);
      setUrlInput('');
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (manualData) => {
    setError(null);
    setPlaylistData(manualData);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setPlaylistData(null);
    setUrlInput('');
    setError(null);
    setSelectedSpeed(1.0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <HeroSection
        onCalculate={handleCalculate}
        onLoadSample={handleLoadSample}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        isLoading={isLoading}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
      />

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton />}

      {/* Error Alert Card */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => urlInput && handleCalculate(urlInput)}
          onLoadSample={handleLoadSample}
          onOpenManual={() => setIsManualModalOpen(true)}
        />
      )}

      {/* Calculated Results Dashboard */}
      {playlistData && !isLoading && (
        <div id="results-section">
          {/* 1. Summary Cards */}
          <ResultsSummary
            playlistData={playlistData}
            onReset={handleReset}
            selectedSpeed={selectedSpeed}
          />

          {/* 2. Playback Speed Selector (Interactive) */}
          <PlaybackSpeedSelector
            totalDurationSeconds={playlistData.totalDurationSeconds}
            selectedSpeed={selectedSpeed}
            onSelectSpeed={setSelectedSpeed}
          />

          {/* Study Planner Callout Banner */}
          <div className="mb-14 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Want to schedule this playlist into daily study sessions?
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculate required days, daily video targets, and completion dates on our dedicated Study Planner page.
                </p>
              </div>
            </div>
            <Link
              to="/planner"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-glow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Open Study Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3. Video Playlist Library List */}
          {playlistData.videos && playlistData.videos.length > 0 && (
            <VideoList
              videos={playlistData.videos}
              selectedSpeed={selectedSpeed}
            />
          )}
        </div>
      )}

      {/* Manual Duration Calculator Modal */}
      <ManualCalculatorModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmitManual={handleManualSubmit}
      />
    </div>
  );
}
