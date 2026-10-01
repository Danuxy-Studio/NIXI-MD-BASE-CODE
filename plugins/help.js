import { commands } from "../core/command/index.js";
export default {
  apiVersion: 1, command: "help", aliases: ["h"], category: "main",
  description: "Melihat command yang tersedia", usage: ".help [command]", permissions: [], cooldown: 1,
  async execute(ctx) {
    if (ctx.args[0]) {
      const c = commands.resolve(ctx.args[0]);
      if (!c) return ctx.reply("Command tidak ditemukan.");
      return ctx.reply(`*${c.command.toUpperCase()}*\n\nDeskripsi: ${c.description || "-"}\nUsage: ${c.usage || ctx.prefix + c.command}\nAlias: ${c.aliases?.length ? c.aliases.join(", ") : "-"}`);
    }
    const list = commands.list();
    if (!list.length) return ctx.reply("Belum ada command yang terdaftar.");
    const groups = {};
    for (const c of list) (groups[c.category || "general"] ??= []).push(c);
    let out = "📖 *NIXI-MD-BASE-CODE HELP*\n";
    for (const [cat, items] of Object.entries(groups)) {
      out += `\n*${cat.toUpperCase()}*\n` + items.map(c => `• ${ctx.prefix}${c.command} — ${c.description || "-"}`).join("\n") + "\n";
    }
    return ctx.reply(out);
  }
};
