import type { Client } from 'discord.js';

import { glob } from '@/utils';

import type {
  EventModule,
  EventModuleShape,
  EventModuleShapeFull,
} from './types';

export * from './types';

export const createEventRouter = (
  module: EventModuleShape,
): EventModuleShapeFull => ({
  ...module,
  __mygourd: `events`,
});

const toShape = (v: EventModule | EventModuleShapeFull): EventModuleShapeFull =>
  (v as EventModule)?.default ?? v;

const isShape = (v: EventModuleShapeFull): v is EventModuleShapeFull =>
  typeof v === `object` && v.__mygourd === `events`;

export const registerEventRouters = (
  client: Client,
  modules: (EventModule | EventModuleShapeFull)[],
) =>
  modules
    .map((v) => toShape(v))
    .filter((v) => isShape(v))
    .map(({ __mygourd, ...shape }) => shape)
    .flatMap((v) => Object.entries(v))
    .forEach((v) => client.on(...v));

export const globEventRouters = async (
  client: Client,
  pattern: string,
  baseDir?: string,
) => {
  const discovered = await glob<EventModule>(pattern, baseDir);

  registerEventRouters(
    client,
    discovered.map(({ module }) => module),
  );

  return discovered
    .map(({ module, path }) => ({ path, shape: toShape(module) }))
    .filter(({ shape }) => isShape(shape));
};
