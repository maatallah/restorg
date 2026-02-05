import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Last-Updated: 2026-02-05 13:15
 * Purpose: Happy path tests for order creation and status transitions.
 */

vi.mock('../lib/prisma', () => {
  const mockPrisma = {
    menuItem: { findFirst: vi.fn() },
    optionItem: { findFirst: vi.fn() },
    pricingRule: { findUnique: vi.fn() },
    optionGroup: { findMany: vi.fn() },
    order: { create: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
    orderItem: { create: vi.fn() },
    orderItemOption: { create: vi.fn() },
    $transaction: vi.fn(),
  };

  return { prisma: mockPrisma };
});

import { buildApp } from '../app';
import { prisma } from '../lib/prisma';

const restaurantId = '11111111-1111-1111-1111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
  (prisma as any).$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) =>
    fn(prisma)
  );
  (prisma as any).optionGroup.findMany.mockResolvedValue([]);
});

describe('order routes happy path', () => {
  it('should create order and use server option prices', async () => {
    (prisma as any).menuItem.findFirst.mockResolvedValue({ priceCents: 1000 });
    (prisma as any).optionGroup.findMany.mockResolvedValue([
      { id: 'group-1', minSelect: 0, maxSelect: 3 },
    ]);
    (prisma as any).optionItem.findFirst.mockResolvedValue({
      priceCents: 200,
      groupId: 'group-1',
      group: { minSelect: 0, maxSelect: 3 },
    });
    (prisma as any).pricingRule.findUnique.mockResolvedValue(null);
    (prisma as any).order.create.mockResolvedValue({ id: 'order-1' });
    (prisma as any).orderItem.create.mockResolvedValue({ id: 'oi-1' });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-1', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        channel: 'ON_SITE',
        items: [
          {
            itemId: '00000000-0000-0000-0000-000000000000',
            quantity: 2,
            options: [
              {
                optionItemId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                priceCents: 9999,
              },
            ],
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);

    const createArgs = (prisma as any).order.create.mock.calls[0][0];
    expect(createArgs.data.totalCents).toBe(2400);

    const optionArgs = (prisma as any).orderItemOption.create.mock.calls[0][0];
    expect(optionArgs.data.priceCents).toBe(200);
  });

  it('should allow valid order status transition', async () => {
    (prisma as any).order.findFirst.mockResolvedValue({ status: 'CREATED' });
    (prisma as any).order.updateMany.mockResolvedValue({ count: 1 });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-2', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'PATCH',
      url: '/orders/00000000-0000-0000-0000-000000000000/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'IN_PREP' },
    });

    expect(res.statusCode).toBe(200);
  });

  it('should reject invalid order status transition', async () => {
    (prisma as any).order.findFirst.mockResolvedValue({ status: 'READY' });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-4', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'PATCH',
      url: '/orders/00000000-0000-0000-0000-000000000000/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'IN_PREP' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('should apply pricing rule to total', async () => {
    (prisma as any).menuItem.findFirst.mockResolvedValue({ priceCents: 1000 });
    (prisma as any).optionGroup.findMany.mockResolvedValue([
      { id: 'group-1', minSelect: 0, maxSelect: 3 },
    ]);
    (prisma as any).optionItem.findFirst.mockResolvedValue({
      priceCents: 200,
      groupId: 'group-1',
      group: { minSelect: 0, maxSelect: 3 },
    });
    (prisma as any).pricingRule.findUnique.mockResolvedValue({
      discountRate: { toNumber: () => 0.1 },
      taxRate: { toNumber: () => 0.2 },
    });
    (prisma as any).order.create.mockResolvedValue({ id: 'order-2' });
    (prisma as any).orderItem.create.mockResolvedValue({ id: 'oi-2' });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-5', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'POST',
      url: '/orders',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        channel: 'ON_SITE',
        items: [
          {
            itemId: '00000000-0000-0000-0000-000000000000',
            quantity: 2,
            options: [
              {
                optionItemId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                priceCents: 9999,
              },
            ],
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const createArgs = (prisma as any).order.create.mock.calls[0][0];
    expect(createArgs.data.totalCents).toBe(2592);
  });

  it('should return a quote without creating order', async () => {
    (prisma as any).menuItem.findFirst.mockResolvedValue({ priceCents: 500 });
    (prisma as any).optionGroup.findMany.mockResolvedValue([]);
    (prisma as any).pricingRule.findUnique.mockResolvedValue({
      discountRate: { toNumber: () => 0.1 },
      taxRate: { toNumber: () => 0.2 },
    });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-6', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'POST',
      url: '/orders/quote',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        channel: 'ON_SITE',
        items: [
          {
            itemId: '00000000-0000-0000-0000-000000000000',
            quantity: 2,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const payload = res.json();
    expect(payload.totalCents).toBe(1080);
  });

  it('should enforce option group min/max rules', async () => {
    (prisma as any).menuItem.findFirst.mockResolvedValue({ priceCents: 500 });
    (prisma as any).optionGroup.findMany.mockResolvedValue([
      { id: 'group-1', minSelect: 1, maxSelect: 1 },
    ]);

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-7', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'POST',
      url: '/orders/quote',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        channel: 'ON_SITE',
        items: [
          {
            itemId: '00000000-0000-0000-0000-000000000000',
            quantity: 1,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
