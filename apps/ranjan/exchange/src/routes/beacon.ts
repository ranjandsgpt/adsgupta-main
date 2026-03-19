import type { FastifyInstance } from 'fastify';

const ONE_BY_ONE_GIF = Buffer.from(
  'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'base64',
);

export async function registerBeaconRoute(fastify: FastifyInstance) {
  fastify.get('/beacon', async (request, reply) => {
    const q: any = request.query || {};
    const type = String(q.type || '');
    const auc = String(q.auc || '');
    const imp = String(q.imp || '');

    // TODO: validate auction ID from Redis and log events to Postgres
    fastify.log.debug({ type, auc, imp }, 'Received beacon');

    reply
      .header('Content-Type', 'image/gif')
      .header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      .header('Pragma', 'no-cache')
      .send(ONE_BY_ONE_GIF);
  });
}

