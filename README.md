# mygourd

some discord utilities. requires bun though, so keep that in mind!

## how it works

so check out this example:

```ts
// main.ts
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

// events/login.ts
import consola from 'consola';
import { createEventRouter } from 'mygourd/events';

export default createEventRouter({
  ready: () => {
    consola.info(`The bot is ready!`);
  },
});

// interactions/commands/ping.ts
import { SlashCommandBuilder } from 'discord.js';
import { createInteractionRouterCommand } from 'mygourd/interactions';

export default createInteractionRouterCommand({
  definition: new SlashCommandBuilder()
    .setName(`ping`)
    .setDescription(`Pings the bot!`),
  handler: async (event) => {
    await event.reply({
      content: `pong`,
      flags: `Ephemeral`,
    });
  },
});
```

it automatically loads everything and enforces type safety, what more could you want? huzzah!
