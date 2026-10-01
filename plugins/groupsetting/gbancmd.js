import { setBan } from "../../core/settings/index.js";
import { commands } from "../../core/command/index.js";

export default {
  apiVersion: 1, command: "gbancmd", category: "groupsetting", permissions: ["GROUP_ADMIN"], allowWhenBanned: true,
  aliases: ["gunbancmd"],
  help: ["gbancmd <command>", "gunbancmd <command>"],
  description: "Blokir atau buka command di grup ini",
  async execute(ctx) {
    if (!ctx.isGroup) return ctx.reply("❌ Command ini hanya bisa digunakan di grup.");
    const action = ctx.command === "gunbancmd" ? "unban" : "ban";
    const key = String(ctx.args[0] || "").toLowerCase().replace(/^\./, "");
    if (!key) return ctx.reply(`Gunakan: .${ctx.command} <command>`);
    const target = commands.resolve(key);
    if (!target) return ctx.reply(`❌ Command *${key}* tidak ditemukan.`);
    setBan("group", "command", target.command, action === "ban", ctx.chat, ctx.number || ctx.sender);
    return ctx.reply(action === "ban" ? `🚫 Command *.${target.command}* diblokir di grup ini.` : `🔓 Command *.${target.command}* dibuka kembali di grup ini.`);
  }
};
