import type { Client } from 'discord.js';

/**
 * Convenience function to login and shutdown gracefully on SIGINT/SIGTERM
 * as well as execute a custom shutdownHandler
 * @param client
 * @param token
 * @param shutdownHandler
 * @param shutdownTimeout
 */
export const login = async (
  client: Client,
  token: string,
  shutdownHandler?: () => Promise<void> | void,
  shutdownTimeout: number = 30_000,
) => {
  let shuttingDown = false;
  const handler = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    setTimeout(() => process.exit(1), shutdownTimeout);
    if (shutdownHandler) await shutdownHandler();
    await client.destroy();
    process.exit(0);
  };

  process.on(`SIGINT`, handler);
  process.on(`SIGTERM`, handler);

  await client.login(token);
};
