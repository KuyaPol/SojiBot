const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { flaggedUsers, recordFailedDM } = require('../utils/cache');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkinactive')
    .setDescription('Checks for inactive users and warns them via DM.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to monitor for inactivity')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of inactivity before warning')
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ You need to be an administrator to use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const role = interaction.options.getRole('role');
    const days = interaction.options.getInteger('days');
    const guild = interaction.guild;
    const now = Date.now();
    let warnedCount = 0;

    const members = await guild.members.fetch();

    for (const member of members.values()) {
      if (
        member.user.bot ||
        member.permissions.has(PermissionFlagsBits.Administrator) ||
        !member.roles.cache.has(role.id)
      ) continue;

      const lastMessageTime = member.lastMessage?.createdTimestamp || 0;
      const inactiveTime = now - lastMessageTime;

      if (inactiveTime > days * 24 * 60 * 60 * 1000) {
        if (!flaggedUsers.has(member.id)) {
          flaggedUsers.set(member.id, {
            userTag: member.user.tag,
            warnedAt: new Date().toISOString()
          });

          try {
            await member.send(`👋 Hey ${member.user.username}, you've been inactive on **${guild.name}** for over **${days} days**. Please participate or your role may be removed.`);
          } catch (err) {
            console.warn(`❌ Could not DM ${member.user.tag}`);
            recordFailedDM(guild.id, member.id, member.user.tag);
          }

          warnedCount++;
        }
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🔍 Inactivity Check Complete')
      .setDescription(`Flagged and warned **${warnedCount}** user(s) with the role **${role.name}** inactive for **${days}** day(s).`)
      .setColor('Yellow')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
