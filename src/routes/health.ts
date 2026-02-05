/**
 * Last-Updated: 2026-02-04 13:15
 * Purpose: Route de santé pour vérifier la disponibilité de l'API.
 */

import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({ status: 'ok' }));
}
