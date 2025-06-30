// commands/help.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists all available bot commands.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 SojiBot Commands')
      .setColor('Green')
      .addFields(
        { name: '/ping', value: 'Check if the bot is online.' },
        { name: '/checkinactive', value: 'Scan for inactive members and warn them via DM.' },
        { name: '/remove', value: 'Remove roles from all flagged users. (Admin only)' },
        { name: '/status', value: 'View currently flagged (inactive) members.' },
      )
      .setFooter({ text: 'For questions, contact your server admin.' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
