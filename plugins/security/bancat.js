import { setBan } from "../../core/settings/index.js";

export default {
  apiVersion: 1, command: "bancat", category: "security", permissions: ["BOT_OWNER"], allowWhenBanned: true,
  aliases: ["unbancat"],
  help: ["bancat <category>", "unbancat <category>"],
  description: "Blokir atau buka kategori command secara global",
  async execute(ctx) {
    const action = ctx.command === "unbancat" ? "unban" : "ban";
    const key = String(ctx.args[0] || "").toLowerCase();
    if (!key) return ctx.reply(`Gunakan: .${ctx.command} <category>`);
    setBan("bot", "category", key, action === "ban", null, ctx.number || ctx.sender);
    return ctx.reply(action === "ban" ? `🚫 Kategori *${key}* diblokir secara global.` : `🔓 Kategori *${key}* dibuka kembali secara global.`);
  }
};
