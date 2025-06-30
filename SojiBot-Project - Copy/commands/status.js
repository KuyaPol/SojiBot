const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig } = require('../utils/configManager');
const { flaggedUsers } = require('../utils/cache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('📊 Shows current inactivity flags')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const config = getConfig(interaction.guild.id);
    const entries = Array.from(flaggedUsers.entries());

    if (entries.length === 0) {
      return interaction.reply({
        content: '✅ No flagged users currently.',
        ephemeral: true
      });
    }

    await interaction.reply({
  content: '✅ Export complete!',
  flags: 64 // 64 = Ephemeral flag
});
await interaction.editReply({
  content: '✅ Done.',
  flags: 64
});


    const lines = entries.map(([userId, data]) => {
      const timestamp = Math.floor(new Date(data.warnedAt).getTime() / 1000);
      return `• <@${userId}> — flagged <t:${timestamp}:R>`;
    });

    const chunks = [];
    let currentChunk = [];
    let totalLength = 0;

    for (const line of lines) {
      if (totalLength + line.length + 1 > 4000) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        totalLength = 0;
      }
      currentChunk.push(line);
      totalLength += line.length + 1;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }

    for (let i = 0; i < chunks.length; i++) {
      const embed = new EmbedBuilder()
        .setTitle(`📋 Inactivity Status ${chunks.length > 1 ? `(Page ${i + 1}/${chunks.length})` : ''}`)
        .setDescription(chunks[i])
        .setColor('Blue')
        .setFooter({
          text: `Inactive after ${config.INACTIVE_DAYS} days • Total flagged: ${entries.length}`
        })
        .setTimestamp();

      if (i === 0) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      }
    }
  }
};
