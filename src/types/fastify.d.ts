/**
 * Last-Updated: 2026-02-04 14:05
 * Purpose: Types Fastify (payload JWT).
 */

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string;
      restaurantId: string;
      role: 'ADMIN' | 'STAFF' | 'CASHIER';
    };
    user: {
      userId: string;
      restaurantId: string;
      role: 'ADMIN' | 'STAFF' | 'CASHIER';
    };
  }
}

export {};
