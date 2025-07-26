import type { Client } from 'discord.js';

import {
  type EventModule,
  isEventModule,
  registerEventRouters,
} from '@/events';
import {
  type InteractionModule,
  isInteractionModule,
  registerInteractionRouters,
} from '@/interactions';
import { glob } from '@/utils';

type ModuleType = EventModule | InteractionModule;

const shapeHandlers = [
  {
    check: isEventModule,
    handler: (client: Client, modules: ModuleType[]) => {
      registerEventRouters(
        client,
        modules.filter((v) => isEventModule(v)),
      );
    },
  },
  {
    check: isInteractionModule,
    handler: (client: Client, modules: ModuleType[]) => {
      registerInteractionRouters(
        client,
        modules.filter((v) => isInteractionModule(v)),
      );
    },
  },
] as const;

export const globAllRouters = async (
  client: Client,
  pattern: string | string[],
  baseDir?: string,
) => {
  const patternList = typeof pattern === `string` ? [pattern] : pattern;
  const globbed = await Promise.all(patternList.map((v) => glob(v, baseDir)));
  const valid = globbed.flat().flatMap(({ module, path }) =>
    Object.values(module)
      .filter((v) => shapeHandlers.some(({ check }) => check(v)))
      .map((module) => ({ module, path })),
  );

  shapeHandlers.forEach(({ handler }) => {
    handler(
      client,
      valid.map(({ module }) => module as ModuleType),
    );
  });

  return valid;
};
