import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, fallback = "") => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};
const hasArg = name => args.includes(`--${name}`);

const mode = getArg("mode", "main");
const botId = getArg("id", "main");
const phone = getArg("phone", "");
const owner = getArg("owner", "");
const pairingCode = getArg("pairing", "");

export default {
  name: "NIXI-MD-BASE-CODE",
  version: "4.0.1",
  prefix: ".",
  timezone: "Asia/Jakarta",
  instance: mode === "jadibot" ? `JADIBOT:${phone || botId}` : "MAIN",
  debug: false,

  phone,
  owner,
  pairingCode: pairingCode || "NIXIMDBASE",
  mode,
  botId,
  isJadibot: mode === "jadibot" || hasArg("jadibot"),

  // Satu session utama + session terisolasi untuk setiap Jadibot.
  sessionDirectory: mode === "jadibot"
    ? path.join("sessions", "jadibot", botId || "unknown")
    : path.join("sessions", "main")
};
