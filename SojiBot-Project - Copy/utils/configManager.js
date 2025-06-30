// utils/configManager.js
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config-store.json');

let configs = {};

if (fs.existsSync(configPath)) {
  configs = JSON.parse(fs.readFileSync(configPath));
}

function getConfig(guildId) {
  return configs[guildId] || configs.default || {};
}

function setConfig(guildId, key, value) {
  if (!configs[guildId]) configs[guildId] = {};
  configs[guildId][key] = value;
  fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
}

module.exports = {
  getConfig,
  setConfig
};

// Command to set configuration values;

// /setconfig key: INACTIVE_DAYS value: 14
// /setconfig key: ROLE_TO_REMOVE value: 123456789012345678
// /setconfig key: LOG_CHANNEL_ID value: 987654321098765432
