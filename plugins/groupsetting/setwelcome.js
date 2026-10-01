import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"setwelcome", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["setwelcome <pesan>"], description:"Mengubah pesan welcome", usage:".setwelcome Selamat datang @user di @grup", async execute(ctx){
  const text=ctx.args.join(" "); if(!text)return ctx.reply("❌ Masukkan pesan. Placeholder: @user @grup @tanggal @jam");
  const s=getGroupSettings(ctx.chat); s.welcome.message=text; s.welcome.enabled=true; updateGroupSettings(ctx.chat,s); return ctx.reply("✅ Pesan welcome disimpan dan diaktifkan.");
}};
