import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="mb-14 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-10 bg-slate-800/60 dark:bg-dark-card/60 rounded-xl w-3/4 mx-auto" />

      {/* Title & Action Bar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="h-4 bg-slate-800/80 rounded w-32" />
          <div className="h-8 bg-slate-800 rounded w-72" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-slate-800 rounded-lg w-24" />
          <div className="h-9 bg-slate-800 rounded-lg w-20" />
        </div>
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-3 bg-slate-800 rounded w-20" />
              <div className="w-8 h-8 rounded-lg bg-slate-800" />
            </div>
            <div className="h-8 bg-slate-700/80 rounded w-28" />
            <div className="h-3 bg-slate-800 rounded w-36" />
          </div>
        ))}
      </div>

      {/* Speed Selector Skeleton */}
      <div className="p-6 rounded-2xl bg-slate-900/60 dark:bg-dark-card/60 border border-slate-800 space-y-4">
        <div className="h-5 bg-slate-800 rounded w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
            <div key={s} className="h-20 bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
