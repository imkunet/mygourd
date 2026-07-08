import { SlashCommandBuilder } from 'discord.js';
import { createInteractionRouterCommand } from 'mygourd/interactions';

export const pingCommand = createInteractionRouterCommand({
  definition: new SlashCommandBuilder()
    .setName(`ping`)
    .setDescription(`Pings the bot!`)
    .addStringOption((option) =>
      option.setName(`target`).setDescription(`Who to ping`).setAutocomplete(true),
    ),
  handler: async (event) => {
    const target = event.options.getString(`target`) ?? `world`;

    await event.reply({
      content: `pong ${target}`,
      flags: `Ephemeral`,
    });
  },
  autocompleteHandler: async (event) => {
    const focused = event.options.getFocused().toLowerCase();
    const choices = [`world`, `bot`, `server`];

    await event.respond(
      choices
        .filter((choice) => choice.includes(focused))
        .map((choice) => ({ name: choice, value: choice })),
    );
  },
});
