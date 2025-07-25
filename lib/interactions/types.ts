import {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import Module from 'node:module';

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

export type InteractionModule = Module & {
  default: InteractionModuleShapeFull;
};

export type InteractionModuleShape = Partial<{
  [T in InteractionType]: InteractionDefinition<T>[];
}>;

export type InteractionModuleShapeFull = InteractionModuleShape & {
  __mygourd: `interaction`;
};

export type SerializableShape = { name: string; toJSON(): unknown };
