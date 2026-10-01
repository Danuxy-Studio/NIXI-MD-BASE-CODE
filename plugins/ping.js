import axios from "axios";

const handler = {
  name: "ping",
  command: "ping",
  aliases: [],
  category: "info",
  help: ["ping"],
  permissions: [],
  cooldown: 1,
  async execute(ctx) {
    const domain = "https://www.google.com";

    try {
      await ctx.react("⏰");

      const start = process.hrtime();
      if (ctx.args.length > 0) {
        await axios.get(domain, { timeout: 5000 });
      }
      const end = process.hrtime(start);
      const seconds = end[0] + end[1] / 1e9;

      await ctx.reply(`⌬ _Response Time :_ ${seconds.toFixed(6)} s`);
    } catch (error) {
      await ctx.reply("❌ Maaf, terjadi kesalahan saat melakukan ping. Coba lagi nanti!");
    }
  }
};

export default handler;
