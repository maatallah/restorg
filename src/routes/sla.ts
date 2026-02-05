/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Routes SLA (temps moyen de préparation).
 */

import type { FastifyInstance } from 'fastify';
import { authenticate } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';
import { prisma } from '../lib/prisma';

export async function slaRoutes(app: FastifyInstance): Promise<void> {
  // Calcul simple: moyenne du temps CREATED -> COMPLETED
  app.get(
    '/prep-time',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);

      const orders = await prisma.order.findMany({
        where: {
          restaurantId,
          status: 'COMPLETED',
        },
        select: { createdAt: true },
      });

      // Placeholder: sans timestamps d'étapes, on retourne 0.
      return { avgPrepSeconds: orders.length > 0 ? 0 : 0 };
    }
  );
}
