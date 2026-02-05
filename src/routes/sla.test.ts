import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Vérifie que /sla/prep-time est protégé.
 */

describe('sla routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/sla/prep-time' });

    expect(res.statusCode).toBe(401);
  });
});
