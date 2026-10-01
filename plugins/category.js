const display = {
  main: ["📋", "Main"], owner: ["👑", "Owner"], groupsetting: ["⚙️", "Group Setting"],
  admin: ["🔧", "Admin Group"], tools: ["🛠️", "Tools"], store: ["🛍️", "Store"],
  games: ["🎮", "Games"], maker: ["📷", "Maker"], sticker: ["🎨", "Sticker"],
  downloader: ["📥", "Downloader"], jadwal: ["📅", "Jadwal"], ai: ["🤖", "AI"],
  group: ["👥", "Group"], security: ["🛡️", "Security"], info: ["ℹ️", "Info"],
  system: ["⚙️", "System"]
};

const handler = {
  name: "category",
  command: "category",
  aliases: ["cat"],
  category: "main",
  help: ["category <nama>"],
  hidden: true,
  excludeFromMenu: true,
  async execute(ctx) {
    const requested = String(ctx.args[0] || "").toLowerCase();
    const available = [...new Set(ctx.commands.list().filter(c => !c.hidden && !c.excludeFromMenu).map(c => c.category || "main"))].sort();

    if (!requested) {
      return ctx.reply(`📂 *Kategori tersedia:*\n\n${available.map(x => `• ${x}`).join("\n")}`);
    }

    const commands = ctx.commands.list()
      .filter(c => String(c.category || "main").toLowerCase() === requested && !c.hidden && !c.excludeFromMenu)
      .sort((a, b) => a.command.localeCompare(b.command));

    if (!commands.length) return ctx.reply("❌ Kategori tidak ditemukan atau belum memiliki command.");

    const [emoji, name] = display[requested] || ["📁", requested.charAt(0).toUpperCase() + requested.slice(1)];
    const rows = commands.map(command => ({
      title: `${ctx.prefix}${command.command}`,
      description: Array.isArray(command.help) ? command.help[0] : (command.help || ""),
      id: `${ctx.prefix}${command.command}`
    }));

    const nativeFlow = [{
      text: `${emoji} ${name}`,
      sections: [{ title: `${emoji} ${name}`, rows }]
    }, {
      text: "📋 Menu",
      id: `${ctx.prefix}menu`,
      icon: "default"
    }];

    await ctx.bot.sendMessage(ctx.chat, {
      image: { url: global.thumb || "https://www.danuxy.com/public/images/logo.png" },
      text: `${emoji} *${name}*\n\nPilih command di bawah ini:`,
      footer: `© ${ctx.bot.user?.name || "NIXI-MD-BASE-CODE"}`,
      optionText: "📋 Pilih Command",
      optionTitle: `${emoji} ${name}`,
      nativeFlow,
      interactiveAsTemplate: false
    }, { quoted: ctx.message });
  }
};

export default handler;
