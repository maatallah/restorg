/**
 * Last-Updated: 2026-02-05 09:12
 * Purpose: Routes menu (menus, catégories, items) avec isolation restaurant.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../lib/auth';
import { getRestaurantId } from '../lib/tenant';

const menuCreateSchema = z.object({
  name: z.string().min(2),
  isActive: z.boolean().default(true),
});

const categoryCreateSchema = z.object({
  menuId: z.string().uuid(),
  name: z.string().min(2),
  position: z.number().int().min(0),
});

const itemCreateSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().min(1),
  priceCents: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
});

const availabilitySchema = z.object({
  isAvailable: z.boolean(),
});

const itemParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function menuRoutes(app: FastifyInstance): Promise<void> {
  // Menus
  app.post(
    '/menus',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF'])] },
    async (request, reply) => {
      const input = menuCreateSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const menu = await prisma.menu.create({
        data: {
          restaurantId,
          name: input.name,
          isActive: input.isActive,
        },
      });

      return reply.code(201).send({ menu });
    }
  );

  app.get(
    '/menus',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const menus = await prisma.menu.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
      });
      return { menus };
    }
  );

  // Categories
  app.post(
    '/categories',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF'])] },
    async (request, reply) => {
      const input = categoryCreateSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const category = await prisma.menuCategory.create({
        data: {
          restaurantId,
          menuId: input.menuId,
          name: input.name,
          position: input.position,
        },
      });

      return reply.code(201).send({ category });
    }
  );

  app.get(
    '/categories',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const categories = await prisma.menuCategory.findMany({
        where: { restaurantId },
        orderBy: [{ menuId: 'asc' }, { position: 'asc' }],
      });
      return { categories };
    }
  );

  // Items
  app.post(
    '/items',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF'])] },
    async (request, reply) => {
      const input = itemCreateSchema.parse(request.body);
      const restaurantId = getRestaurantId(request);

      const item = await prisma.menuItem.create({
        data: {
          restaurantId,
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          priceCents: input.priceCents,
          isAvailable: input.isAvailable,
        },
      });

      return reply.code(201).send({ item });
    }
  );

  app.get(
    '/items',
    { preHandler: authenticate },
    async (request) => {
      const restaurantId = getRestaurantId(request);
      const items = await prisma.menuItem.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
      });
      return { items };
    }
  );

  // Mise à jour de la disponibilité d'un item
  app.patch(
    '/items/:id/availability',
    { preHandler: [authenticate, requireRole(['ADMIN', 'STAFF'])] },
    async (request, reply) => {
      const restaurantId = getRestaurantId(request);
      const { id: itemId } = itemParamsSchema.parse(request.params);
      const input = availabilitySchema.parse(request.body);

      const result = await prisma.menuItem.updateMany({
        where: { id: itemId, restaurantId },
        data: { isAvailable: input.isAvailable },
      });

      if (result.count === 0) {
        return reply.code(404).send({ error: 'ITEM_NOT_FOUND' });
      }

      return reply.send({ status: 'ok' });
    }
  );
}
