export default { apiVersion:1, command:"listgc", aliases:["listgroups","grouplist","listgrp"], category:"owner", permissions:["BOT_OWNER"], help:["listgc"], description:"Melihat daftar grup bot", usage:".listgc", async execute(ctx){
  try {
    const groups=await ctx.bot.groupFetchAllParticipating(); const ids=Object.keys(groups||{});
    if(!ids.length)return ctx.reply("📭 Bot belum bergabung di grup mana pun.");
    const lines=[`📋 *GRUP BOT*`,`📊 Total: ${ids.length}`,""];
    ids.sort((a,b)=>(groups[a]?.subject||"").localeCompare(groups[b]?.subject||""));
    ids.forEach((id,i)=>{const g=groups[id]; lines.push(`${i+1}. ${g?.subject||"Tanpa nama"}\n   🆔 ${id}\n   👥 ${g?.participants?.length||0} anggota`);});
    return ctx.reply(lines.join("\n"));
  } catch(e){ return ctx.reply(`❌ Gagal mengambil daftar grup: ${e.message}`); }
}};
