/**
 * Last-Updated: 2026-02-05 13:15
 * Purpose: Routes commandes (cart + création + statut).
 */

import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';

const orderItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  notes: z.string().optional(),
  options: z
    .array(
      z.object({
        optionItemId: z.string().uuid(),
        priceCents: z.number().int().min(0),
      })
    )
    .optional(),
});

const createOrderSchema = z.object({
  channel: z.enum(['ON_SITE', 'TAKEAWAY', 'DELIVERY']),
  tableNumber: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['CREATED', 'IN_PREP', 'READY', 'COMPLETED', 'CANCELED']),
});

const orderParamsSchema = z.object({
  id: z.string().uuid(),
});

const orderStatusTransitions = {
  CREATED: ['IN_PREP', 'CANCELED'],
  IN_PREP: ['READY', 'CANCELED'],
  READY: ['COMPLETED', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
} as const;

function isOrderStatusTransitionAllowed(current: string, next: string): boolean {
  if (current === next) {
    return true;
  }
  return (orderStatusTransitions as Record<string, readonly string[]>)[current]?.includes(next) ?? false;
}

function normalizeRate(value: unknown): number {
  if (typeof value === 'number') {
    return Math.min(Math.max(value, 0), 1);
  }
  if (value && typeof (value as { toNumber?: () => number }).toNumber === 'function') {
    const num = (value as { toNumber: () => number }).toNumber();
    return Math.min(Math.max(num, 0), 1);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.min(Math.max(parsed, 0), 1);
}

type ComputedOrderItem = {
  itemId: string;
  quantity: number;
  notes?: string;
  unitPriceCents: number;
  options: Array<{ optionItemId: string; priceCents: number }>;
};

type ComputeResult =
  | { ok: true; computedItems: ComputedOrderItem[]; subtotalCents: number }
  | { ok: false; status: number; error: string };

async function computeOrderItems(
  restaurantId: string,
  items: Array<z.infer<typeof orderItemSchema>>
): Promise<ComputeResult> {
  let subtotalCents = 0;
  const computedItems: ComputedOrderItem[] = [];

  for (const item of items) {
    const menuItem = await prisma.menuItem.findFirst({
      where: { id: item.itemId, restaurantId },
      select: { priceCents: true },
    });

    if (!menuItem) {
      return { ok: false, status: 404, error: 'ITEM_NOT_FOUND' };
    }

    const optionGroups = await prisma.optionGroup.findMany({
      where: { itemId: item.itemId, restaurantId },
      select: { id: true, minSelect: true, maxSelect: true },
    });

    const groupMap = new Map(
      optionGroups.map((group) => [group.id, { minSelect: group.minSelect, maxSelect: group.maxSelect }])
    );
    const selectedCounts = new Map<string, number>();

    const options: Array<{ optionItemId: string; priceCents: number; groupId: string }> = [];
    if (item.options) {
      for (const opt of item.options) {
        const optionItem = await prisma.optionItem.findFirst({
          where: {
            id: opt.optionItemId,
            restaurantId,
            isAvailable: true,
            group: { itemId: item.itemId },
          },
          select: {
            priceCents: true,
            groupId: true,
            group: { select: { minSelect: true, maxSelect: true } },
          },
        });

        if (!optionItem) {
          return { ok: false, status: 404, error: 'OPTION_NOT_FOUND' };
        }

        options.push({
          optionItemId: opt.optionItemId,
          priceCents: optionItem.priceCents,
          groupId: optionItem.groupId,
        });

        selectedCounts.set(optionItem.groupId, (selectedCounts.get(optionItem.groupId) ?? 0) + 1);
      }
    }

    for (const [groupId, { minSelect, maxSelect }] of groupMap.entries()) {
      const count = selectedCounts.get(groupId) ?? 0;
      if (count < minSelect) {
        return { ok: false, status: 400, error: 'OPTION_GROUP_MIN_NOT_MET' };
      }
      if (count > maxSelect) {
        return { ok: false, status: 400, error: 'OPTION_GROUP_MAX_EXCEEDED' };
      }
    }

    const optionsTotal = options.reduce((sum, opt) => sum + opt.priceCents, 0);
    subtotalCents += menuItem.priceCents * item.quantity + optionsTotal * item.quantity;
    computedItems.push({
      itemId: item.itemId,
      quantity: item.quantity,
      notes: item.notes,
      unitPriceCents: menuItem.priceCents,
      options: options.map((opt) => ({ optionItemId: opt.optionItemId, priceCents: opt.priceCents })),
    });
  }

  return { ok: true, computedItems, subtotalCents };
}

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  // Création d'une commande
  app.post(
    '/',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF', 'CASHIER'])] },
    async (request, reply) => {
      const input = createOrderSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const computed = await computeOrderItems(restaurantId, input.items);
      if (!computed.ok) {
        return reply.code(computed.status).send({ error: computed.error });
      }

      const pricingRule = await prisma.pricingRule.findUnique({
        where: { restaurantId },
        select: { taxRate: true, discountRate: true },
      });

      const discountRate = normalizeRate(pricingRule?.discountRate);
      const taxRate = normalizeRate(pricingRule?.taxRate);
      const discountCents = Math.round(computed.subtotalCents * discountRate);
      const taxableCents = Math.max(0, computed.subtotalCents - discountCents);
      const taxCents = Math.round(taxableCents * taxRate);
      const totalCents = taxableCents + taxCents;

      // Génération robuste d'un numéro de commande (anti-collision).
      const orderNumber = `ORD-${crypto.randomUUID()}`;

      const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            restaurantId,
            orderNumber,
            channel: input.channel,
            status: 'CREATED',
            tableNumber: input.tableNumber,
            customerName: input.customerName,
            totalCents,
          },
        });

        for (const item of computed.computedItems) {
          const orderItem = await tx.orderItem.create({
            data: {
              restaurantId,
              orderId: createdOrder.id,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              notes: item.notes,
            },
          });

          for (const opt of item.options) {
            await tx.orderItemOption.create({
              data: {
                restaurantId,
                orderItemId: orderItem.id,
                optionItemId: opt.optionItemId,
                priceCents: opt.priceCents,
              },
            });
          }
        }

        return createdOrder;
      });

      return reply.code(201).send({ orderId: order.id, orderNumber });
    }
  );

  // Liste des commandes
  app.get(
    '/',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const orders = await prisma.order.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
      });
      return { orders };
    }
  );

  // Simulation de devis pour un panier (sans création de commande).
  app.post(
    '/quote',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF', 'CASHIER'])] },
    async (request, reply) => {
      const input = createOrderSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const computed = await computeOrderItems(restaurantId, input.items);
      if (!computed.ok) {
        return reply.code(computed.status).send({ error: computed.error });
      }

      const pricingRule = await prisma.pricingRule.findUnique({
        where: { restaurantId },
        select: { taxRate: true, discountRate: true },
      });

      const discountRate = normalizeRate(pricingRule?.discountRate);
      const taxRate = normalizeRate(pricingRule?.taxRate);
      const discountCents = Math.round(computed.subtotalCents * discountRate);
      const taxableCents = Math.max(0, computed.subtotalCents - discountCents);
      const taxCents = Math.round(taxableCents * taxRate);
      const totalCents = taxableCents + taxCents;

      return reply.send({
        subtotalCents: computed.subtotalCents,
        discountCents,
        taxCents,
        totalCents,
        items: computed.computedItems,
      });
    }
  );

  // Mise à jour du statut d'une commande
  app.patch(
    '/:id/status',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF'])] },
    async (request, reply) => {
      const restaurantId = getRestaurantId(request);
      const { id: orderId } = orderParamsSchema.parse(request.params);
      const input = updateStatusSchema.parse(request.body);

      const existingOrder = await prisma.order.findFirst({
        where: { id: orderId, restaurantId },
        select: { status: true },
      });

      if (!existingOrder) {
        return reply.code(404).send({ error: 'ORDER_NOT_FOUND' });
      }

      if (!isOrderStatusTransitionAllowed(existingOrder.status, input.status)) {
        return reply.code(400).send({ error: 'INVALID_STATUS_TRANSITION' });
      }

      const order = await prisma.order.updateMany({
        where: { id: orderId, restaurantId },
        data: { status: input.status },
      });

      if (order.count === 0) {
        return reply.code(404).send({ error: 'ORDER_NOT_FOUND' });
      }

      return reply.send({ status: input.status });
    }
  );
}
