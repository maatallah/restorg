/**
 * Last-Updated: 2026-02-04 14:45
 * Purpose: Routes admin (RBAC vérifiable).
 */

import type { FastifyInstance } from 'fastify';
import { authenticate, requireRole } from '../lib/auth';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Route de test protégée par rôle ADMIN.
  app.get('/ping', { preHandler: [authenticate, requireRole(['ADMIN'])] }, async () => {
    return { status: 'admin-ok' };
  });
}
