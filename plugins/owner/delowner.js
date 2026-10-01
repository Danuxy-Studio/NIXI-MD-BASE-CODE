import { removeOwner } from "../../core/settings/owner.js";
export default { apiVersion:1, command:"delowner", aliases:["removeowner"], category:"owner", permissions:["BOT_OWNER"], help:["delowner <nomor>"], description:"Menghapus owner", usage:".delowner 628xxx", async execute(ctx){
  const result=removeOwner(ctx.args.join(""));
  if(!result.ok){const map={protected:"🛡️ Owner utama tidak dapat dihapus.",not_found:"⚠️ Nomor tersebut bukan owner.",invalid:"❌ Nomor tidak valid."};return ctx.reply(map[result.reason]||"❌ Gagal menghapus owner.");}
  return ctx.reply(`✅ Owner berhasil dihapus.\n📱 ${result.number}`);
}};
