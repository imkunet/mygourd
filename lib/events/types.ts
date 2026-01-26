import { type ClientEvents } from 'discord.js';

import type { eventModuleBrand } from '@/routers/symbols';

export type EventModule = EventModuleShape & {
  [eventModuleBrand]: true;
};

export type EventModuleShape = Partial<{
  [K in keyof ClientEvents]: (..._args: ClientEvents[K]) => unknown;
}>;
