import { getBotSettings, updateBotSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"autoread", category:"owner", permissions:["BOT_OWNER"], help:["autoread on/off/status"], description:"Atur auto read pesan", usage:".autoread on", async execute(ctx){
  const a=String(ctx.args[0]||"status").toLowerCase(); const s=getBotSettings();
  if(a==="status")return ctx.reply(`👁️ Auto Read: ${s.autoRead?"✅ ON":"❌ OFF"}`);
  if(!["on","off"].includes(a))return ctx.reply("Gunakan: .autoread on/off/status");
  updateBotSettings({autoRead:a==="on"}); return ctx.reply(`✅ Auto Read ${a==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
