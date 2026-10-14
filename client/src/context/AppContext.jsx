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

  // 1. Search History (Stored in localStorage)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('playtime_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (item) => {
    if (!item || !item.id) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id);
      const updated = [
        {
          id: item.id,
          title: item.title || 'Untitled Playlist',
          channelTitle: item.channelTitle || '',
          totalVideosCount: item.totalVideosCount || 0,
          totalDurationSeconds: item.totalDurationSeconds || 0,
          url: item.url || '',
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, 8);
      localStorage.setItem('playtime_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (id) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('playtime_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('playtime_recent_searches');
  };

  // 2. Bookmarks / Pinned Playlists
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('playtime_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (item) => {
    if (!item || !item.id) return;
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      let updated;
      if (exists) {
        updated = prev.filter((b) => b.id !== item.id);
      } else {
        updated = [
          {
            id: item.id,
            title: item.title || 'Untitled Playlist',
            channelTitle: item.channelTitle || '',
            totalVideosCount: item.totalVideosCount || 0,
            totalDurationSeconds: item.totalDurationSeconds || 0,
            url: item.url || '',
            savedAt: Date.now(),
          },
          ...prev,
        ];
      }
      localStorage.setItem('playtime_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (id) => {
    if (!id) return false;
    return bookmarks.some((b) => b.id === id);
  };

  // 3. Watched Videos tracking per playlist
  const [watchedMap, setWatchedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('playtime_watched_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getWatchedVideos = (playlistId) => {
    if (!playlistId) return [];
    return watchedMap[playlistId] || [];
  };

  const toggleWatchedVideo = (playlistId, videoId) => {
    if (!playlistId || !videoId) return;
    setWatchedMap((prev) => {
      const current = prev[playlistId] || [];
      const updated = current.includes(videoId)
        ? current.filter((id) => id !== videoId)
        : [...current, videoId];

      const newMap = { ...prev, [playlistId]: updated };
      localStorage.setItem('playtime_watched_map', JSON.stringify(newMap));
      return newMap;
    });
  };

  const markAllWatched = (playlistId, videoIds = []) => {
    if (!playlistId) return;
    setWatchedMap((prev) => {
      const newMap = { ...prev, [playlistId]: Array.from(new Set(videoIds)) };
      localStorage.setItem('playtime_watched_map', JSON.stringify(newMap));
      return newMap;
    });
  };

  const clearWatchedVideos = (playlistId) => {
    if (!playlistId) return;
    setWatchedMap((prev) => {
      const newMap = { ...prev };
      delete newMap[playlistId];
      localStorage.setItem('playtime_watched_map', JSON.stringify(newMap));
      return newMap;
    });
  };

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
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        watchedMap,
        getWatchedVideos,
        toggleWatchedVideo,
        markAllWatched,
        clearWatchedVideos,
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
