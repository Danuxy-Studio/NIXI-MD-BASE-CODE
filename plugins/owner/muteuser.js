import { setGlobalMute, isGlobalMuted } from "../../core/settings/index.js";
import { resolveTarget } from "../../core/utils/target.js";
export default { apiVersion:1, command:"muteuser", aliases:["unmuteuser"], category:"owner", permissions:["BOT_OWNER"], help:["muteuser @user", "unmuteuser @user"], description:"Mute user secara global", usage:".muteuser @user", async execute(ctx){
  const target=await resolveTarget(ctx); if(!target?.number)return ctx.reply("❌ Tag atau reply user yang ingin di-mute.");
  if (target.number === ctx.number) return ctx.reply("❌ Kamu tidak bisa me-mute diri sendiri.");
  const mute=ctx.command==="muteuser"; setGlobalMute(target.number,mute,ctx.number);
  return ctx.reply(mute?`🔇 ${target.number} sekarang di-mute secara global.`:`🔊 ${target.number} sudah di-unmute secara global.`);
}};
