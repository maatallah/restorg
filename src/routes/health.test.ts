import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 13:15
 * Purpose: Test basique de disponibilité (healthcheck).
 */

describe('health route', () => {
  it('should return ok', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});
