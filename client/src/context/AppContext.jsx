import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkBackendStatus } from '../services/api.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state (Dark mode default)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('playtime_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  // API Backend Status
  const [apiStatus, setApiStatus] = useState(null);

  // Shared Playlist Data
  const [urlInput, setUrlInput] = useState('');
  const [playlistData, setPlaylistData] = useState(null);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);

  // Sync theme with <html> class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('playtime_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('playtime_theme', 'light');
    }
  }, [isDark]);

  // Initial Backend Status Check
  useEffect(() => {
    async function initStatus() {
      const status = await checkBackendStatus();
      setApiStatus(status);
    }
    initStatus();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        apiStatus,
        urlInput,
        setUrlInput,
        playlistData,
        setPlaylistData,
        selectedSpeed,
        setSelectedSpeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
