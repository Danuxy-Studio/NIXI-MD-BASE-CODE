import { setBan } from "../../core/settings/index.js";
import { commands } from "../../core/command/index.js";

export default {
  apiVersion: 1, command: "bancmd", category: "security", permissions: ["BOT_OWNER"], allowWhenBanned: true,
  aliases: ["unbancmd"],
  help: ["bancmd <command>", "unbancmd <command>"],
  description: "Blokir atau buka command secara global",
  async execute(ctx) {
    const action = ctx.command === "unbancmd" ? "unban" : "ban";
    const key = String(ctx.args[0] || "").toLowerCase().replace(/^\./, "");
    if (!key) return ctx.reply(`Gunakan: .${ctx.command} <command>`);
    const target = commands.resolve(key);
    if (!target) return ctx.reply(`❌ Command *${key}* tidak ditemukan.`);
    setBan("bot", "command", target.command, action === "ban", null, ctx.number || ctx.sender);
    return ctx.reply(action === "ban" ? `🚫 Command *.${target.command}* diblokir secara global.` : `🔓 Command *.${target.command}* dibuka kembali secara global.`);
  }
};
