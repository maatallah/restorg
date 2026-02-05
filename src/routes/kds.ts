/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Routes KDS (queue cuisine) basées sur les statuts des commandes.
 */

import type { FastifyInstance } from 'fastify';
import { authenticate } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';
import { prisma } from '../lib/prisma';

export async function kdsRoutes(app: FastifyInstance): Promise<void> {
  // Liste des commandes en préparation
  app.get(
    '/queue',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const orders = await prisma.order.findMany({
        where: { restaurantId, status: 'IN_PREP' },
        orderBy: { createdAt: 'asc' },
      });

      return { orders };
    }
  );
}
