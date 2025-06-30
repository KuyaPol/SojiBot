// Store users flagged as inactive
const flaggedUsers = new Map();

// Store users who failed to receive a DM
const failedDMsMap = new Map();

function recordFailedDM(guildId, userId, userTag) {
  if (!failedDMsMap.has(guildId)) failedDMsMap.set(guildId, []);
  failedDMsMap.get(guildId).push({ userId, userTag });
}

function getFailedDMs(guildId) {
  return failedDMsMap.get(guildId) || [];
}

module.exports = {
  flaggedUsers,
  recordFailedDM,
  getFailedDMs
};
