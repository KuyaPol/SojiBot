// deploy-commands.js (CommonJS version)
const { REST, Routes } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env
config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[WARNING] Command at ${file} is missing "data" or "execute".`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔁 Deploying ${commands.length} command(s)...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`✅ Successfully reloaded ${commands.length} command(s).`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
