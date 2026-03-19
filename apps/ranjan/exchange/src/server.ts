import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import { registerAdRequestRoute } from './routes/ad-request';
import { registerBeaconRoute } from './routes/beacon';
import { registerApiRoutes } from './routes/api';
import { TestBidderAdapter } from './integrations/adapters/test-bidder';
import { getStatusMetrics } from './services/metrics-store';

const PORT = Number(process.env.PORT || 3001);

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await fastify.register(cors, {
    origin: true,
  });
  await fastify.register(helmet);
  await fastify.register(sensible);
  await fastify.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
  });

  const testAdapter = new TestBidderAdapter();

  await registerAdRequestRoute(fastify, [testAdapter]);
  await registerBeaconRoute(fastify);
  await registerApiRoutes(fastify);

  fastify.get('/status', async () => {
    const metrics = getStatusMetrics();
    return {
      status: 'healthy',
      version: process.env.npm_package_version || '0.1.0',
      uptime: process.uptime(),
      auctions_last_hour: metrics.auctions_last_hour,
      active_dsps: 1,
      avg_latency_ms: metrics.avg_latency_ms,
      fill_rate: metrics.fill_rate,
    };
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }
}

void start();

