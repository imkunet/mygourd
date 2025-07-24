import { type } from 'arktype';
import { Client } from 'discord.js';
import { globEventRouters } from 'mygourd/events';
import { globInteractionRouters } from 'mygourd/interactions';
import { useEnv } from 'mygourd/utils';

const env = useEnv({
  BOT_TOKEN: type(/[A-Za-z.]/).configure({ actual: `` }),
});

const client = new Client({
  intents: [`Guilds`, `MessageContent`, `GuildMessages`, `GuildVoiceStates`],
});

await globEventRouters(client, `events/**/*.ts`, import.meta.dir);
await globInteractionRouters(client, `interactions/**/*.ts`, import.meta.dir);

await client.login(env.BOT_TOKEN);
