import {
  type APIApplicationCommand,
  type Client,
  type Interaction,
  Routes,
} from 'discord.js';

import { entries, glob } from '@/utils';

import type {
  InteractionDefinition,
  InteractionModule,
  InteractionModuleShape,
  InteractionModuleShapeFull,
  InteractionType,
} from './types';

export * from './types';

export const createInteractionRouter = (
  module: InteractionModuleShape,
): InteractionModuleShapeFull => ({
  ...module,
  __mygourd: `interaction`,
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

const toShape = (
  v: InteractionModule | InteractionModuleShapeFull,
): InteractionModuleShapeFull => (v as InteractionModule)?.default ?? v;

const isShape = (
  v: InteractionModuleShapeFull,
): v is InteractionModuleShapeFull =>
  typeof v === `object` && v.__mygourd === `interaction`;

const predicateMapper = {
  commands: (event: Interaction) => event.isChatInputCommand(),
  menus: (event: Interaction) => event.isContextMenuCommand(),
};

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
  modules: (InteractionModule | InteractionModuleShapeFull)[],
): Promise<APIApplicationCommand[]> => {
  const definitions = modules
    .map((v) => toShape(v))
    .filter((v) => isShape(v))
    .map(({ __mygourd, ...shape }) => shape)
    .flatMap((v) => entries(v))
    .map(([key, definition]) => {
      client.on(`interactionCreate`, async (interaction) => {
        if (!predicateMapper[key](interaction)) return;
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
  const discovered = await glob<InteractionModule>(pattern, baseDir);

  registerInteractionRouters(
    client,
    discovered.map(({ module }) => module),
  );

  return discovered
    .map(({ module, path }) => ({ path, shape: toShape(module) }))
    .filter(({ shape }) => isShape(shape));
};
