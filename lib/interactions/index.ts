import type { Client, Guild, RESTPostAPIApplicationCommandsJSONBody, Snowflake } from 'discord.js';

import { interactionModuleBrand } from '../routers/symbols';
import { glob } from '../utils';
import type {
  GuildScope,
  InteractionDefinition,
  InteractionModule,
  InteractionModuleShape,
  InteractionRouterOptions,
  InteractionType,
} from './types';

export * from './types';

export const createInteractionRouter = (module: InteractionModuleShape): InteractionModule => ({
  ...module,
  [interactionModuleBrand]: true,
});

const createSingle = <T extends InteractionType>(
  key: T,
  interaction: InteractionDefinition<T>,
  options?: InteractionRouterOptions,
) =>
  createInteractionRouter({
    ...options,
    [key]: [interaction],
  });

export const createInteractionRouterCommand = (
  command: InteractionDefinition<`commands`>,
  options?: InteractionRouterOptions,
) => createSingle(`commands`, command, options);

export const createInteractionRouterMenu = (
  menu: InteractionDefinition<`menus`>,
  options?: InteractionRouterOptions,
) => createSingle(`menus`, menu, options);

export const isInteractionModule = (v: unknown): v is InteractionModule =>
  v !== null && typeof v === `object` && interactionModuleBrand in v;

type RegisteredInteractionDefinitions = {
  commands: InteractionDefinition<`commands`>[];
  menus: InteractionDefinition<`menus`>[];
};

const collectDefinitions = (modules: InteractionModule[]): RegisteredInteractionDefinitions =>
  modules.reduce<RegisteredInteractionDefinitions>(
    (definitions, module) => {
      definitions.commands.push(...(module.commands ?? []));
      definitions.menus.push(...(module.menus ?? []));
      return definitions;
    },
    { commands: [], menus: [] },
  );

const emptyDefinitions: RegisteredInteractionDefinitions = { commands: [], menus: [] };

const findDefinition = <T extends InteractionType>(
  definitions: InteractionDefinition<T>[],
  commandName: string,
) => definitions.find((v) => v.definition.name === commandName);

type ScopedInteractionModule = InteractionModule & { guilds: GuildScope };

/**
 * Registers interaction definitions with Discord and wires their handlers
 * to matching interaction events.
 *
 * Routers without `guilds` are registered globally once the client is ready.
 * Routers with `guilds` are registered as guild commands whenever a guild becomes
 * available or is joined (this requires the `Guilds` intent). All scoped routers
 * matching a guild are combined into a single bulk overwrite for that guild.
 *
 * Registered commands are cached by discord.js in `client.application.commands.cache`
 * (global) and `guild.commands.cache` (per guild).
 * @param client
 * @param modules
 */
export const registerInteractionRouters = async (
  client: Client,
  modules: InteractionModule[],
): Promise<void> => {
  const globalDefinitions = collectDefinitions(modules.filter((v) => v.guilds === undefined));
  const globalBody = [...globalDefinitions.commands, ...globalDefinitions.menus].map(
    (v) => v.definition.toJSON() as RESTPostAPIApplicationCommandsJSONBody,
  );
  const scopedModules = modules.filter((v): v is ScopedInteractionModule => v.guilds !== undefined);
  const guildDefinitions = new Map<Snowflake, RegisteredInteractionDefinitions>();
  const handledGuilds = new Set<Snowflake>();

  const definitionsFor = (commandGuildId: Snowflake | null) =>
    commandGuildId === null
      ? globalDefinitions
      : (guildDefinitions.get(commandGuildId) ?? emptyDefinitions);

  client.setMaxListeners(client.getMaxListeners() + 1);
  client.on(`interactionCreate`, async (interaction) => {
    if (interaction.isAutocomplete()) {
      const { commands } = definitionsFor(interaction.commandGuildId);
      const command = findDefinition(commands, interaction.commandName);
      await command?.autocompleteHandler?.(interaction);
      return;
    }

    if (interaction.isChatInputCommand()) {
      const { commands } = definitionsFor(interaction.commandGuildId);
      const command = findDefinition(commands, interaction.commandName);
      await command?.handler(interaction);
      return;
    }

    if (interaction.isContextMenuCommand()) {
      const { menus } = definitionsFor(interaction.commandGuildId);
      const menu = findDefinition(menus, interaction.commandName);
      await menu?.handler(interaction);
    }
  });

  if (scopedModules.length > 0) {
    const registerGuild = async (guild: Guild) => {
      if (handledGuilds.has(guild.id)) return;
      handledGuilds.add(guild.id);

      try {
        const matches = await Promise.all(
          scopedModules.map(async ({ guilds }) =>
            typeof guilds === `function` ? guilds(guild) : guilds.includes(guild.id),
          ),
        );
        const definitions = collectDefinitions(scopedModules.filter((_, i) => matches[i]));
        const body = [...definitions.commands, ...definitions.menus].map(
          (v) => v.definition.toJSON() as RESTPostAPIApplicationCommandsJSONBody,
        );
        if (body.length === 0) return;

        guildDefinitions.set(guild.id, definitions);
        await guild.commands.set(body);
      } catch (error) {
        handledGuilds.delete(guild.id);
        guildDefinitions.delete(guild.id);
        throw error;
      }
    };

    client.setMaxListeners(client.getMaxListeners() + 3);
    client.on(`guildAvailable`, registerGuild);
    client.on(`guildCreate`, registerGuild);
    client.on(`guildDelete`, (guild) => {
      handledGuilds.delete(guild.id);
      guildDefinitions.delete(guild.id);
    });

    await Promise.all(client.guilds.cache.filter((v) => v.available).map(registerGuild));
  }

  if (client.isReady()) {
    await client.application.commands.set(globalBody);
    return;
  }

  client.setMaxListeners(client.getMaxListeners() + 1);
  client.once(`clientReady`, async (readyClient) => {
    await readyClient.application.commands.set(globalBody);
  });
};

export const globInteractionRouters = async (client: Client, pattern: string, baseDir?: string) => {
  const discovered = await glob(pattern, baseDir);
  const valid = discovered.flatMap(({ module, path }) =>
    Object.values(module)
      .filter((v) => isInteractionModule(v))
      .map((interactionModule) => ({ module: interactionModule, path })),
  );

  await registerInteractionRouters(
    client,
    valid.map(({ module }) => module),
  );

  return valid;
};
