import type {
  AutocompleteInteraction,
  Awaitable,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  Guild,
  SlashCommandBuilder,
  Snowflake,
} from 'discord.js';

import type { interactionModuleBrand } from '../routers/symbols';

export type InteractionEventMapper = {
  commands: ChatInputCommandInteraction;
  menus: ContextMenuCommandInteraction;
};

export type InteractionShapeMapper = {
  commands: SerializableShape | SlashCommandBuilder;
  menus: ContextMenuCommandBuilder | SerializableShape;
};

export type InteractionType = keyof InteractionEventMapper | keyof InteractionShapeMapper;

// <- //

export type InteractionDefinition<T extends InteractionType> = {
  definition: InteractionShapeMapper[T];
  handler: (_event: InteractionEventMapper[T]) => unknown;
} & (T extends `commands`
  ? {
      autocompleteHandler?: (_event: AutocompleteInteraction) => unknown;
    }
  : object);

/**
 * Which guilds a router is registered to: either a fixed list of guild ids,
 * or a predicate evaluated once for every guild as it becomes available or is joined.
 */
export type GuildScope = ((_guild: Guild) => Awaitable<boolean>) | readonly Snowflake[];

export type InteractionRouterOptions = {
  /**
   * Registers the router as guild commands in matching guilds instead of globally.
   */
  guilds?: GuildScope;
};

export type InteractionModule = InteractionModuleShape & {
  [interactionModuleBrand]: true;
};

export type InteractionModuleShape = InteractionRouterOptions &
  Partial<{
    [T in InteractionType]: InteractionDefinition<T>[];
  }>;

export type SerializableShape = { name: string; toJSON(): unknown };
