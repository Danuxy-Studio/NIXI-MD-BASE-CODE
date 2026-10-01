import { setGroupMute } from "../../core/settings/index.js";
import { resolveTarget } from "../../core/utils/target.js";
import { isOwnerNumber } from "../../core/settings/owner.js";
import { isAdmin } from "../../core/app/context.js";
export default { apiVersion:1, command:"mute", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["mute @user", "unmute @user"], description:"Mute member untuk penggunaan bot di grup", usage:".mute @user", async execute(ctx){
  const target=await resolveTarget(ctx); if(!target?.number)return ctx.reply("❌ Tag atau reply user yang ingin di-mute.");
  if(target.number===ctx.number)return ctx.reply("❌ Kamu tidak bisa me-mute diri sendiri.");
  if(isOwnerNumber(target.number))return ctx.reply("❌ Owner bot tidak bisa di-mute.");
  if(await isAdmin(ctx.bot,ctx.chat,target.jid))return ctx.reply("❌ Admin grup tidak bisa di-mute.");
  const mute=ctx.command==="mute"; setGroupMute(ctx.chat,target.number,mute,ctx.number);
  return ctx.reply(mute?`🔇 ${target.number} di-mute di grup ini.`:`🔊 ${target.number} di-unmute di grup ini.`);
}};
