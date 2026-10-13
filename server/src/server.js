import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import playlistRoutes from './routes/playlist.js';

// Load environment variables from .env
dotenv.config();

const fastify = Fastify({
  logger: true,
  disableRequestLogging: false,
});

// Register CORS
await fastify.register(cors, {
  origin: true, // Allow frontend dev and deployed origins
  methods: ['GET', 'POST', 'OPTIONS'],
});

// Register Rate Limiter: max 60 requests per minute per IP
await fastify.register(rateLimit, {
  max: 60,
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => ({
    success: false,
    error: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  }),
});

// Register Routes
await fastify.register(playlistRoutes, { prefix: '/api' });

// Root route
fastify.get('/', async () => {
  return {
    name: 'Playtime API',
    description: 'YouTube Playlist Length Calculator Backend',
    version: '1.0.0',
    endpoints: [
      'GET /api/status',
      'GET /api/sample',
      'GET /api/playlist?url=...',
      'GET /api/health',
    ],
  };
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Playtime Fastify server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
