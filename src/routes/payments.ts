/**
 * Last-Updated: 2026-02-05 10:13
 * Purpose: Routes paiements (enregistrement et consultation).
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';

const paymentCreateSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['CASH', 'CARD', 'ONLINE', 'TICKET_RESTAURANT', 'OTHER']),
  amountCents: z.number().int().min(0),
  currency: z.string().default('TND'),
  providerRef: z.string().optional(),
});

const paymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

const paymentParamsSchema = z.object({
  id: z.string().uuid(),
});

const paymentByOrderParamsSchema = z.object({
  orderId: z.string().uuid(),
});

const paymentStatusTransitions = {
  PENDING: ['PAID', 'FAILED'],
  PAID: ['REFUNDED'],
  FAILED: [],
  REFUNDED: [],
} as const;

function isPaymentStatusTransitionAllowed(current: string, next: string): boolean {
  if (current === next) {
    return true;
  }
  return (paymentStatusTransitions as Record<string, readonly string[]>)[current]?.includes(next) ?? false;
}

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  // Enregistrement d'un paiement
  app.post(
    '/',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF', 'CASHIER'])] },
    async (request, reply) => {
      const input = paymentCreateSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const order = await prisma.order.findFirst({
        where: { id: input.orderId, restaurantId },
      });

      if (!order) {
        return reply.code(404).send({ error: 'ORDER_NOT_FOUND' });
      }

      // Règles simples:
      // - ONLINE nécessite un providerRef et reste PENDING
      // - CASH/CARD/TICKET_RESTAURANT/OTHER passent directement à PAID
      const status = input.method === 'ONLINE' ? 'PENDING' : 'PAID';

      if (input.method === 'ONLINE' && !input.providerRef) {
        return reply.code(400).send({ error: 'PROVIDER_REF_REQUIRED' });
      }

      const payment = await prisma.payment.create({
        data: {
          restaurantId,
          orderId: input.orderId,
          method: input.method,
          status,
          amountCents: input.amountCents,
          currency: input.currency,
          providerRef: input.providerRef,
        },
      });

      return reply.code(201).send({ payment });
    }
  );

  // Mise à jour du statut de paiement
  app.patch(
    '/:id/status',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF'])] },
    async (request, reply) => {
      const restaurantId = getRestaurantId(request);
      const { id: paymentId } = paymentParamsSchema.parse(request.params);
      const input = paymentStatusSchema.parse(request.body);

      const existingPayment = await prisma.payment.findFirst({
        where: { id: paymentId, restaurantId },
        select: { status: true },
      });

      if (!existingPayment) {
        return reply.code(404).send({ error: 'PAYMENT_NOT_FOUND' });
      }

      if (!isPaymentStatusTransitionAllowed(existingPayment.status, input.status)) {
        return reply.code(400).send({ error: 'INVALID_STATUS_TRANSITION' });
      }

      const result = await prisma.payment.updateMany({
        where: { id: paymentId, restaurantId },
        data: { status: input.status },
      });

      if (result.count === 0) {
        return reply.code(404).send({ error: 'PAYMENT_NOT_FOUND' });
      }

      return reply.send({ status: input.status });
    }
  );

  // Liste des paiements par commande
  app.get(
    '/by-order/:orderId',
    { preHandler: authenticate },
    async (request, reply) => {
      const restaurantId = getRestaurantId(request);
      const { orderId } = paymentByOrderParamsSchema.parse(request.params);

      const payments = await prisma.payment.findMany({
        where: { orderId, restaurantId },
        orderBy: { createdAt: 'desc' },
      });

      if (payments.length === 0) {
        return reply.code(404).send({ error: 'PAYMENTS_NOT_FOUND' });
      }

      return reply.send({ payments });
    }
  );
}
