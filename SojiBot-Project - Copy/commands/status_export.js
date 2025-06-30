const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { getConfig } = require('../utils/configManager');
const { flaggedUsers } = require('../utils/cache');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status_export')
    .setDescription('📤 Export list of flagged inactive users as a .txt file')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const config = getConfig(interaction.guild.id);
    const entries = Array.from(flaggedUsers.entries());

    if (entries.length === 0) {
      return interaction.reply({
        content: '✅ No flagged users to export.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const lines = entries.map(([userId, data]) => {
      const timestamp = new Date(data.warnedAt).toISOString();
      return `${data.userTag} (${userId}) - Flagged at: ${timestamp}`;
    });

    const content = `Flagged Inactive Users Export\nTotal: ${entries.length}\n\n` + lines.join('\n');

    const filePath = path.join(__dirname, `flagged_users_${interaction.guild.id}.txt`);
    fs.writeFileSync(filePath, content);

    const file = new AttachmentBuilder(filePath);

    await interaction.editReply({
      content: `📄 Export complete! File contains ${entries.length} flagged users.`,
      files: [file]
    });

    fs.unlinkSync(filePath); // Clean up temp file
  }
};
