import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 15:40
 * Purpose: Vérifie que /orders est protégé par JWT.
 */

describe('order routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/orders' });

    expect(res.statusCode).toBe(401);
  });
});
