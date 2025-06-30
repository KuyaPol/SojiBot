const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getFailedDMs } = require('../utils/cache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dmfail_export')
    .setDescription('📤 Export the list of users the bot failed to DM')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const failed = getFailedDMs(interaction.guild.id);

    if (!failed || failed.length === 0) {
      return interaction.reply({
        content: '✅ No failed DM attempts found.',
        flags: 64
      });
    }

    const content = `Failed DM Export\nGuild: ${interaction.guild.name}\nExported: ${new Date().toISOString()}\n\n` +
      failed.map(u => `${u.userTag} (${u.userId})`).join('\n');

    const filePath = path.join(__dirname, `failed_dms_${interaction.guild.id}.txt`);
    fs.writeFileSync(filePath, content);

    const file = new AttachmentBuilder(filePath);

    await interaction.reply({
      content: `📄 Export complete! ${failed.length} failed DMs listed.`,
      files: [file],
      flags: 64
    });

    fs.unlinkSync(filePath); // Clean up
  }
};
