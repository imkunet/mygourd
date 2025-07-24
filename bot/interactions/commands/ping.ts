import { SlashCommandBuilder } from 'discord.js';
import { createInteractionRouterCommand } from 'mygourd/interactions';

export default createInteractionRouterCommand({
  definition: new SlashCommandBuilder()
    .setName(`ping`)
    .setDescription(`Pings the bot!`),
  handler: async (event) => {
    await event.reply({
      content: `pong`,
      flags: `Ephemeral`,
    });
  },
});
