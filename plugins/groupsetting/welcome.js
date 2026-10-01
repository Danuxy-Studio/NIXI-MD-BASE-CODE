import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"welcome", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["welcome on/off"], description:"Atur welcome grup", usage:".welcome on", async execute(ctx){
  const a=String(ctx.args[0]||"status").toLowerCase(); const s=getGroupSettings(ctx.chat);
  if(a==="status")return ctx.reply(`👋 Welcome: ${s.welcome.enabled?"✅ ON":"❌ OFF"}`);
  if(!["on","off"].includes(a))return ctx.reply("Gunakan: .welcome on/off/status");
  s.welcome.enabled=a==="on"; updateGroupSettings(ctx.chat,s); return ctx.reply(`✅ Welcome ${a==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
