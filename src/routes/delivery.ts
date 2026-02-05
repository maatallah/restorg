/**
 * Last-Updated: 2026-02-05 09:12
 * Purpose: Routes de livraison (détails d'adresse pour commandes DELIVERY).
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';

const deliverySchema = z.object({
  orderId: z.string().uuid(),
  customerPhone: z.string().min(4),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  notes: z.string().optional(),
  deliveryWindow: z.string().optional(),
});

const deliveryParamsSchema = z.object({
  orderId: z.string().uuid(),
});

export async function deliveryRoutes(app: FastifyInstance): Promise<void> {
  // Crée ou met à jour les détails de livraison.
  app.post(
    '/',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF', 'CASHIER'])] },
    async (request, reply) => {
      const input = deliverySchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const order = await prisma.order.findFirst({
        where: { id: input.orderId, restaurantId },
        select: { channel: true },
      });

      if (!order) {
        return reply.code(404).send({ error: 'ORDER_NOT_FOUND' });
      }

      if (order.channel !== 'DELIVERY') {
        return reply.code(400).send({ error: 'ORDER_NOT_DELIVERY' });
      }

      const detail = await prisma.deliveryDetail.upsert({
        where: { orderId: input.orderId },
        update: {
          customerPhone: input.customerPhone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          city: input.city,
          notes: input.notes,
          deliveryWindow: input.deliveryWindow,
        },
        create: {
          orderId: input.orderId,
          restaurantId,
          customerPhone: input.customerPhone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          city: input.city,
          notes: input.notes,
          deliveryWindow: input.deliveryWindow,
        },
      });

      return reply.send({ delivery: detail });
    }
  );

  // Lecture des détails de livraison pour une commande.
  app.get(
    '/:orderId',
    { preHandler: authenticate },
    async (request, reply) => {
      const restaurantId = getRestaurantId(request);
      const { orderId } = deliveryParamsSchema.parse(request.params);

      const detail = await prisma.deliveryDetail.findFirst({
        where: { orderId, restaurantId },
      });

      if (!detail) {
        return reply.code(404).send({ error: 'DELIVERY_NOT_FOUND' });
      }

      return reply.send({ delivery: detail });
    }
  );
}
