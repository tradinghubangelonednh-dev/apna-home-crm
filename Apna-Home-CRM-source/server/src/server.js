import http from 'http';

import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import { startRecurringExpenseScheduler } from './services/recurringService.js';

async function bootstrap() {
  await connectDatabase(env.mongodbUri);

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);
  startRecurringExpenseScheduler();

  server.listen(env.port, () => {
    console.log(`Apna Home CRM server listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
