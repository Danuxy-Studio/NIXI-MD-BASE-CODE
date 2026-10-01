import { getBotSettings, updateBotSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"anticall", aliases:["ac"], category:"owner", permissions:["BOT_OWNER"], help:["anticall on/off/status"], description:"Atur anti-call", usage:".anticall on", async execute(ctx){
  const arg=String(ctx.args[0]||"status").toLowerCase(); const s=getBotSettings();
  if(arg==="status")return ctx.reply(`📞 *ANTI-CALL*\nStatus: ${s.antiCall?"✅ ON":"❌ OFF"}`);
  if(!["on","off"].includes(arg))return ctx.reply("Gunakan: .anticall on/off/status");
  updateBotSettings({antiCall:arg==="on"}); return ctx.reply(`✅ Anti-call ${arg==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
