import {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import type { interactionModuleBrand } from '@/routers/symbols';

export type InteractionEventMapper = {
  commands: ChatInputCommandInteraction;
  menus: ContextMenuCommandInteraction;
};

export type InteractionShapeMapper = {
  commands: SerializableShape | SlashCommandBuilder;
  menus: ContextMenuCommandBuilder | SerializableShape;
};

export type InteractionType =
  | keyof InteractionEventMapper
  | keyof InteractionShapeMapper;

// <- //

export type InteractionDefinition<T extends InteractionType> = {
  definition: InteractionShapeMapper[T];
  handler: (event: InteractionEventMapper[T]) => unknown;
};

export type InteractionModule = InteractionModuleShape & {
  [interactionModuleBrand]: true;
};

export type InteractionModuleShape = Partial<{
  [T in InteractionType]: InteractionDefinition<T>[];
}>;

export type SerializableShape = { name: string; toJSON(): unknown };
