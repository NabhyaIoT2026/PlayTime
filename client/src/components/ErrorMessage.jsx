import React from 'react';
import { AlertCircle, Zap, Sliders, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ error, onRetry, onLoadSample, onOpenManual }) {
  if (!error) return null;

  const isMissingKey = error.code === 'API_KEY_NOT_CONFIGURED' || error.code === 'API_KEY_MISSING';
  const isNotFound = error.code === 'PLAYLIST_NOT_FOUND';
  const isQuota = error.code === 'QUOTA_EXCEEDED';

  return (
    <div className="mb-12 p-6 rounded-2xl bg-red-950/20 border border-red-500/30 text-left shadow-xl max-w-3xl mx-auto backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-base font-bold text-white">
              {isMissingKey
                ? 'YouTube API Key Not Configured on Server'
                : isQuota
                ? 'YouTube API Quota Limit Exceeded'
                : isNotFound
                ? 'Playlist Not Found or Set to Private'
                : 'Unable to Calculate Playlist'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {error.message || error.toString()}
            </p>
          </div>

          {/* Contextual guidance */}
          {isMissingKey && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-200">How to configure your API key:</p>
              <p>Add your YouTube Data API v3 key in <code className="text-brand-400 bg-black/40 px-1 py-0.5 rounded">server/.env</code> as <code className="text-brand-400 bg-black/40 px-1 py-0.5 rounded">YOUTUBE_API_KEY=your_key</code> and restart the server.</p>
              <p className="text-emerald-400 mt-1">Meanwhile, you can use our instant Demo Mode or Manual Duration Calculator below!</p>
            </div>
          )}

          {/* Action Fallback Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onLoadSample}
              className="px-3.5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Explore Demo Course</span>
            </button>

            <button
              type="button"
              onClick={onOpenManual}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manual Calculator</span>
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
