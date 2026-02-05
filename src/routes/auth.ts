/**
 * Last-Updated: 2026-02-04 13:35
 * Purpose: Authentification (register/login) + génération JWT.
 */

import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../lib/auth';

const registerSchema = z.object({
  restaurantName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  adminFullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Enregistre un restaurant + utilisateur admin.
  app.post('/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);

    const existing = await prisma.user.findUnique({
      where: { email: input.adminEmail },
    });

    if (existing) {
      return reply.code(409).send({ error: 'EMAIL_ALREADY_USED' });
    }

    const passwordHash = await bcrypt.hash(input.adminPassword, 12);

    const restaurant = await prisma.restaurant.create({
      data: {
        name: input.restaurantName,
        status: 'ACTIVE',
      },
    });

    const user = await prisma.user.create({
      data: {
        restaurantId: restaurant.id,
        email: input.adminEmail,
        passwordHash,
        fullName: input.adminFullName,
        role: 'ADMIN',
      },
    });

    const token = app.jwt.sign({
      userId: user.id,
      restaurantId: restaurant.id,
      role: user.role,
    });

    return reply.code(201).send({ token });
  });

  // Connexion et génération de JWT.
  app.post('/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      return reply.code(401).send({ error: 'INVALID_CREDENTIALS' });
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: 'INVALID_CREDENTIALS' });
    }

    const token = app.jwt.sign({
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
    });

    return reply.send({ token });
  });

  // Retourne les infos de l'utilisateur connecté (JWT requis).
  app.get('/me', { preHandler: authenticate }, async (request) => {
    return {
      userId: request.user.userId,
      restaurantId: request.user.restaurantId,
      role: request.user.role,
    };
  });
}
