import { extractPlaylistId } from '../utils/urlParser.js';
import { extractChannelIdentifier } from '../utils/channelParser.js';
import { fetchPlaylistDetails, fetchChannelAnalytics } from '../services/youtube.js';
import { SAMPLE_PLAYLIST } from '../utils/sampleData.js';
import { SAMPLE_CHANNEL_DATA } from '../utils/sampleChannelData.js';
import { calculateSpeedMetrics } from '../utils/formatters.js';

export default async function playlistRoutes(fastify, options) {
  const apiKey = process.env.YOUTUBE_API_KEY || '';

  // 1. Health check
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // 2. API Status endpoint (informs client whether API key is configured)
  fastify.get('/status', async (request, reply) => {
    const isApiKeyConfigured = Boolean(apiKey && apiKey.trim().length > 10);
    return {
      isApiKeyConfigured,
      hasSampleMode: true,
      mode: isApiKeyConfigured ? 'live' : 'demo-only',
      message: isApiKeyConfigured
        ? 'YouTube API is configured and operational.'
        : 'YouTube API key is not set. Demo Mode and Manual Calculator are fully available.',
    };
  });

  // 3. Demo / Sample Playlist endpoint
  fastify.get('/sample', async (request, reply) => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3];
    const speedBreakdown = speeds.map((spd) =>
      calculateSpeedMetrics(SAMPLE_PLAYLIST.totalDurationSeconds, spd)
    );

    return {
      success: true,
      isSample: true,
      data: {
        ...SAMPLE_PLAYLIST,
        speedBreakdown,
      },
    };
  });

  // 4. Demo / Sample Channel Analytics endpoint
  fastify.get('/channel/sample', async (request, reply) => {
    return {
      success: true,
      isSample: true,
      data: SAMPLE_CHANNEL_DATA,
    };
  });

  // 5. Channel Analytics endpoint
  // Supports: GET /api/channel?url=... or ?handle=... or ?channelId=...
  fastify.get('/channel', async (request, reply) => {
    const { url, handle, channelId, demo } = request.query;

    if (demo === 'true' || demo === '1') {
      return {
        success: true,
        isSample: true,
        data: SAMPLE_CHANNEL_DATA,
      };
    }

    const input = url || handle || channelId;
    if (!input) {
      reply.status(400);
      return {
        success: false,
        error: 'Missing channel URL, handle, or ID parameter.',
        code: 'MISSING_INPUT',
      };
    }

    const identifier = extractChannelIdentifier(input);
    if (!identifier) {
      reply.status(400);
      return {
        success: false,
        error: 'Invalid YouTube channel URL or handle. Enter @channelname, youtube.com/@handle, or channel ID.',
        code: 'INVALID_CHANNEL_IDENTIFIER',
      };
    }

    if (!apiKey || apiKey.trim().length < 10) {
      reply.status(503);
      return {
        success: false,
        error: 'YouTube API Key is not configured on the server. You can explore using Demo Channel Mode.',
        code: 'API_KEY_NOT_CONFIGURED',
      };
    }

    try {
      const channelResult = await fetchChannelAnalytics(identifier, apiKey);
      return {
        success: true,
        isSample: false,
        data: channelResult,
      };
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode);
      return {
        success: false,
        error: err.message || 'Failed to fetch channel analytics.',
        code: err.code || 'SERVER_ERROR',
      };
    }
  });

  // 6. Main Playlist Calculation endpoint
  // Supports: GET /api/playlist?url=... or ?playlistId=... or ?demo=true
  fastify.get('/playlist', async (request, reply) => {
    const { url, playlistId: queryId, demo } = request.query;

    // Direct demo trigger if requested
    if (demo === 'true' || demo === '1') {
      const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3];
      const speedBreakdown = speeds.map((spd) =>
        calculateSpeedMetrics(SAMPLE_PLAYLIST.totalDurationSeconds, spd)
      );
      return {
        success: true,
        isSample: true,
        data: {
          ...SAMPLE_PLAYLIST,
          speedBreakdown,
        },
      };
    }

    const input = url || queryId;
    if (!input) {
      reply.status(400);
      return {
        success: false,
        error: 'Missing playlist URL or playlist ID parameter.',
        code: 'MISSING_INPUT',
      };
    }

    const playlistId = extractPlaylistId(input);
    if (!playlistId) {
      reply.status(400);
      return {
        success: false,
        error:
          'Invalid YouTube playlist URL or ID. Please check the URL (e.g., https://www.youtube.com/playlist?list=PL...).',
        code: 'INVALID_PLAYLIST_URL',
      };
    }

    // Check if API key is configured
    if (!apiKey || apiKey.trim().length < 10) {
      reply.status(503);
      return {
        success: false,
        error:
          'YouTube API Key is not configured on the server. You can explore the application using Demo Mode or the Manual Calculator.',
        code: 'API_KEY_NOT_CONFIGURED',
        playlistId,
      };
    }

    try {
      const playlistData = await fetchPlaylistDetails(playlistId, apiKey);

      const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3];
      const speedBreakdown = speeds.map((spd) =>
        calculateSpeedMetrics(playlistData.totalDurationSeconds, spd)
      );

      return {
        success: true,
        isSample: false,
        data: {
          ...playlistData,
          speedBreakdown,
        },
      };
    } catch (err) {
      const statusCode = err.statusCode || 500;
      reply.status(statusCode);
      return {
        success: false,
        error: err.message || 'Failed to fetch playlist details.',
        code: err.code || 'SERVER_ERROR',
      };
    }
  });
}
