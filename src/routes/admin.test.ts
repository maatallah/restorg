import { describe, expect, it } from 'vitest';
import { buildApp } from '../app';

/**
 * Last-Updated: 2026-02-04 14:45
 * Purpose: Vérifie la protection RBAC sur routes admin.
 */

describe('admin route', () => {
  it('should reject without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/admin/ping' });

    expect(res.statusCode).toBe(401);
  });
});
