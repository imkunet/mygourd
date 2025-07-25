import { type ClientEvents } from 'discord.js';
import Module from 'node:module';

export type EventModule = Module & {
  default: EventModuleShapeFull;
};

export type EventModuleShape = Partial<{
  [K in keyof ClientEvents]: (...args: ClientEvents[K]) => unknown;
}>;

export type EventModuleShapeFull = EventModuleShape & {
  __mygourd: `events`;
};
