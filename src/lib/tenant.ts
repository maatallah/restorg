/**
 * Last-Updated: 2026-02-04 14:00
 * Purpose: Helpers d'isolation par restaurant (multi-tenant).
 */

import type { FastifyReply, FastifyRequest } from 'fastify';

// Extrait le restaurantId depuis le JWT.
export function getRestaurantId(request: FastifyRequest): string {
  if (!request.user?.restaurantId) {
    throw new Error('MISSING_RESTAURANT_ID');
  }
  return request.user.restaurantId;
}

// Assure que le restaurantId est disponible (JWT requis).
export async function requireRestaurant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user?.restaurantId) {
    reply.code(401).send({ error: 'UNAUTHORIZED' });
  }
}
