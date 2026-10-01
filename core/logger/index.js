import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import bot from "../../config/bot.js";
import loggerConfig from "../../config/logger.js";

const dir = path.resolve(loggerConfig.directory || "logs");
fs.mkdirSync(dir, { recursive: true });

const files = {
  bot: "bot.log",
  error: "error.log",
  command: "command.log",
  database: "database.log",
  system: "system.log"
};

const BOT_LABEL = bot.instance || "MAIN";

const label = chalk.bgMagenta.white.bold(` ${BOT_LABEL} `);
const dim = chalk.gray;
const colors = {
  chat: chalk.white,
  cmd: chalk.cyan,
  info: chalk.blue,
  success: chalk.green,
  error: chalk.red,
  warn: chalk.yellow,
  debug: chalk.magenta
};

const redact = value => String(value)
  .replace(/(api[_-]?key|token|password|secret|authorization)(\s*[=:]\s*)[^\s,}]+/gi, "$1$2[REDACTED]");

const time = () => new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  timeZone: loggerConfig.timezone || bot.timezone || "Asia/Jakarta"
}).format(new Date());

function line(icon, message, color = chalk.white) {
  return `${chalk.gray(time())} ${label} ${icon} ${color(String(message))}`;
}

function write(kind, level, message, meta = {}) {
  const stamp = new Date().toISOString();
  const details = Object.keys(meta).length ? ` ${redact(JSON.stringify(meta))}` : "";
  try {
    fs.appendFileSync(path.join(dir, files[kind] || files.bot), `[${stamp}] [${level}] ${redact(message)}${details}\n`);
  } catch {}
}

export const logger = {
  chat(sender, name, message, isGroup = false) {
    const clean = String(sender || "Unknown").replace(/@s\.whatsapp\.net|@lid/g, "").replace(/^lid:/i, "");
    const icon = isGroup ? "👥" : "👤";
    const text = `${name || "Unknown"} ${dim(`(${clean})`)} : ${message || ""}`;
    console.log(line(icon, text, colors.chat));
    write("bot", "CHAT", text, { sender: clean, group: isGroup });
  },
  commandReceived(sender, command, isGroup = false) {
    const clean = String(sender || "Unknown").replace(/@s\.whatsapp\.net|@lid/g, "").replace(/^lid:/i, "");
    const icon = isGroup ? "👥" : "👤";
    const text = `${clean} : ${command || ""}`;
    console.log(line(icon, text, colors.cmd));
    write("command", "RECEIVED", text, { sender: clean, group: isGroup });
  },
  info(message, meta = {}) {
    console.log(line("ℹ️", message, colors.info));
    write("system", "INFO", message, meta);
  },
  success(message, meta = {}) {
    console.log(line("✅", message, colors.success));
    write("system", "SUCCESS", message, meta);
  },
  warn(message, meta = {}) {
    console.log(line("⚠️", message, colors.warn));
    write("system", "WARN", message, meta);
  },
  error(message, meta = {}) {
    console.error(line("❌", message, colors.error));
    write("error", "ERROR", message, meta);
  },
  debug(message, meta = {}) {
    if (!bot.debug) return;
    console.log(line("🐛", message, colors.debug));
    write("system", "DEBUG", message, meta);
  },
  bot(message, meta = {}) {
    console.log(line("🤖", message, colors.success));
    write("bot", "BOT", message, meta);
  },
  command(message, meta = {}) {
    write("command", "COMMAND", message, meta);
  },
  database(message, meta = {}) {
    write("database", "DATABASE", message, meta);
  },
  flush() {}
};

export default logger;
