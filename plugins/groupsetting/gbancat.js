import { setBan } from "../../core/settings/index.js";

export default {
  apiVersion: 1, command: "gbancat", category: "groupsetting", permissions: ["GROUP_ADMIN"], allowWhenBanned: true,
  aliases: ["gunbancat"],
  help: ["gbancat <category>", "gunbancat <category>"],
  description: "Blokir atau buka kategori command di grup ini",
  async execute(ctx) {
    if (!ctx.isGroup) return ctx.reply("❌ Command ini hanya bisa digunakan di grup.");
    const action = ctx.command === "gunbancat" ? "unban" : "ban";
    const key = String(ctx.args[0] || "").toLowerCase();
    if (!key) return ctx.reply(`Gunakan: .${ctx.command} <category>`);
    setBan("group", "category", key, action === "ban", ctx.chat, ctx.number || ctx.sender);
    return ctx.reply(action === "ban" ? `🚫 Kategori *${key}* diblokir di grup ini.` : `🔓 Kategori *${key}* dibuka kembali di grup ini.`);
  }
};
