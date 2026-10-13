import React from 'react';
import ChannelAnalyticsSection from '../components/ChannelAnalyticsSection.jsx';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChannelAnalyticsPage() {
  return (
    <div className="pt-8 pb-20 max-w-6xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Calculator</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Dedicated Channel Intelligence</span>
        </div>
      </div>

      {/* Main Channel Analytics Component */}
      <ChannelAnalyticsSection />
    </div>
  );
}
