import { getBotSettings, updateBotSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"botsetting", aliases:["botsettings","bsetting"], category:"security", permissions:["BOT_OWNER"], help:["botsetting"], description:"Melihat dan mengatur Bot Setting", usage:".botsetting", async execute(ctx){
  const key=String(ctx.args[0]||"").toLowerCase(); const value=String(ctx.args[1]||"").toLowerCase(); const s=getBotSettings();
  const map={antispam:"antiSpam",anticall:"antiCall",autoread:"autoRead"};
  if(!key)return ctx.reply(`⚙️ *BOT SETTING*\n\nAnti Spam: ${s.antiSpam?"✅":"❌"}\nAnti Call: ${s.antiCall?"✅":"❌"}\nAuto Read: ${s.autoRead?"✅":"❌"}\nGlobal Mute User: ${Object.keys(s.muteUsers||{}).length}\nBan Command: ${Object.keys(s.bannedCommands||{}).length}\nBan Category: ${Object.keys(s.bannedCategories||{}).length}\n\nGunakan: .botsetting <antispam|anticall|autoread> <on|off>`);
  const field=map[key]; if(!field||!['on','off'].includes(value))return ctx.reply("❌ Setting tidak valid.");
  const patch={}; patch[field]=value==="on"; updateBotSettings(patch); return ctx.reply(`✅ ${key} ${value==="on"?"diaktifkan":"dinonaktifkan"}.`);
}};
