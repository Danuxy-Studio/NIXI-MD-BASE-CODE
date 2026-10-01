import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"goodbye", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["goodbye on/off"], description:"Atur goodbye grup", usage:".goodbye on", async execute(ctx){
  const a=String(ctx.args[0]||"status").toLowerCase(); const s=getGroupSettings(ctx.chat);
  if(a==="status")return ctx.reply(`👋 Goodbye: ${s.goodbye.enabled?"✅ ON":"❌ OFF"}`);
  if(!["on","off"].includes(a))return ctx.reply("Gunakan: .goodbye on/off/status");
  s.goodbye.enabled=a==="on"; updateGroupSettings(ctx.chat,s); return ctx.reply(`✅ Goodbye ${a==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
