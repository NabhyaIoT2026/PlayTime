import { SAMPLE_PLAYLIST } from '../utils/sampleData.js';
import { SAMPLE_CHANNEL_DATA } from '../utils/sampleChannelData.js';

// If in dev with Vite proxy, use relative '/api', else allow VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/**
 * Checks server backend status and YouTube API key configuration.
 */
export async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      throw new Error(`Status check returned ${res.status}`);
    }
    const data = await res.json();
    return {
      connected: true,
      isApiKeyConfigured: data.isApiKeyConfigured,
      mode: data.mode,
      message: data.message,
    };
  } catch (err) {
    // If backend is not running or timeout occurred
    return {
      connected: false,
      isApiKeyConfigured: false,
      mode: 'client-standalone',
      message: 'Backend server is not detected. Demo Mode and Manual Calculator are fully active in browser.',
    };
  }
}

/**
 * Loads the curated sample demo playlist.
 */
export async function getSamplePlaylist() {
  try {
    const res = await fetch(`${API_BASE}/sample`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Fallback to local sample playlist data
  }
  return SAMPLE_PLAYLIST;
}

/**
 * Loads the curated sample channel analytics data.
 */
export async function getSampleChannel() {
  try {
    const res = await fetch(`${API_BASE}/channel/sample`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Fallback to local sample data
  }
  return SAMPLE_CHANNEL_DATA;
}

/**
 * Fetches playlist data from backend using YouTube Data API.
 *
 * @param {string} urlOrId
 * @returns {Promise<object>}
 */
export async function fetchPlaylist(urlOrId) {
  const encoded = encodeURIComponent(urlOrId.trim());
  let res;

  try {
    res = await fetch(`${API_BASE}/playlist?url=${encoded}`, {
      signal: AbortSignal.timeout(25000), // generous timeout for large multi-page playlists
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new Error('Playlist calculation timed out. The playlist might be too large or network is slow.');
    }
    throw new Error('Unable to reach backend server. Please verify the server is running on port 5000.');
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    const error = new Error(json.error || `Error ${res.status}: Failed to calculate playlist.`);
    error.code = json.code;
    error.playlistId = json.playlistId;
    throw error;
  }

  return json.data;
}

/**
 * Fetches channel analytics from backend using YouTube Data API.
 *
 * @param {string} urlOrHandle
 * @returns {Promise<object>}
 */
export async function fetchChannelAnalytics(urlOrHandle, maxVideos = 100) {
  const encoded = encodeURIComponent(urlOrHandle.trim());
  let res;

  try {
    res = await fetch(`${API_BASE}/channel?url=${encoded}&maxVideos=${maxVideos}`, {
      signal: AbortSignal.timeout(35000), // generous timeout for fetching multi-page channel videos
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new Error('Channel analytics request timed out.');
    }
    throw new Error('Unable to reach backend server. Please verify the server is running on port 5000.');
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    const error = new Error(json.error || `Error ${res.status}: Failed to fetch channel analytics.`);
    error.code = json.code;
    throw error;
  }

  return json.data;
}
