import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Vérifie que /kds/queue est protégé.
 */

describe('kds routes', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/kds/queue' });

    expect(res.statusCode).toBe(401);
  });
});
