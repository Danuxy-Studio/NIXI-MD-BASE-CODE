import { normalizePhone, botIdFromPhone, startBot } from "../../core/bot/manager.js";
export default { apiVersion:1, command:"jadibot", category:"owner", permissions:["BOT_OWNER"], help:["jadibot <nomor>"], description:"Membuat bot tambahan", usage:".jadibot 628xxx", async execute(ctx){
  const phone=normalizePhone(ctx.args.join(""));
  if(!phone) return ctx.reply("❌ Nomor tidak valid. Gunakan format 628xxxxxxxxxx.");
  const result=startBot({botId:botIdFromPhone(phone),phone,owner:ctx.number,pairingCode:"NIXIMDBASE"});
  if(result.alreadyRunning) return ctx.reply(`⚠️ Jadibot ${phone} sudah berjalan.`);
  await ctx.reply(`🤖 *Jadibot sedang disiapkan*\n📱 ${phone}\n⏳ Menunggu pairing code...`);
  try {
    const pair=await result.pairingPromise;
    if(pair?.code) await ctx.reply(`🔐 *PAIRING CODE*\n\n🤖 ${phone}\n🔑 *${pair.code}*\n\nWhatsApp → Perangkat tertaut → Tautkan dengan nomor telepon.`);
    else if(pair?.alreadyRegistered) await ctx.reply(`✅ Session Jadibot ${phone} sudah ada. Bot sedang tersambung.`);
    const ready=await result.readyPromise;
    if(ready) await ctx.reply(`🎉 *Jadibot aktif!*\n📱 ${phone}\n🟢 Online & siap digunakan.`);
  } catch(error){ await ctx.reply(`❌ Jadibot gagal: ${error.message}`); }
}};
