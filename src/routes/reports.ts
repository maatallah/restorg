/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Routes rapports simples (ventes par période).
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';
import { prisma } from '../lib/prisma';

const salesQuerySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export async function reportsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/sales',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const input = salesQuerySchema.parse(request.query);

      const start = new Date(input.start);
      const end = new Date(input.end);

      const orders = await prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: start, lte: end },
          status: 'COMPLETED',
        },
        select: { totalCents: true },
      });

      const totalCents = orders.reduce((sum, o) => sum + o.totalCents, 0);

      return { totalCents, count: orders.length };
    }
  );
}
