import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import PlaylistCalculatorPage from './pages/PlaylistCalculatorPage.jsx';

import StudyPlannerPage from './pages/StudyPlannerPage.jsx';
import ChannelAnalyticsPage from './pages/ChannelAnalyticsPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0c10] text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<PlaylistCalculatorPage />} />

          <Route path="/planner" element={<StudyPlannerPage />} />
          <Route path="/analytics" element={<ChannelAnalyticsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}
