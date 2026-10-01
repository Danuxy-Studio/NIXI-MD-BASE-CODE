import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"setgoodbye", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["setgoodbye <pesan>"], description:"Mengubah pesan goodbye", usage:".setgoodbye Selamat tinggal @user", async execute(ctx){
  const text=ctx.args.join(" "); if(!text)return ctx.reply("❌ Masukkan pesan. Placeholder: @user @grup @tanggal @jam");
  const s=getGroupSettings(ctx.chat); s.goodbye.message=text; s.goodbye.enabled=true; updateGroupSettings(ctx.chat,s); return ctx.reply("✅ Pesan goodbye disimpan dan diaktifkan.");
}};
