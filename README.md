# mygourd 🏳️‍⚧️

some discord utilities.

## how it works

so check out this example:

```ts
// main.ts
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

// events/login.ts
import consola from 'consola';
import { createEventRouter } from 'mygourd/events';

export const loginEvents = createEventRouter({
  clientReady: () => {
    consola.info(`The bot is ready!`);
  },
});

export const loginEvents2 = createEventRouter({
  clientReady: () => {
    consola.info(`The bot is ready, but in a different router!`);
  },
});

// interactions/commands/ping.ts
import { SlashCommandBuilder } from 'discord.js';
import { createInteractionRouterCommand } from 'mygourd/interactions';

export const pingCommand = createInteractionRouterCommand({
  definition: new SlashCommandBuilder()
    .setName(`ping`)
    .setDescription(`Pings the bot!`)
    .addStringOption((option) =>
      option.setName(`target`).setDescription(`Who to ping`).setAutocomplete(true),
    ),
  handler: async (event) => {
    const target = event.options.getString(`target`) ?? `world`;

    await event.reply({
      content: `pong ${target}`,
      flags: `Ephemeral`,
    });
  },
  autocompleteHandler: async (event) => {
    const focused = event.options.getFocused().toLowerCase();
    const choices = [`world`, `bot`, `server`];

    await event.respond(
      choices
        .filter((choice) => choice.includes(focused))
        .map((choice) => ({ name: choice, value: choice })),
    );
  },
});
```

it automatically loads everything and enforces type safety, what more could you want? huzzah!

## registering interactions to specific guilds

pass `guilds` to any interaction router to register it as guild commands instead of global ones.
it is either a list of guild ids, or a predicate that runs once for every guild as it becomes available
(on startup) or is joined:

```ts
import { SlashCommandBuilder } from 'discord.js';
import { createInteractionRouter, createInteractionRouterCommand } from 'mygourd/interactions';

// fixed list of guild ids
export const adminCommand = createInteractionRouterCommand(
  {
    definition: new SlashCommandBuilder().setName(`admin`).setDescription(`Admin tools`),
    handler: (event) => event.reply(`hi admin`),
  },
  { guilds: [`123456789012345678`] },
);

// predicate, may be async
export const devCommands = createInteractionRouter({
  guilds: async (guild) => guild.name.startsWith(`dev`),
  commands: [
    {
      definition: new SlashCommandBuilder().setName(`debug`).setDescription(`Debug info`),
      handler: (event) => event.reply(`debugging`),
    },
  ],
});
```

- it requires the `Guilds` intent.
- all scoped routers matching a guild are combined into one bulk overwrite for that guild.
  routers without `guilds` are registered globally, like before.
- handlers are dispatched by where the command lives: a guild `/ping` and a global `/ping` can have different handlers.
- guilds that no longer match keep whatever was registered to them before, since checking every guild
  costs a request per guild. clear them yourself with `guild.commands.set([])` if needed.
- if registration fails (e.g. the bot was invited without the `applications.commands` scope),
  the listener rejects and the guild is retried the next time it becomes available.

## retrieving information about application commands

discord.js caches the commands returned when they are registered, so this information is stored for you:

- global commands: `client.application.commands.cache`
- guild commands: `guild.commands.cache`

those fill up once registration finishes, so right after `clientReady` for global commands and right after
`guildAvailable`/`guildCreate` for guild commands. if you need them earlier, `client.application.commands.fetch()`
and `guild.commands.fetch()` also fill the cache.

```ts
import { chatInputApplicationCommandMention, type Client, type Guild } from 'discord.js';

const getCommandMention = (client: Client<true>, name: string, guild?: Guild) => {
  const command =
    guild?.commands.cache.find((c) => c.name === name) ??
    client.application.commands.cache.find((c) => c.name === name);
  return command && chatInputApplicationCommandMention(name, command.id);
};
```

for subcommands, use the other `chatInputApplicationCommandMention` overloads with the same `command.id`.

### breaking changes

- `registerInteractionRouters` no longer returns the registered `APIApplicationCommand[]`.
  read `client.application.commands.cache` / `guild.commands.cache` instead (see above).
- removed the `useEnv` feature, use the `arkenv` package instead. here's a modified example from their readme:

  ```ts
  import arkenv from 'arkenv';

  const env = arkenv({
    BOT_TOKEN: 'string',
  });
  ```

  as a result, the dependency on arktype and consola has been removed as well, so you will need to install arktype yourself if you use arkenv. be mindful of your packages.
