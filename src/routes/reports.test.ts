import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Vérifie que /reports/sales est protégé.
 */

describe('reports routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/reports/sales?start=2025-01-01T00:00:00.000Z&end=2025-01-31T23:59:59.000Z',
    });

    expect(res.statusCode).toBe(401);
  });
});
