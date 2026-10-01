import { addOwner } from "../../core/settings/owner.js";
export default { apiVersion:1, command:"addowner", category:"owner", permissions:["BOT_OWNER"], help:["addowner <nomor>"], description:"Menambahkan owner", usage:".addowner 628xxx", async execute(ctx){
  const result=addOwner(ctx.args.join(""));
  if(!result.ok) return ctx.reply(result.reason==="exists"?"⚠️ Nomor tersebut sudah menjadi owner.":"❌ Nomor owner tidak valid.");
  return ctx.reply(`✅ Owner berhasil ditambahkan.\n📱 ${result.number}`);
}};
