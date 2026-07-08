import { type APIApplicationCommand, type Client, Routes } from 'discord.js';

import { interactionModuleBrand } from '../routers/symbols';
import { glob } from '../utils';
import type {
  InteractionDefinition,
  InteractionModule,
  InteractionModuleShape,
  InteractionType,
} from './types';

export * from './types';

export const createInteractionRouter = (module: InteractionModuleShape): InteractionModule => ({
  ...module,
  [interactionModuleBrand]: true,
});

const createSingle = <T extends InteractionType>(key: T, interaction: InteractionDefinition<T>) =>
  createInteractionRouter({
    [key]: [interaction],
  });

export const createInteractionRouterCommand = (command: InteractionDefinition<`commands`>) =>
  createSingle(`commands`, command);

export const createInteractionRouterMenu = (menu: InteractionDefinition<`menus`>) =>
  createSingle(`menus`, menu);

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

const findDefinition = <T extends InteractionType>(
  definitions: InteractionDefinition<T>[],
  commandName: string,
) => definitions.find((v) => v.definition.name === commandName);

/**
 * Registers interaction definitions with Discord and wires their handlers
 * to matching interaction events.
 * @param client
 * @param modules
 * @returns An eventually populated list of APIApplicationCommand,
 * but it will not include delayed clientReady registration results
 * until after clientReady has fired.
 */
export const registerInteractionRouters = async (
  client: Client,
  modules: InteractionModule[],
): Promise<APIApplicationCommand[]> => {
  const definitions = collectDefinitions(modules);

  client.setMaxListeners(client.getMaxListeners() + 1);
  client.on(`interactionCreate`, async (interaction) => {
    if (interaction.isAutocomplete()) {
      const command = findDefinition(definitions.commands, interaction.commandName);
      await command?.autocompleteHandler?.(interaction);
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = findDefinition(definitions.commands, interaction.commandName);
      await command?.handler(interaction);
      return;
    }

    if (interaction.isContextMenuCommand()) {
      const menu = findDefinition(definitions.menus, interaction.commandName);
      await menu?.handler(interaction);
    }
  });

  const results: APIApplicationCommand[] = [];

  const register = async (applicationId: string) => {
    const interactions = [...definitions.commands, ...definitions.menus].map((v) =>
      v.definition.toJSON(),
    );
    const res = await client.rest.put(Routes.applicationCommands(applicationId), {
      body: interactions,
    });
    const commands = res as APIApplicationCommand[];
    results.push(...commands);
  };

  const applicationId = client?.user?.id;
  if (applicationId) await register(applicationId);

  client.setMaxListeners(client.getMaxListeners() + 1);
  client.once(`clientReady`, (c) => register(c.user.id));
  return results;
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
