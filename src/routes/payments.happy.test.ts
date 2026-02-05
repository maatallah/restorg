import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Last-Updated: 2026-02-05 10:20
 * Purpose: Happy path tests for payment status transitions.
 */

vi.mock('../lib/prisma', () => {
  const mockPrisma = {
    payment: { findFirst: vi.fn(), updateMany: vi.fn() },
  };

  return { prisma: mockPrisma };
});

import { buildApp } from '../app';
import { prisma } from '../lib/prisma';

const restaurantId = '11111111-1111-1111-1111-111111111111';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('payment routes happy path', () => {
  it('should allow valid payment status transition', async () => {
    (prisma as any).payment.findFirst.mockResolvedValue({ status: 'PENDING' });
    (prisma as any).payment.updateMany.mockResolvedValue({ count: 1 });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-3', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'PATCH',
      url: '/payments/00000000-0000-0000-0000-000000000000/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'PAID' },
    });

    expect(res.statusCode).toBe(200);
  });

  it('should reject invalid payment status transition', async () => {
    (prisma as any).payment.findFirst.mockResolvedValue({ status: 'FAILED' });

    const app = buildApp();
    await app.ready();
    const token = app.jwt.sign({ userId: 'user-4', role: 'ADMIN', restaurantId });

    const res = await app.inject({
      method: 'PATCH',
      url: '/payments/00000000-0000-0000-0000-000000000000/status',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'PAID' },
    });

    expect(res.statusCode).toBe(400);
  });
});
