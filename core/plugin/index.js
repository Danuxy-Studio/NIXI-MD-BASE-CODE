import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { commands } from "../command/index.js";
import { events } from "../event/index.js";
import { logger } from "../logger/index.js";

export class PluginManager {
  constructor(dir = "plugins") {
    this.dir = dir;
    this.plugins = new Map();
  }

  discover() {
    if (!fs.existsSync(this.dir)) return [];
    const out = [];
    const walk = d => {
      for (const f of fs.readdirSync(d).sort()) {
        const p = path.join(d, f);
        const s = fs.statSync(p);
        if (s.isDirectory()) walk(p);
        else if (f.endsWith(".js")) out.push(p);
      }
    };
    walk(this.dir);
    return out;
  }

  categoryFor(file) {
    const rel = path.relative(path.resolve(this.dir), path.resolve(file));
    const parts = rel.split(path.sep);
    return (parts.length > 1 ? parts[0] : "main").toLowerCase();
  }

  async load(file, { silent = true } = {}) {
    const key = path.resolve(file);
    try {
      if (this.plugins.has(key)) await this.unload(key);
      const mod = await import(`${pathToFileURL(key).href}?v=${Date.now()}`);
      const plugin = mod.default || mod;
      if (!plugin || typeof plugin !== "object") throw new Error("Plugin must export metadata object");
      if (plugin.apiVersion !== undefined && plugin.apiVersion !== 1) {
        throw new Error(`Unsupported apiVersion ${plugin.apiVersion}`);
      }

      const inferredCategory = String(
        plugin.category ||
        (Array.isArray(plugin.tag) ? plugin.tag[0] : plugin.tag) ||
        this.categoryFor(key)
      ).toLowerCase();

      const item = {
        ...plugin,
        file: key,
        status: "LOADING",
        category: inferredCategory,
        commands: []
      };
      this.plugins.set(key, item);

      const list = plugin.commands || ((plugin.command || plugin.execute) ? [plugin] : []);
      for (const c of list) {
        const reg = commands.register({ ...c, category: c.category || inferredCategory }, key);
        item.commands.push(reg.command);
      }

      if (typeof plugin.init === "function") await plugin.init(this.api());
      item.status = "READY";
      await events.emit("plugin.loaded", item);
      return item;
    } catch (e) {
      this.plugins.delete(key);
      logger.error(`Plugin failed: ${path.basename(key)}`, { plugin: key, error: e.stack || String(e) });
      await events.emit("plugin.error", e, { plugin: key });
      if (!silent) throw e;
      return null;
    }
  }

  async unload(file) {
    const key = path.resolve(file);
    const item = this.plugins.get(key);
    if (!item) return false;
    commands.unregisterByPlugin(key);
    try {
      if (typeof item.destroy === "function") await item.destroy(this.api());
    } catch (e) {
      logger.error("Plugin unload failed", { plugin: key, error: e.stack || String(e) });
    }
    this.plugins.delete(key);
    await events.emit("plugin.unloaded", item);
    return true;
  }

  async reload(file) {
    const key = path.resolve(file);
    await this.unload(key);
    return this.load(key);
  }

  async loadAll() {
    const files = this.discover();
    const summary = new Map();

    for (const file of files) {
      const rel = path.relative(path.resolve(this.dir), path.resolve(file));
      const parts = rel.split(path.sep);
      const folder = parts.length > 1 ? parts[0] : "main";
      if (!summary.has(folder)) summary.set(folder, { loaded: 0, failed: 0, commands: 0, errors: [] });

      const item = await this.load(file);
      const bucket = summary.get(folder);
      if (item) {
        bucket.loaded++;
        bucket.commands += item.commands.length;
      } else {
        bucket.failed++;
        bucket.errors.push(path.relative(process.cwd(), file));
      }
    }

    logger.info("📦 Plugin Loader Summary:");
    for (const [folder, data] of [...summary.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const icon = data.failed ? "⚠️" : "✅";
      logger.info(`${icon} ${folder.padEnd(15)} → ${data.loaded} plugins | ${data.commands} commands${data.failed ? ` | ${data.failed} failed` : ""}`);
      for (const errorFile of data.errors) logger.error(`   └─ ${errorFile}`);
    }

    return this.plugins.size;
  }

  list() {
    return [...this.plugins.values()].map(x => ({
      file: x.file,
      status: x.status,
      category: x.category,
      commands: x.commands
    }));
  }

  api() {
    return { events, logger, commands };
  }
}

export const plugins = new PluginManager();
