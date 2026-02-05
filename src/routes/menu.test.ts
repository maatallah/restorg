import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 15:20
 * Purpose: Vérifie que /menu/menus est protégé par JWT.
 */

describe('menu routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/menu/menus' });

    expect(res.statusCode).toBe(401);
  });
});
