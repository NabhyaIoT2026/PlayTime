import axios from 'axios';
import { parseIsoDuration } from '../utils/durationParser.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_PAGES = 10; // Safety cap: up to 500 videos per playlist to prevent quota exhaustion

/**
 * Fetches playlist metadata, all video items (handling pagination), and video durations.
 *
 * @param {string} playlistId
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
export async function fetchPlaylistDetails(playlistId, apiKey) {
  if (!apiKey) {
    const error = new Error('YouTube API Key is not configured on the server.');
    error.statusCode = 503;
    error.code = 'API_KEY_MISSING';
    throw error;
  }

  if (!playlistId) {
    const error = new Error('Invalid or missing playlist ID.');
    error.statusCode = 400;
    error.code = 'INVALID_PLAYLIST_ID';
    throw error;
  }

  // 1. Fetch Playlist Metadata (Title, Channel, Description)
  let playlistSnippet = null;
  try {
    const plRes = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
      params: {
        part: 'snippet',
        id: playlistId,
        key: apiKey,
      },
      timeout: 10000,
    });

    if (!plRes.data.items || plRes.data.items.length === 0) {
      const error = new Error(`Playlist with ID "${playlistId}" was not found or is private.`);
      error.statusCode = 404;
      error.code = 'PLAYLIST_NOT_FOUND';
      throw error;
    }

    playlistSnippet = plRes.data.items[0].snippet;
  } catch (err) {
    handleAxiosError(err, 'Failed to fetch playlist information');
  }

  // 2. Fetch all playlist items (handling pagination)
  const rawItems = [];
  let nextPageToken = null;
  let pageCount = 0;

  do {
    pageCount++;
    try {
      const itemsRes = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails',
          maxResults: 50,
          playlistId: playlistId,
          pageToken: nextPageToken || undefined,
          key: apiKey,
        },
        timeout: 12000,
      });

      const items = itemsRes.data.items || [];
      rawItems.push(...items);
      nextPageToken = itemsRes.data.nextPageToken;
    } catch (err) {
      handleAxiosError(err, 'Failed to retrieve playlist items');
    }
  } while (nextPageToken && pageCount < MAX_PAGES);

  if (rawItems.length === 0) {
    return {
      playlistId,
      title: playlistSnippet?.title || 'Empty Playlist',
      channelTitle: playlistSnippet?.channelTitle || 'Unknown Channel',
      description: playlistSnippet?.description || '',
      totalVideosCount: 0,
      processedVideosCount: 0,
      unavailableCount: 0,
      totalDurationSeconds: 0,
      averageDurationSeconds: 0,
      videos: [],
    };
  }

  // 3. Extract video IDs (preserving original position order)
  const videoEntries = rawItems.map((item, index) => {
    const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    const title = item.snippet?.title || '';
    const description = item.snippet?.description || '';
    const isPrivateOrDeleted = 
      title === 'Private video' || 
      title === 'Deleted video' || 
      !videoId;

    return {
      playlistItemId: item.id,
      position: item.snippet?.position !== undefined ? item.snippet.position + 1 : index + 1,
      videoId,
      title,
      description,
      channelTitle: item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt,
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        '',
      isPrivateOrDeleted,
    };
  });

  // Extract unique valid video IDs for duration lookup
  const validVideoIds = [
    ...new Set(
      videoEntries
        .filter((v) => !v.isPrivateOrDeleted && v.videoId)
        .map((v) => v.videoId)
    ),
  ];

  // 4. Batch fetch video details (contentDetails, snippet, status) in chunks of 50
  const videoDetailsMap = new Map();
  const CHUNK_SIZE = 50;

  for (let i = 0; i < validVideoIds.length; i += CHUNK_SIZE) {
    const chunkIds = validVideoIds.slice(i, i + CHUNK_SIZE);
    try {
      const vidsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          part: 'contentDetails,snippet,status',
          id: chunkIds.join(','),
          key: apiKey,
        },
        timeout: 12000,
      });

      const detailsList = vidsRes.data.items || [];
      for (const vid of detailsList) {
        videoDetailsMap.set(vid.id, vid);
      }
    } catch (err) {
      handleAxiosError(err, 'Failed to fetch video durations');
    }
  }

  // 5. Merge items with duration and status details
  let totalDurationSeconds = 0;
  let unavailableCount = 0;

  const processedVideos = videoEntries.map((entry) => {
    if (entry.isPrivateOrDeleted) {
      unavailableCount++;
      return {
        id: entry.videoId || `unavailable-${entry.position}`,
        playlistItemId: entry.playlistItemId,
        position: entry.position,
        title: entry.title || 'Private or Deleted Video',
        channelTitle: entry.channelTitle,
        durationSeconds: 0,
        durationIso: 'PT0S',
        thumbnail: '',
        publishedAt: entry.publishedAt,
        isUnavailable: true,
        statusReason: entry.title.includes('Private') ? 'Private Video' : 'Deleted Video',
      };
    }

    const details = videoDetailsMap.get(entry.videoId);

    if (!details) {
      // Video was in playlist item list but not returned by videos.list (often deleted/region-blocked)
      unavailableCount++;
      return {
        id: entry.videoId,
        playlistItemId: entry.playlistItemId,
        position: entry.position,
        title: entry.title,
        channelTitle: entry.channelTitle,
        durationSeconds: 0,
        durationIso: 'PT0S',
        thumbnail: entry.thumbnail,
        publishedAt: entry.publishedAt,
        isUnavailable: true,
        statusReason: 'Unavailable or Region-Restricted',
      };
    }

    const durationIso = details.contentDetails?.duration || 'PT0S';
    const durationSeconds = parseIsoDuration(durationIso);
    totalDurationSeconds += durationSeconds;

    return {
      id: entry.videoId,
      playlistItemId: entry.playlistItemId,
      position: entry.position,
      title: details.snippet?.title || entry.title,
      channelTitle: details.snippet?.channelTitle || entry.channelTitle,
      description: details.snippet?.description || entry.description || '',
      durationSeconds,
      durationIso,
      thumbnail:
        details.snippet?.thumbnails?.medium?.url ||
        details.snippet?.thumbnails?.default?.url ||
        entry.thumbnail,
      publishedAt: details.snippet?.publishedAt || entry.publishedAt,
      isUnavailable: false,
    };
  });

  const processedCount = processedVideos.length - unavailableCount;
  const averageDurationSeconds = processedCount > 0 
    ? Math.round(totalDurationSeconds / processedCount) 
    : 0;

  return {
    playlistId,
    title: playlistSnippet?.title || 'YouTube Playlist',
    channelTitle: playlistSnippet?.channelTitle || 'Unknown Channel',
    description: playlistSnippet?.description || '',
    totalVideosCount: processedVideos.length,
    processedVideosCount: processedCount,
    unavailableCount,
    totalDurationSeconds,
    averageDurationSeconds,
    videos: processedVideos,
  };
}

/**
 * Fetches Channel Metadata, Uploaded Videos, and Full Statistics (Views, Likes, Comments, Descriptions).
 *
 * @param {{ type: 'handle'|'channelId'|'username', value: string }} identifier
 * @param {string} apiKey
 * @returns {Promise<object>}
 */
export async function fetchChannelAnalytics(identifier, apiKey, maxVideos = 100) {
  if (!apiKey) {
    const error = new Error('YouTube API Key is not configured on the server.');
    error.statusCode = 503;
    error.code = 'API_KEY_MISSING';
    throw error;
  }

  // 1. Resolve Channel
  const params = {
    part: 'snippet,contentDetails,statistics',
    key: apiKey,
  };

  if (identifier.type === 'channelId') {
    params.id = identifier.value;
  } else if (identifier.type === 'handle') {
    params.forHandle = identifier.value;
  } else {
    params.forUsername = identifier.value;
  }

  let channelData = null;
  try {
    const res = await axios.get(`${YOUTUBE_API_BASE}/channels`, { params, timeout: 12000 });
    const items = res.data.items || [];
    if (items.length === 0 && identifier.type === 'username') {
      // Try handle fallback if username failed
      const handleRes = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          forHandle: `@${identifier.value}`,
          key: apiKey,
        },
        timeout: 12000,
      });
      if (handleRes.data.items && handleRes.data.items.length > 0) {
        channelData = handleRes.data.items[0];
      }
    } else if (items.length > 0) {
      channelData = items[0];
    }
  } catch (err) {
    handleAxiosError(err, 'Failed to resolve YouTube channel');
  }

  if (!channelData) {
    const error = new Error(`Channel "${identifier.value}" was not found. Please verify the channel handle or URL.`);
    error.statusCode = 404;
    error.code = 'CHANNEL_NOT_FOUND';
    throw error;
  }

  const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    const error = new Error('No public uploads found for this channel.');
    error.statusCode = 404;
    error.code = 'NO_UPLOADS';
    throw error;
  }

  // 2. Fetch uploads with pagination up to maxVideos (e.g. 50, 100, 200, 500)
  const targetCount = Math.min(500, Math.max(10, Number(maxVideos) || 100));
  let playlistItems = [];
  let nextPageToken = null;
  let pageCount = 0;
  const maxPages = Math.ceil(targetCount / 50);

  do {
    pageCount++;
    try {
      const plRes = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails',
          maxResults: 50,
          playlistId: uploadsPlaylistId,
          pageToken: nextPageToken || undefined,
          key: apiKey,
        },
        timeout: 12000,
      });
      const items = plRes.data.items || [];
      playlistItems.push(...items);
      nextPageToken = plRes.data.nextPageToken;
    } catch (err) {
      handleAxiosError(err, 'Failed to fetch channel video list');
      break;
    }
  } while (nextPageToken && playlistItems.length < targetCount && pageCount < maxPages);

  // Slice down to exact requested target
  playlistItems = playlistItems.slice(0, targetCount);

  const videoIds = playlistItems
    .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
    .filter(Boolean);

  // 3. Batch fetch video statistics, duration, and full snippet descriptions in chunks of 50
  const videoDetailsMap = new Map();
  const CHUNK_SIZE = 50;

  for (let i = 0; i < videoIds.length; i += CHUNK_SIZE) {
    const chunkIds = videoIds.slice(i, i + CHUNK_SIZE);
    try {
      const vidsRes = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: chunkIds.join(','),
          key: apiKey,
        },
        timeout: 12000,
      });
      for (const vid of vidsRes.data.items || []) {
        videoDetailsMap.set(vid.id, vid);
      }
    } catch (err) {
      handleAxiosError(err, 'Failed to fetch video statistics and descriptions');
    }
  }

  // 4. Construct video objects and aggregate analytics
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;

  const videos = playlistItems.map((item) => {
    const vidId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    const details = videoDetailsMap.get(vidId);

    const views = parseInt(details?.statistics?.viewCount || '0', 10);
    const likes = parseInt(details?.statistics?.likeCount || '0', 10);
    const comments = parseInt(details?.statistics?.commentCount || '0', 10);
    const durationIso = details?.contentDetails?.duration || 'PT0S';
    const durationSeconds = parseIsoDuration(durationIso);

    totalViews += views;
    totalLikes += likes;
    totalComments += comments;

    const engagement = views > 0 ? Math.round(((likes + comments) / views) * 10000) / 100 : 0;

    return {
      id: vidId,
      title: details?.snippet?.title || item.snippet?.title || 'Untitled Video',
      description: details?.snippet?.description || item.snippet?.description || '',
      thumbnail:
        details?.snippet?.thumbnails?.medium?.url ||
        details?.snippet?.thumbnails?.default?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        '',
      publishedAt: details?.snippet?.publishedAt || item.snippet?.publishedAt,
      durationSeconds,
      durationIso,
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
      engagementRate: engagement,
    };
  });

  const count = videos.length;
  const overallEngagement = totalViews > 0 
    ? Math.round(((totalLikes + totalComments) / totalViews) * 10000) / 100 
    : 0;

  return {
    isSample: false,
    channel: {
      id: channelData.id,
      title: channelData.snippet?.title || 'YouTube Channel',
      customUrl: channelData.snippet?.customUrl || identifier.value,
      description: channelData.snippet?.description || '',
      publishedAt: channelData.snippet?.publishedAt,
      thumbnail: channelData.snippet?.thumbnails?.high?.url || channelData.snippet?.thumbnails?.default?.url || '',
      banner: channelData.brandingSettings?.image?.bannerExternalUrl || '',
      subscriberCount: parseInt(channelData.statistics?.subscriberCount || '0', 10),
      totalViewCount: parseInt(channelData.statistics?.viewCount || '0', 10),
      videoCount: parseInt(channelData.statistics?.videoCount || '0', 10),
    },
    analytics: {
      analyzedVideosCount: count,
      totalViews,
      totalLikes,
      totalComments,
      averageViews: count > 0 ? Math.round(totalViews / count) : 0,
      averageLikes: count > 0 ? Math.round(totalLikes / count) : 0,
      averageComments: count > 0 ? Math.round(totalComments / count) : 0,
      engagementRate: overallEngagement,
    },
    videos,
  };
}

function handleAxiosError(err, defaultMsg) {
  if (err.response) {
    const errorData = err.response.data?.error;
    const reason = errorData?.errors?.[0]?.reason || '';
    const apiMsg = errorData?.message || err.response.statusText;

    if (reason === 'quotaExceeded' || err.response.status === 403) {
      const error = new Error('YouTube API Quota has been exceeded for this key. Please try again later or use Demo Mode.');
      error.statusCode = 429;
      error.code = 'QUOTA_EXCEEDED';
      throw error;
    }

    if (err.response.status === 404 || reason === 'playlistNotFound' || reason === 'channelNotFound') {
      const error = new Error('Resource not found. Please verify the URL or handle.');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const error = new Error(`${defaultMsg}: ${apiMsg}`);
    error.statusCode = err.response.status;
    error.code = 'YOUTUBE_API_ERROR';
    throw error;
  }

  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    const error = new Error('Request to YouTube API timed out. Please check your network connection.');
    error.statusCode = 504;
    error.code = 'TIMEOUT';
    throw error;
  }

  throw err;
}
