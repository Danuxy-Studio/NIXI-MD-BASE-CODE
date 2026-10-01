export default { apiVersion:1, command:"owner", category:"owner", permissions:[], help:["owner"], description:"Informasi owner", usage:".owner", async execute(ctx){
  const { listOwners } = await import("../../core/settings/owner.js");
  return ctx.reply(`👑 *OWNER*\n\n${listOwners().map(x=>`• ${x}`).join("\n")}`);
}};
