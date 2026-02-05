/**
 * Last-Updated: 2026-02-04 16:05
 * Purpose: Routes pricing (taxes/discounts simples) par restaurant.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';

const pricingSchema = z.object({
  taxRate: z.number().min(0).max(1),
  discountRate: z.number().min(0).max(1).default(0),
});

export async function pricingRoutes(app: FastifyInstance): Promise<void> {
  // Upsert des règles de pricing (taxes/discounts).
  app.post(
    '/',
    { preHandler: [authenticate, requireRole(['ADMIN'])] },
    async (request, reply) => {
      const input = pricingSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const pricing = await prisma.pricingRule.upsert({
        where: { restaurantId },
        update: {
          taxRate: input.taxRate,
          discountRate: input.discountRate,
        },
        create: {
          restaurantId,
          taxRate: input.taxRate,
          discountRate: input.discountRate,
        },
      });

      return reply.send({ pricing });
    }
  );

  // Lecture des règles.
  app.get(
    '/',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const pricing = await prisma.pricingRule.findUnique({
        where: { restaurantId },
      });

      return { pricing };
    }
  );
}
