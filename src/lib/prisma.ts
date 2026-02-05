/**
 * Last-Updated: 2026-02-04 13:15
 * Purpose: Initialisation Prisma Client (singleton).
 */

import { PrismaClient } from '@prisma/client';

// Prisma client unique pour éviter les connexions multiples en dev.
export const prisma = new PrismaClient();
