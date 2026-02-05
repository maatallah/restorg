/**
 * Last-Updated: 2026-02-04 13:15
 * Purpose: Démarrage du serveur HTTP.
 */

import 'dotenv/config';
import { buildApp } from './app';

const app = buildApp();

const port = Number(process.env.PORT ?? 3000);
const host = '0.0.0.0';

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Server listening on http://${host}:${port}`);
  })
  .catch((err) => {
    app.log.error({ err }, 'Failed to start server');
    process.exit(1);
  });
