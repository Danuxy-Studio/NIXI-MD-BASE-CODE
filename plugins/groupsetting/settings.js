import { getGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"groupsetting", aliases:["groupsettings","gset"], category:"groupsetting", permissions:["GROUP_ADMIN"], help:["groupsetting"], description:"Melihat pengaturan grup", usage:".groupsetting", async execute(ctx){
  const s=getGroupSettings(ctx.chat); const b=x=>x?"✅ ON":"❌ OFF";
  return ctx.reply(`⚙️ *GROUP SETTING*\n\nWelcome: ${b(s.welcome?.enabled)}\nGoodbye: ${b(s.goodbye?.enabled)}\nAnti Spam: ${b(s.antiSpam?.enabled)}\nAnti SW: ${b(s.antiSw)}\nAnti Toxic: ${b(s.antiToxic)}\nMuted User: ${Object.keys(s.mutedUsers||{}).length}\nBanned Command: ${Object.keys(s.bannedCommands||{}).length}\nBanned Category: ${Object.keys(s.bannedCategories||{}).length}`);
}};
