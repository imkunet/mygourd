import type { Client } from 'discord.js';

import { eventModuleBrand } from '@/routers/symbols';
import { glob } from '@/utils';

import type { EventModule, EventModuleShape } from './types';

export * from './types';

export const createEventRouter = (module: EventModuleShape): EventModule =>
  Object.assign({ ...module }, { [eventModuleBrand]: true as const });

export const isEventModule = (v: unknown): v is EventModule =>
  typeof v === `object` && v !== null && eventModuleBrand in v;

export const registerEventRouters = (client: Client, modules: EventModule[]) =>
  modules
    .map(({ ...shape }) => shape)
    .flatMap((v) => Object.entries(v))
    .forEach((v) => client.on(...v));

export const globEventRouters = async (
  client: Client,
  pattern: string,
  baseDir?: string,
) => {
  const discovered = await glob(pattern, baseDir);
  const valid = discovered.flatMap(({ module, path }) =>
    Object.values(module)
      .filter((v) => isEventModule(v))
      .map((module) => ({ module, path })),
  );

  registerEventRouters(
    client,
    valid.map(({ module }) => module),
  );

  return valid;
};
