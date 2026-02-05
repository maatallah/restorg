import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 16:19
 * Purpose: Vérifie que /menu/items/:id/availability est protégé.
 */

describe('menu availability route', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'PATCH',
      url: '/menu/items/00000000-0000-0000-0000-000000000000/availability',
      payload: { isAvailable: true },
    });

    expect(res.statusCode).toBe(401);
  });
});
