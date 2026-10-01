import { getGroupSettings, updateGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"antispamgrup", aliases:["antispamgc"], category:"groupsetting", permissions:["GROUP_ADMIN"], help:["antispamgrup on/off/status"], description:"Atur anti-spam grup", usage:".antispamgrup on", async execute(ctx){
  const a=String(ctx.args[0]||"status").toLowerCase(); const s=getGroupSettings(ctx.chat);
  if(a==="status")return ctx.reply(`🛡️ Anti Spam Grup: ${s.antiSpam.enabled?"✅ ON":"❌ OFF"}\nLimit: ${s.antiSpam.maxMessage} pesan / ${s.antiSpam.interval} detik`);
  if(!["on","off"].includes(a))return ctx.reply("Gunakan: .antispamgrup on/off/status");
  s.antiSpam.enabled=a==="on"; updateGroupSettings(ctx.chat,s); return ctx.reply(`✅ Anti-spam grup ${a==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
