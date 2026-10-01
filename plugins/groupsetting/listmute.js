import { getGroupSettings } from "../../core/settings/index.js";
export default { apiVersion:1, command:"listmute", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["listmute"], description:"Melihat member yang di-mute", usage:".listmute", async execute(ctx){
  const users=Object.keys(getGroupSettings(ctx.chat).mutedUsers||{}); return ctx.reply(`🔇 *MUTE GRUP*\n\n${users.length?users.map((x,i)=>`${i+1}. ${x}`).join("\n"):"Tidak ada member yang di-mute."}`);
}};
