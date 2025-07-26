import { type } from 'arktype';
import consola from 'consola';
import { Client } from 'discord.js';
import { globAllRouters } from 'mygourd/routers';
import { login, useEnv } from 'mygourd/utils';

const env = useEnv({
  BOT_TOKEN: type(/[A-Za-z.]/).configure({ actual: `` }),
});

const client = new Client({
  intents: [`Guilds`, `MessageContent`, `GuildMessages`, `GuildVoiceStates`],
});

await globAllRouters(
  client,
  [`events/**/*.ts`, `interactions/**/*.ts`],
  import.meta.dir,
);

await login(client, env.BOT_TOKEN, () => {
  consola.info(`Shutting down!`);
});
