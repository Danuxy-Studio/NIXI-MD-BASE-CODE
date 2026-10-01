import { getBotSettings, updateBotSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"antispam", category:"owner", permissions:["BOT_OWNER"], help:["antispam on/off/status/reset"], description:"Atur anti-spam global", usage:".antispam on", async execute(ctx){
  const arg=String(ctx.args[0]||"status").toLowerCase(); const s=getBotSettings();
  if(arg==="status")return ctx.reply(`🛡️ *ANTI-SPAM GLOBAL*\nStatus: ${s.antiSpam?"✅ ON":"❌ OFF"}\nMode: ⚠️ Warning saja`);
  if(!["on","off"].includes(arg))return ctx.reply("Gunakan: .antispam on/off/status");
  updateBotSettings({antiSpam:arg==="on"}); return ctx.reply(`✅ Anti-spam global ${arg==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
