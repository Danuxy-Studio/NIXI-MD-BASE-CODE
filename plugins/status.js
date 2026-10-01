import os from "node:os";
import { commands } from "../core/command/index.js";
import { plugins } from "../core/plugin/index.js";
import { runtime, uptime } from "../core/runtime/index.js";
import { formatUptime } from "../core/utils/index.js";
export default {
  apiVersion: 1, command: "status", category: "main", description: "Melihat status runtime bot", usage: ".status", permissions: [], cooldown: 2,
  async execute(ctx) {
    const mem = process.memoryUsage();
    return ctx.reply(`🤖 *NIXI-MD-BASE-CODE*\n\nStatus: ONLINE\nUptime: ${formatUptime(uptime())}\nMemory: ${Math.round(mem.rss / 1024 / 1024)} MB\nPlugins: ${plugins.list().length}\nCommands: ${commands.list().length}\nDatabase: OK\nConnection: ${ctx.bot?.user ? "ONLINE" : "READY"}\nMaintenance: ${runtime.maintenance ? "ON" : "OFF"}\nNode: ${process.version}\nPlatform: ${os.platform()} ${os.arch()}`);
  }
};
