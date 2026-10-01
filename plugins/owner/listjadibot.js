import { listBots } from "../../core/bot/manager.js";
export default { apiVersion:1, command:"listjadibot", category:"owner", permissions:["BOT_OWNER"], help:["listjadibot"], description:"Melihat Jadibot", usage:".listjadibot", async execute(ctx){
  const bots=listBots().filter(x=>x.status==="active"); if(!bots.length)return ctx.reply("📭 Belum ada Jadibot aktif.");
  return ctx.reply(`🤖 *JADIBOT AKTIF*\n\n${bots.map((b,i)=>`${i+1}. ${b.phone}\n   Status: ${b.running?"🟢 Online":"🟡 Starting"}`).join("\n\n")}`);
}};
