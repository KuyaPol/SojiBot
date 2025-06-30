// commands/setconfig.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setConfig } = require('../utils/configManager');

const allowedKeys = {
  INACTIVE_DAYS: 'number',
  ROLE_TO_REMOVE: 'string',
  LOG_CHANNEL_ID: 'string'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setconfig')
    .setDescription('Update a server config setting.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('key')
        .setDescription('The config key to change.')
        .setRequired(true)
        .addChoices(
          { name: 'INACTIVE_DAYS', value: 'INACTIVE_DAYS' },
          { name: 'ROLE_TO_REMOVE', value: 'ROLE_TO_REMOVE' },
          { name: 'LOG_CHANNEL_ID', value: 'LOG_CHANNEL_ID' }
        ))
    .addStringOption(option =>
      option.setName('value')
        .setDescription('The new value for this config key.')
        .setRequired(true)),

  async execute(interaction) {
    const key = interaction.options.getString('key');
    const rawValue = interaction.options.getString('value');
    const expectedType = allowedKeys[key];
    let value = rawValue;

    // Type validation
    if (expectedType === 'number') {
      value = Number(rawValue);
      if (isNaN(value)) {
        return interaction.reply({ content: `❌ \`${key}\` must be a number.`, ephemeral: true });
      }
    }

    setConfig(interaction.guild.id, key, value);

    return interaction.reply({
      content: `✅ Updated \`${key}\` to \`${value}\`.`,
      ephemeral: true
    });
  }
};
