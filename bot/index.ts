import { type } from 'arktype';
import { Client } from 'discord.js';
import { globAllRouters } from 'mygourd/routers';
import { useEnv } from 'mygourd/utils';

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

await client.login(env.BOT_TOKEN);
