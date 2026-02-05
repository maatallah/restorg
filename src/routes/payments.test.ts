import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 16:45
 * Purpose: Vérifie que /payments est protégé par JWT.
 */

describe('payment routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/payments/by-order/00000000-0000-0000-0000-000000000000' });

    expect(res.statusCode).toBe(401);
  });
});
