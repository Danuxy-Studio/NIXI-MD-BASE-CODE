import path from "node:path";

const display = {
  main: ["📋", "Main"], owner: ["👑", "Owner"], groupsetting: ["⚙️", "Group Setting"],
  admin: ["🔧", "Admin Group"], tools: ["🛠️", "Tools"], store: ["🛍️", "Store"],
  games: ["🎮", "Games"], maker: ["📷", "Maker"], sticker: ["🎨", "Sticker"],
  downloader: ["📥", "Downloader"], jadwal: ["📅", "Jadwal"], ai: ["🤖", "AI"],
  group: ["👥", "Group"], security: ["🛡️", "Security"], info: ["ℹ️", "Info"],
  system: ["⚙️", "System"]
};

const handler = {
  name: "allmenu",
  command: "allmenu",
  aliases: [],
  category: "main",
  help: ["allmenu"],
  async execute(ctx) {
    const categories = new Map();
    const visible = ctx.commands.list().filter(c => !c.hidden && !c.excludeFromMenu);

    for (const command of visible) {
      const category = String(command.category || "main").toLowerCase();
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push(command);
    }

    let text = `📋 *ALL MENU - ${ctx.bot.user?.name || "NIXI-MD-BASE-CODE"}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📌 *Total:* ${visible.length} command\n\n`;

    for (const category of [...categories.keys()].sort((a, b) => a.localeCompare(b))) {
      const [emoji, name] = display[category] || ["📁", category.charAt(0).toUpperCase() + category.slice(1)];
      text += `${emoji} *${name}*\n`;
      for (const command of categories.get(category).sort((a, b) => a.command.localeCompare(b.command))) {
        text += `• ${ctx.prefix}${command.command}\n`;
      }
      text += `\n`;
    }

    // allmenu sengaja text-only. Jika terlalu panjang, kirim sebagai file teks.
    if (text.length > 4000) {
      await ctx.bot.sendMessage(ctx.chat, {
        document: Buffer.from(text, "utf8"),
        mimetype: "text/plain",
        fileName: "allmenu.txt",
        caption: `📋 *ALL MENU*\n📌 Total: ${visible.length} command`
      }, { quoted: ctx.message });
      return;
    }

    await ctx.reply(text);
  }
};

export default handler;
