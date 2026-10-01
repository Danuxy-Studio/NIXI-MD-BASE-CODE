import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"antitoxic", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["antitoxic on/off/status"], description:"Atur Anti-Toxic grup", usage:".antitoxic on", async execute(ctx){
  if (!ctx.isBotAdmin) return ctx.reply("Bot bukan admin!");
  const a=String(ctx.args[0]||"status").toLowerCase(); const s=getGroupSettings(ctx.chat);
  if(a==="status")return ctx.reply(`🤬 Anti-Toxic: ${s.antiToxic?"✅ ON":"❌ OFF"}\nTindakan: hapus pesan + warning/kick.`);
  if(!["on","off"].includes(a))return ctx.reply("Gunakan: .antitoxic on/off/status");
  s.antiToxic=a==="on"; updateGroupSettings(ctx.chat,s); return ctx.reply(`✅ Anti-Toxic ${a==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
