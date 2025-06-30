const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const { flaggedUsers } = require('../utils/cache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a specific role from inactive users.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to remove from inactive users')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('days')
        .setDescription('Number of days of inactivity')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const days = interaction.options.getInteger('days');
    const guild = interaction.guild;

    if (!role || !days) {
      return interaction.reply({
        content: '❌ Please provide both a role and a valid number of days.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const now = Date.now();
    let removedCount = 0;
    let skippedCount = 0;

    try {
      const members = await guild.members.fetch();

      const promises = members.map(async member => {
        if (
          member.user.bot ||
          member.permissions.has(PermissionFlagsBits.Administrator)
        ) return;

        const lastMessageTime = member.lastMessage?.createdTimestamp || 0;
        const inactiveTime = now - lastMessageTime;
        const hasRole = member.roles.cache.has(role.id);

        if (inactiveTime > days * 24 * 60 * 60 * 1000 && hasRole) {
          try {
            await member.roles.remove(role);
            removedCount++;
          } catch (err) {
            console.warn(`❌ Failed to remove role from ${member.user.tag}`);
            skippedCount++;
          }
        }
      });

      await Promise.all(promises);

      const resultEmbed = new EmbedBuilder()
        .setTitle('🧹 Inactive Role Removal Complete')
        .setDescription(
          `✅ Removed **${removedCount}** user(s) from **${role.name}**.\n⚠️ Skipped **${skippedCount}** due to errors or permissions.`
        )
        .setColor('Red')
        .setTimestamp();

      await interaction.editReply({ embeds: [resultEmbed] });

    } catch (err) {
      console.error('Error during role removal:', err);
      return interaction.editReply({
        content: '❌ An error occurred while processing the command.',
        ephemeral: true
      });
    }
  }
};
