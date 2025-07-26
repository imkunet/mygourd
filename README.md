# mygourd

some discord utilities. requires bun though, so keep that in mind!

## how it works

so check out this example:

```ts
// main.ts
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

// events/login.ts
import consola from 'consola';
import { createEventRouter } from 'mygourd/events';

export const loginEvents = createEventRouter({
  ready: () => {
    consola.info(`The bot is ready!`);
  },
});

export const loginEvents2 = createEventRouter({
  ready: () => {
    consola.info(`The bot is ready, but in a different router!`);
  },
});

// interactions/commands/ping.ts
import { SlashCommandBuilder } from 'discord.js';
import { createInteractionRouterCommand } from 'mygourd/interactions';

export const pingCommand = createInteractionRouterCommand({
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

## retrieving information about application commands

since I for the life of me could not figure out an elegant way to make the api yield this data cleanly,
I suggest that you use something like this to cache the values of the command data:

```ts
import {
  type APIApplicationCommand,
  chatInputApplicationCommandMention,
  Client,
  Routes,
} from 'discord.js';
import { lazy } from 'mygourd/utils';

const commandDataCache = lazy(
  (client: Client<true>) =>
    client.rest.get(Routes.applicationCommands(client.user.id)) as Promise<
      APIApplicationCommand[]
    >,
);

// this is an example usage case:
const getCommandMention = async (
  client: Client<true>,
  name: string,
  subcommand?: string,
) => {
  const cache = await commandDataCache(client);
  const command = cache.find((c) => c.name === name);
  if (command === undefined) return `unknown`;
  return subcommand ?
      chatInputApplicationCommandMention(name, subcommand, command.id)
    : chatInputApplicationCommandMention(name, command.id);
};
```

if you have any ideas for a better way please do let me know
