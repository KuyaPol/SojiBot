// commands/viewconfig.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../utils/configManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewconfig')
    .setDescription('View current config for this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const config = getConfig(interaction.guild.id);
if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
  return interaction.reply({ content: '❌ You need to be an administrator to use this command.', ephemeral: true });
}
    const embed = new EmbedBuilder()
      .setTitle('📋 Current Server Config')
      .setColor('Blue')
      .addFields(
        { name: 'INACTIVE_DAYS', value: `${config.INACTIVE_DAYS ?? 'Not Set'}`, inline: true },
        { name: 'ROLE_TO_REMOVE', value: `<@&${config.ROLE_TO_REMOVE ?? 'Not Set'}>`, inline: true },
        { name: 'LOG_CHANNEL_ID', value: `<#${config.LOG_CHANNEL_ID ?? 'Not Set'}>`, inline: true }
      )
      .setFooter({ text: 'Use /setconfig to update any of these.' });

    return interaction.reply({ embeds: [embed], ephemeral: true });

    
  }
};
