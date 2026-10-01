import { setGroupMute } from "../../core/settings/index.js";
import { resolveTarget } from "../../core/utils/target.js";
export default { apiVersion:1, command:"unmute", category:"groupsetting", permissions:["GROUP_ADMIN"], help:["unmute @user"], description:"Unmute member di grup", usage:".unmute @user", async execute(ctx){
  const target=await resolveTarget(ctx); if(!target?.number)return ctx.reply("❌ Tag atau reply user yang ingin di-unmute.");
  setGroupMute(ctx.chat,target.number,false,ctx.number); return ctx.reply(`🔊 ${target.number} di-unmute di grup ini.`);
}};
