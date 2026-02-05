/**
 * Last-Updated: 2026-02-04 17:30
 * Purpose: Fabrique l'application Fastify (plugins + routes).
 */

import Fastify, { type FastifyInstance } from 'fastify';
import jwtPlugin from '@fastify/jwt';
import corsPlugin from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { restaurantRoutes } from './routes/restaurants';
import { adminRoutes } from './routes/admin';
import { menuRoutes } from './routes/menu';
import { orderRoutes } from './routes/orders';
import { pricingRoutes } from './routes/pricing';
import { deliveryRoutes } from './routes/delivery';
import { paymentRoutes } from './routes/payments';
import { kdsRoutes } from './routes/kds';
import { reportsRoutes } from './routes/reports';
import { slaRoutes } from './routes/sla';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  // CORS basique pour le MVP (peut être durci plus tard).
  app.register(corsPlugin, { origin: true });

  // JWT pour l'authentification.
  app.register(jwtPlugin as any, {
    secret: process.env.JWT_SECRET ?? 'change-me',
  });

  // Routes publiques.
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: '/auth' });
  app.register(restaurantRoutes, { prefix: '/restaurants' });
  app.register(adminRoutes, { prefix: '/admin' });
  app.register(menuRoutes, { prefix: '/menu' });
  app.register(orderRoutes, { prefix: '/orders' });
  app.register(pricingRoutes, { prefix: '/pricing' });
  app.register(deliveryRoutes, { prefix: '/delivery' });
  app.register(paymentRoutes, { prefix: '/payments' });
  app.register(kdsRoutes, { prefix: '/kds' });
  app.register(reportsRoutes, { prefix: '/reports' });
  app.register(slaRoutes, { prefix: '/sla' });

  return app;
}
