import { backup } from "../../core/backup/index.js";
export default { apiVersion:1, command:"backup", category:"owner", permissions:["BOT_OWNER"], help:["backup"], description:"Membuat backup database", usage:".backup", async execute(ctx){
  try { const result=await backup.create("database", "manual"); return ctx.reply(`💾 Backup berhasil dibuat.\n📁 ${result || "backups/manual"}`); } catch(e){ return ctx.reply(`❌ Backup gagal: ${e.message}`); }
}};
