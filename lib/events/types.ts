import { type ClientEvents } from 'discord.js';
import Module from 'node:module';

export type EventModule = Module & {
  default: EventModuleShapeFull;
};

export type EventModuleShape = Partial<{
  [K in keyof ClientEvents]: (...args: ClientEvents[K]) => Promise<void> | void;
}>;

export type EventModuleShapeFull = EventModuleShape & {
  __mygourd: `events`;
};
