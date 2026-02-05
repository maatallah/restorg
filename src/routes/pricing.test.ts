import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 16:05
 * Purpose: Vérifie que /pricing est protégé par JWT.
 */

describe('pricing routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/pricing' });

    expect(res.statusCode).toBe(401);
  });
});
