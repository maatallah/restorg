/**
 * Last-Updated: 2026-02-04 13:35
 * Purpose: Middlewares d'authentification et RBAC.
 */

import type { FastifyReply, FastifyRequest } from 'fastify';

// Vérifie le JWT et peuple request.user.
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'UNAUTHORIZED' });
  }
}

// Vérifie que le rôle de l'utilisateur est autorisé.
export function requireRole(allowed: Array<'ADMIN' | 'STAFF' | 'CASHIER'>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user || !allowed.includes(request.user.role)) {
      reply.code(403).send({ error: 'FORBIDDEN' });
    }
  };
}
