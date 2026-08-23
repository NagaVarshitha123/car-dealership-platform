import { createApp } from './app';
import { prisma } from './config/prisma';
import { env } from './config/env';

const app = createApp(prisma);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Car dealership API listening on port ${env.port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
