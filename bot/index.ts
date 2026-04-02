import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import arkenv from 'arkenv';
import consola from 'consola';
import { Client } from 'discord.js';
import { globAllRouters } from 'mygourd/routers';
import { login } from 'mygourd/utils';

const env = arkenv({
  BOT_TOKEN: 'string',
});

const client = new Client({
  intents: [`Guilds`, `MessageContent`, `GuildMessages`, `GuildVoiceStates`],
});

const baseDir = dirname(fileURLToPath(import.meta.url));
await globAllRouters(client, [`events/**/*.ts`, `interactions/**/*.ts`], baseDir);

await login(client, env.BOT_TOKEN, () => {
  consola.info(`Shutting down!`);
});
