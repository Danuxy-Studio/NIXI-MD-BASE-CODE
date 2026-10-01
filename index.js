import { app } from "./core/app/index.js";
import { events } from "./core/event/index.js";
import { commands } from "./core/command/index.js";
import { buildContext } from "./core/app/context.js";
import { logger } from "./core/logger/index.js";
import { runtime } from "./core/runtime/index.js";
import bot from "./config/bot.js";
import messages from "./config/messages.js";
import { handleMessageGuards, handleGroupSettingUpdate } from "./core/guards/index.js";
import { getBotSettings } from "./core/settings/index.js";
import { isOwnerNumber } from "./core/settings/owner.js";
import { getPhoneNumberFromJid } from "./lib/jid.js";
import { stopAllBots } from "./core/bot/manager.js";

let sockRef = null;

events.on("bot.connected", sock => { global.sock = sock; sockRef = sock; });

events.on("message.received", async m => {
  if (!runtime.accepting || !global.sock) return;
  const botSettings = getBotSettings();
  if (botSettings.autoRead) { try { await global.sock.readMessages([m.key]); } catch {} }
  const guard = await handleMessageGuards(global.sock, m);
  if (guard.blocked) return;

  const body = String(m.body || "");
  if (!body.startsWith(bot.prefix)) return;
  const raw = body.slice(bot.prefix.length).trim();
  if (!raw) return;
  const parts = raw.split(/\s+/);
  const command = (parts.shift() || "").toLowerCase();
  if (command.length > 60) return;

  const ctx = await buildContext(global.sock, m);
  ctx.args = parts.slice(0, 50);
  ctx.command = command;
  ctx.prefix = bot.prefix;
  ctx.text = ctx.args.join(" ");

  if (!ctx.isGroup && !ctx.isOwner) {
    await ctx.reply(messages.system.groupOnly);
    return;
  }

  logger.commandReceived(ctx.number || ctx.sender, `${bot.prefix}${command}${parts.length ? ` ${parts.join(" ")}` : ""}`, ctx.isGroup);
  await commands.execute(ctx);
});

events.on("call.received", async (calls, sock) => {
  const settings = getBotSettings();
  if (!settings.antiCall || !Array.isArray(calls)) return;
  for (const call of calls) {
    if (call?.status !== "offer") continue;
    const from = call.from || "";
    const number = await getPhoneNumberFromJid(sock, from);
    if (number && (isOwnerNumber(number) || (bot.isJadibot && bot.owner && String(bot.owner).replace(/\D/g, "") === number))) continue;
    try { await sock.rejectCall(call.id, from); } catch (e) { logger.error("Gagal menolak panggilan", { error: e.message }); }
    try {
      await sock.sendMessage(from, { text: "📵 Maaf, bot tidak dapat menerima panggilan. Silakan gunakan chat." });
    } catch {}
    logger.warn(`Incoming call rejected from ${number || from}`);
  }
});

events.on("group.participants", async (update, sock) => {
  try { await handleGroupSettingUpdate(sock, update); } catch (e) { logger.error("Group participant handler failed", { error: e.stack || String(e) }); }
});

events.on("bot.reconnecting", () => logger.warn(messages.connection.reconnecting));
events.on("plugin.error", (e, meta) => logger.error("Plugin isolated", { ...meta, error: e.stack || String(e) }));

process.on("SIGINT", () => { stopAllBots(); app.stop().finally(() => process.exit(0)); });
process.on("SIGTERM", () => { stopAllBots(); app.stop().finally(() => process.exit(0)); });

await app.start();
