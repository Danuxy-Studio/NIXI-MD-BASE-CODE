import { normalizePhone, botIdFromPhone, stopBot } from "../../core/bot/manager.js";
export default { apiVersion:1, command:"stopjadibot", category:"owner", permissions:["BOT_OWNER"], help:["stopjadibot <nomor>"], description:"Menghentikan Jadibot", usage:".stopjadibot 628xxx", async execute(ctx){
  const phone=normalizePhone(ctx.args[0]); if(!phone)return ctx.reply("❌ Nomor tidak valid.");
  return ctx.reply(stopBot(botIdFromPhone(phone))?`🛑 Jadibot ${phone} dihentikan.`:`⚠️ Jadibot ${phone} tidak sedang berjalan.`);
}};
