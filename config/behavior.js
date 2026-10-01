export default {
  publicMode: false,
  maintenance: false,
  debug: false,
  commandCooldown: 0,
  messageRate: { max: 20, windowMs: 10000 },
  commandRate: { max: 10, windowMs: 10000 },
  privateChat: "owner-only",
  globalAntiSpam: {
    enabled: true,
    cooldownMs: 2000,
    maxWarning: 3
  }
};
