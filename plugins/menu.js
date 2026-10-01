import moment from "moment-timezone";
import bot from "../config/bot.js";
import { getRandomQuote } from "../lib/utils/quotes.js";

moment.tz.setDefault(bot.timezone || "Asia/Jakarta");

const display = {
  main: ["📋", "Main"], owner: ["👑", "Owner"], groupsetting: ["⚙️", "Group Setting"],
  admin: ["🔧", "Admin Group"], tools: ["🛠️", "Tools"], store: ["🛍️", "Store"],
  games: ["🎮", "Games"], maker: ["📷", "Maker"], sticker: ["🎨", "Sticker"],
  downloader: ["📥", "Downloader"], jadwal: ["📅", "Jadwal"], ai: ["🤖", "AI"],
  group: ["👥", "Group"], security: ["🛡️", "Security"], info: ["ℹ️", "Info"],
  system: ["⚙️", "System"]
};

const runtime = seconds => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [d && `${d} Hari`, h && `${h} Jam`, m && `${m} Menit`, s && `${s} Detik`].filter(Boolean).join(" ") || "0 Detik";
};

const handler = {
  name: "menu",
  command: "menu",
  aliases: [],
  category: "main",
  help: ["menu"],
  async execute(ctx) {
    const groups = new Map();
    const visible = ctx.commands.list().filter(c => !c.hidden && !c.excludeFromMenu);

    for (const command of visible) {
      const category = String(command.category || "main").toLowerCase();
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(command.command);
    }

    const sections = [
      {
        title: "✨ Shortcut",
        rows: [
          { header: "", title: "📋 All Menu", description: "Lihat semua command bot", id: `${ctx.prefix}allmenu` },
          { header: "", title: "👤 Owner", description: "Kontak owner bot", id: `${ctx.prefix}owner` }
        ]
      }
    ];

    for (const category of [...groups.keys()].sort((a, b) => a.localeCompare(b))) {
      const [emoji, name] = display[category] || ["📁", category.charAt(0).toUpperCase() + category.slice(1)];
      sections[0].rows.push({
        header: "",
        title: `${emoji} ${name}`,
        description: `Command di ${name}`,
        id: `${ctx.prefix}category ${category}`
      });
    }

    const now = moment().tz(bot.timezone || "Asia/Jakarta");
    const quote = getRandomQuote?.() || { quote: "", by: "" };
    const caption = `💗 *${bot.name}* 💗\n\n` +
      `👤 *User* : ${ctx.pushName || "User"}\n` +
      `📦 *Version* : ${bot.version}\n` +
      `🌸 *Creator* : ${global.dev || "Danuxy Studio"}\n\n` +
      `📅 *Date* : ${now.format("dddd, D MMMM YYYY")}\n` +
      `⏰ *Time* : ${now.format("HH:mm:ss")} WIB\n` +
      `⏱️ *Runtime* : ${runtime(process.uptime())}\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `💬 *"${quote.quote}"*\n` +
      `— ${quote.by}\n` +
      `━━━━━━━━━━━━━━━\n\n` +
      `📌 *Pilih menu di bawah ini:*`;

    await ctx.bot.sendMessage(ctx.chat, {
      image: { url: global.thumb || "https://www.danuxy.com/public/images/logo.png" },
      caption,
      footer: `© ${bot.name}`,
      buttons: [{ text: "📋 Pilih Menu", sections }],
      headerType: 1
    }, { quoted: ctx.message });
  }
};

export default handler;
