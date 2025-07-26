import {
  type APIApplicationCommand,
  type Client,
  type Interaction,
  Routes,
} from 'discord.js';

import { interactionModuleBrand } from '@/routers/symbols';
import { glob } from '@/utils';

import type {
  InteractionDefinition,
  InteractionModule,
  InteractionModuleShape,
  InteractionType,
} from './types';

export * from './types';

export const createInteractionRouter = (
  module: InteractionModuleShape,
): InteractionModule => ({
  ...module,
  [interactionModuleBrand]: true,
});

const createSingle = <T extends InteractionType>(
  key: T,
  interaction: InteractionDefinition<T>,
) =>
  createInteractionRouter({
    [key]: [interaction],
  });

export const createInteractionRouterCommand = (
  command: InteractionDefinition<`commands`>,
) => createSingle(`commands`, command);

export const createInteractionRouterMenu = (
  menu: InteractionDefinition<`menus`>,
) => createSingle(`menus`, menu);

export const isInteractionModule = (v: unknown): v is InteractionModule =>
  v !== null && typeof v === `object` && interactionModuleBrand in v;

const predicateMapper = {
  commands: (event: Interaction) => event.isChatInputCommand(),
  menus: (event: Interaction) => event.isContextMenuCommand(),
} as const;

/**
 * This is probably the most scuffed function here
 * @param client
 * @param modules
 * @returns An eventually populated list of APIApplicationCommand,
 * but you will not know when this is populated. Have fun with that!
 * Please only use this if you don't have any other mechanism to
 * retrieve this data.
 */
export const registerInteractionRouters = async (
  client: Client,
  modules: InteractionModule[],
): Promise<APIApplicationCommand[]> => {
  const definitions = modules
    .flatMap((v) => Object.entries(v))
    .map(([key, definition]) => {
      client.on(`interactionCreate`, async (interaction) => {
        if (!predicateMapper[key as InteractionType](interaction)) return;
        // actual crisis in understanding of TS
        definition.forEach(async (v) => {
          if (v.definition.name === interaction.commandName)
            await v.handler(interaction as never);
        });
      });

      return definition;
    });

  const results: APIApplicationCommand[] = [];

  const register = async (applicationId: string) => {
    const interactions = definitions.flat().map((v) => v.definition.toJSON());
    const res = await client.rest.put(
      Routes.applicationCommands(applicationId),
      { body: interactions },
    );
    const commands = res as APIApplicationCommand[];
    results.push(...commands);
  };

  // this has to be cursed luckily I'm the only one using this library...
  // right?
  const applicationId = client?.user?.id;
  if (applicationId) register(applicationId);

  client.once(`ready`, (c) => register(c.user.id));
  return results;
};

export const globInteractionRouters = async (
  client: Client,
  pattern: string,
  baseDir?: string,
) => {
  const discovered = await glob(pattern, baseDir);
  const valid = discovered.flatMap(({ module, path }) =>
    Object.values(module)
      .filter((v) => isInteractionModule(v))
      .map((module) => ({ module, path })),
  );

  registerInteractionRouters(
    client,
    valid.map(({ module }) => module),
  );

  return valid;
};
