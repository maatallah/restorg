/**
 * Last-Updated: 2026-02-04 14:00
 * Purpose: Routes restaurant (profil du tenant courant).
 */

import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authenticate } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';

export async function restaurantRoutes(app: FastifyInstance): Promise<void> {
  // Retourne le profil du restaurant courant.
  app.get('/me', { preHandler: authenticate }, async (request) => {
    const restaurantId = getRestaurantId(request);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, status: true, createdAt: true },
    });

    return { restaurant };
  });
}
