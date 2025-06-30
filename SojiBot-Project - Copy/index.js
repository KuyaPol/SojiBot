// sojibot/index.js - Cleaned & Modular Version

const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
require('dotenv').config();

const path = require('path');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

client.commands = new Map(); // ✅ now this comes AFTER client is initialized



const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

client.commands = new Map();
let lastCheckStats = {
  totalChecked: 0,
  inactiveCount: 0,
  rolesRemoved: 0
};

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Skipped ${file} (missing data or execute)`);
    }
  }

  const guild = await client.guilds.fetch(GUILD_ID);
  console.log(`✅ Connected to: ${guild.name}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  console.log('⚡ Interaction command received:', interaction.commandName);

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ content: '❌ Command not found.', ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}:`, error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('❌ There was an error while executing this command!');
    } else {
      await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
    }
  }
});


client.on('error', console.error);
client.login(TOKEN);
