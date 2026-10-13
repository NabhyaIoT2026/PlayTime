import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BarChart3, TrendingDown } from 'lucide-react';
import { calculateSpeedStats, formatClockTime, formatDetailedDuration } from '../utils/calculations.js';

const SPEEDS_FOR_CHART = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5];

export default function SpeedComparisonChart({ totalDurationSeconds, activeSpeed }) {
  if (!totalDurationSeconds || totalDurationSeconds <= 0) return null;

  const chartData = SPEEDS_FOR_CHART.map((speed) => {
    const stats = calculateSpeedStats(totalDurationSeconds, speed);
    const durationHours = Math.round((stats.adjustedSeconds / 3600) * 100) / 100;
    const savedHours = Math.round((stats.savedSeconds / 3600) * 100) / 100;

    return {
      speed: `${speed}×`,
      speedValue: speed,
      durationHours,
      adjustedSeconds: stats.adjustedSeconds,
      clockTime: stats.clockTime,
      savedHours,
      percentSaved: stats.percentSaved,
      detailed: stats.detailed.formatted,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900 dark:bg-dark-card border border-slate-700 dark:border-dark-border rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-white text-sm flex items-center gap-1.5">
            Speed: <span className="text-brand-400">{data.speed}</span>
          </p>
          <p className="text-slate-300">
            Total Watch Time: <strong className="text-white">{data.clockTime}</strong> ({data.durationHours} hrs)
          </p>
          {data.percentSaved > 0 ? (
            <p className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Saves {data.savedHours} hrs ({data.percentSaved}%)
            </p>
          ) : (
            <p className="text-slate-400">Baseline normal speed</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="mb-14 p-6 rounded-2xl bg-slate-900/80 dark:bg-dark-card/80 border border-slate-800 dark:border-dark-border shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Time-Saving Visualization</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Watch Time Compression Curve
          </h3>
        </div>
        <div className="text-xs text-slate-400">
          Showing required hours across speeds
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="speed" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={{ stroke: '#334155' }} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={{ stroke: '#334155' }} 
              unit="h" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="durationHours" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => {
                const isSelected = Math.abs(entry.speedValue - activeSpeed) < 0.05;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isSelected ? '#ff0033' : '#334155'}
                    stroke={isSelected ? '#ff0033' : '#475569'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 dark:border-dark-border flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#ff0033]" />
            <span>Active Speed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#334155]" />
            <span>Comparison Speeds</span>
          </div>
        </div>
        <span>Hover over bars to see precise time saved</span>
      </div>
    </section>
  );
}
