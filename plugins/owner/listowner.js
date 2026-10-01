import { listOwners } from "../../core/settings/owner.js";
export default { apiVersion:1, command:"listowner", category:"owner", permissions:["BOT_OWNER"], help:["listowner"], description:"Melihat daftar owner", usage:".listowner", async execute(ctx){
  const owners=listOwners(); return ctx.reply(`👑 *OWNER*\n\n${owners.map((x,i)=>`${i+1}. ${x}`).join("\n") || "Belum ada owner."}`);
}};
