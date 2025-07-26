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
    handler: (client: Client, module: ModuleType) => {
      if (!isEventModule(module)) return;
      registerEventRouters(client, [module]);
    },
  },
  {
    check: isInteractionModule,
    handler: (client: Client, module: ModuleType) => {
      if (!isInteractionModule(module)) return;
      registerInteractionRouters(client, [module]);
    },
  },
] as const;

export const globRegisterAll = async (
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

  valid.forEach(({ module }) => {
    shapeHandlers.forEach(({ handler }) => {
      handler(client, module);
    });
  });

  return valid;
};
