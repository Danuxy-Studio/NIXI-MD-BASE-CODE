import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"antisw", aliases:["antitagsw"], category:"groupsetting", permissions:["GROUP_ADMIN"], help:["antisw on/off/status"], description:"Atur Anti-SW grup", usage:".antisw on", async execute(ctx){
  if (!ctx.isBotAdmin) return ctx.reply("Bot bukan admin!");
  const a=String(ctx.args[0]||"status").toLowerCase(); const s=getGroupSettings(ctx.chat);
  if(a==="status")return ctx.reply(`🚫 Anti-SW: ${s.antiSw?"✅ ON":"❌ OFF"}`);
  if(!["on","off"].includes(a))return ctx.reply("Gunakan: .antisw on/off/status");
  s.antiSw=a==="on"; updateGroupSettings(ctx.chat,s); return ctx.reply(`✅ Anti-SW ${a==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
