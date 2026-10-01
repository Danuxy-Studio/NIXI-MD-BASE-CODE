import { createRateLimiter } from "../security/index.js";
import { events } from "../event/index.js";
import { logger } from "../logger/index.js";
import messages from "../../config/messages.js";
import behavior from "../../config/behavior.js";
import { getBotSettings, getGroupSettings, isCommandBanned, isCategoryBanned, isGlobalMuted, isGroupMuted } from "../settings/index.js";

const permissionMessage = key => messages.permission[key] || messages.command.error;

function levenshtein(a, b) {
  const left = String(a || "").toLowerCase();
  const right = String(b || "").toLowerCase();
  const prev = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 1; i <= left.length; i++) {
    const cur = [i];
    for (let j = 1; j <= right.length; j++) {
      cur[j] = Math.min(
        cur[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
    }
    prev.splice(0, prev.length, ...cur);
  }
  return prev[right.length];
}

function suggestCommands(input, registry, limit = 3) {
  const needle = String(input || "").toLowerCase().trim();
  if (!needle) return [];

  return registry.list()
    .filter(c => !c.hidden && !c.excludeFromMenu)
    .map(c => {
      const name = String(c.command).toLowerCase();
      const distance = levenshtein(needle, name);
      const prefix = name.startsWith(needle) || needle.startsWith(name);
      const contains = name.includes(needle) || needle.includes(name);
      const similarity = 1 - distance / Math.max(needle.length, name.length, 1);
      return { command: name, distance, prefix, contains, similarity };
    })
    .filter(x =>
      x.distance <= Math.max(2, Math.floor(Math.max(needle.length, 1) * 0.45)) ||
      x.prefix || x.contains
    )
    .sort((a, b) =>
      Number(b.prefix) - Number(a.prefix) ||
      Number(b.contains) - Number(a.contains) ||
      b.similarity - a.similarity ||
      a.distance - b.distance ||
      a.command.localeCompare(b.command)
    )
    .slice(0, limit)
    .map(x => x.command);
}

async function replyWithSuggestions(ctx, registry) {
  const suggestions = suggestCommands(ctx.command, registry, 3);
  const prefix = ctx.prefix || ".";
  const typed = `${prefix}${ctx.command || ""}`;

  if (!suggestions.length) {
    await ctx.reply(
      `❌ Command *${typed}* tidak ditemukan.\n\n` +
      `💡 Coba gunakan *${prefix}menu* untuk melihat command yang tersedia.`
    );
    return;
  }

  const rows = suggestions.map(command => ({
    header: "",
    title: `${prefix}${command}`,
    description: "Coba command ini",
    id: `${prefix}${command}${ctx.args?.length ? ` ${ctx.args.join(" ")}` : ""}`
  }));

  await ctx.bot.sendMessage(ctx.chat, {
    text:
      `❌ Command *${typed}* tidak ditemukan.\n\n` +
      `🤔 *Mungkin maksud kamu:*`,
    footer: "NIXI-MD-BASE-CODE",
    buttons: [{
      text: "🔎 Pilih Command",
      sections: [{
        title: "💡 Rekomendasi Command",
        rows
      }]
    }],
    headerType: 1
  }, { quoted: ctx.message });
}


export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.cooldowns = new Map();
    this.rate = createRateLimiter(behavior.commandRate);
  }

  register(meta, plugin) {
    if (!meta?.command || typeof meta.execute !== "function") throw new Error("Invalid command metadata");
    const names = [meta.command, ...(meta.aliases || [])].map(x => String(x).toLowerCase());
    const item = { ...meta, command: names[0], aliases: names.slice(1), plugin, category: String(meta.category || "main").toLowerCase() };
    this.commands.set(item.command, item);
    for (const alias of item.aliases) this.aliases.set(alias, item.command);
    return item;
  }

  unregisterByPlugin(plugin) {
    for (const [key, value] of this.commands) if (value.plugin === plugin) this.commands.delete(key);
    for (const [key, value] of this.aliases) if (!this.commands.has(value)) this.aliases.delete(key);
  }

  resolve(name) {
    const n = String(name).toLowerCase();
    return this.commands.get(n) || this.commands.get(this.aliases.get(n));
  }

  list() { return [...this.commands.values()].sort((a, b) => a.command.localeCompare(b.command)); }
  clear() { this.commands.clear(); this.aliases.clear(); }

  async execute(ctx) {
    const command = this.resolve(ctx.command);
    if (!command) {
      await replyWithSuggestions(ctx, this);
      return { found: false, suggestions: true };
    }

    await events.emit("command.received", ctx, command);

    if (!ctx.isOwner && !ctx.isGroup) {
      await ctx.reply(messages.permission.grup);
      return { blocked: "private" };
    }

    const botSettings = getBotSettings();
    if (!ctx.isOwner && isGlobalMuted(ctx.number)) {
      await ctx.reply(messages.permission.muted);
      return { blocked: "global-muted" };
    }
    if (!ctx.isOwner && ctx.isGroup && isGroupMuted(ctx.chat, ctx.number)) {
      await ctx.reply(messages.permission.mutedGroup);
      return { blocked: "group-muted" };
    }

    if (!command.allowWhenBanned && !ctx.isOwner) {
      const commandBan = isCommandBanned(command.command, ctx.isGroup ? ctx.chat : null);
      if (commandBan.banned) {
        await ctx.reply(commandBan.scope === "group" ? messages.command.bannedGroup : messages.command.banned);
        return { blocked: "banned-command" };
      }
      const categoryBan = isCategoryBanned(command.category, ctx.isGroup ? ctx.chat : null);
      if (categoryBan.banned) {
        await ctx.reply(categoryBan.scope === "group" ? messages.command.categoryBannedGroup : messages.command.categoryBanned);
        return { blocked: "banned-category" };
      }
    }

    if (behavior.maintenance && !ctx.isOwner) {
      await ctx.reply(messages.system.maintenance);
      return { blocked: "maintenance" };
    }

    const permission = await ctx.permission.check(command.permissions || []);
    if (!permission.allowed) {
      const message = permissionMessage(permission.denied);
      await ctx.reply(message);
      logger.warn(`Permission denied: ${permission.denied}`, { command: command.command, sender: ctx.number || ctx.sender, chat: ctx.chat });
      return { blocked: "permission", permission: permission.denied };
    }

    if (!this.rate.check(ctx.sender)) {
      await ctx.reply(messages.command.rateLimit);
      return { blocked: "rate" };
    }

    const cooldown = Number(command.cooldown || 0);
    const key = `${ctx.sender}:${command.command}`;
    const now = Date.now();
    const until = this.cooldowns.get(key) || 0;
    if (until > now) {
      const seconds = Math.ceil((until - now) / 1000);
      await ctx.reply(messages.command.cooldown.replace("%time%", String(seconds)));
      return { blocked: "cooldown" };
    }
    if (cooldown > 0) this.cooldowns.set(key, now + cooldown * 1000);

    const started = Date.now();
    try {
      await command.execute(ctx);
      const duration = Date.now() - started;
      logger.command("Command executed", { command: command.command, plugin: command.plugin, sender: ctx.number || ctx.sender, chat: ctx.chat, duration, status: "success" });
      await events.emit("command.executed", ctx, command, { duration });
      return { ok: true };
    } catch (error) {
      logger.error(`Command failed: ${command.command}`, { plugin: command.plugin, error: error.stack || String(error) });
      await events.emit("command.failed", error, ctx, command);
      await ctx.reply(messages.command.error);
      return { ok: false, error };
    }
  }
}

export const commands = new CommandRegistry();
