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

await globAllRouters(client, [`events/**/*.ts`, `interactions/**/*.ts`], import.meta.dir);

await login(client, env.BOT_TOKEN, () => {
  consola.info(`Shutting down!`);
});
