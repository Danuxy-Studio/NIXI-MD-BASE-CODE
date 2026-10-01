import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("database", "system", "settings");
fs.mkdirSync(ROOT, { recursive: true });

const files = {
  bot: path.join(ROOT, "bot.json"),
  groups: path.join(ROOT, "groups.json"),
  owners: path.resolve("database", "system", "owners.json")
};

const defaults = {
  bot: {
    antiSpam: true,
    antiCall: true,
    muteUsers: {},
    bannedCommands: {},
    bannedCategories: {},
    autoRead: true
  },
  group: {
    welcome: { enabled: false, message: "Selamat datang @user di @grup! 🎉" },
    goodbye: { enabled: false, message: "Selamat tinggal @user! 👋" },
    antiSpam: { enabled: false, maxMessage: 5, interval: 15 },
    antiSw: false,
    antiToxic: false,
    mutedUsers: {},
    bannedCommands: {},
    bannedCategories: {}
  }
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function ensure(file, initial) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(initial, null, 2));
}
function read(file, initial) {
  ensure(file, initial);
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch {
    const value = clone(initial);
    fs.writeFileSync(file, JSON.stringify(value, null, 2));
    return value;
  }
}
function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

export function getBotSettings() { return { ...clone(defaults.bot), ...read(files.bot, defaults.bot) }; }
export function updateBotSettings(patch) {
  const next = { ...getBotSettings(), ...patch };
  write(files.bot, next);
  return next;
}

export function getGroupSettings(groupId) {
  const db = read(files.groups, {});
  if (!db[groupId]) {
    db[groupId] = clone(defaults.group);
    write(files.groups, db);
  }
  return { ...clone(defaults.group), ...db[groupId] };
}
export function updateGroupSettings(groupId, patch) {
  const db = read(files.groups, {});
  db[groupId] = { ...getGroupSettings(groupId), ...patch };
  write(files.groups, db);
  return db[groupId];
}

export function getOwners() {
  const db = read(files.owners, []);
  return Array.isArray(db) ? [...new Set(db.map(x => String(x).replace(/\D/g, "")).filter(Boolean))] : [];
}
export function saveOwners(owners) { write(files.owners, [...new Set(owners.map(x => String(x).replace(/\D/g, "")).filter(Boolean))]); }

export function isGlobalMuted(number) { return !!getBotSettings().muteUsers?.[String(number)]; }
export function setGlobalMute(number, muted, by = "system") {
  const settings = getBotSettings();
  settings.muteUsers ||= {};
  if (muted) settings.muteUsers[String(number)] = { at: new Date().toISOString(), by };
  else delete settings.muteUsers[String(number)];
  updateBotSettings(settings);
  return muted;
}

export function isGroupMuted(groupId, number) { return !!getGroupSettings(groupId).mutedUsers?.[String(number)]; }
export function setGroupMute(groupId, number, muted, by = "system") {
  const settings = getGroupSettings(groupId);
  settings.mutedUsers ||= {};
  if (muted) settings.mutedUsers[String(number)] = { at: new Date().toISOString(), by };
  else delete settings.mutedUsers[String(number)];
  return updateGroupSettings(groupId, settings);
}

export function isCommandBanned(command, groupId = null) {
  const bot = getBotSettings();
  if (bot.bannedCommands?.[command]) return { banned: true, scope: "bot" };
  if (groupId) {
    const group = getGroupSettings(groupId);
    if (group.bannedCommands?.[command]) return { banned: true, scope: "group" };
  }
  return { banned: false };
}
export function isCategoryBanned(category, groupId = null) {
  const bot = getBotSettings();
  if (category && bot.bannedCategories?.[category]) return { banned: true, scope: "bot" };
  if (groupId) {
    const group = getGroupSettings(groupId);
    if (category && group.bannedCategories?.[category]) return { banned: true, scope: "group" };
  }
  return { banned: false };
}

export function setBan(scope, type, key, banned, groupId = null, by = "system") {
  const target = scope === "group" ? getGroupSettings(groupId) : getBotSettings();
  const field = type === "category" ? "bannedCategories" : "bannedCommands";
  target[field] ||= {};
  if (banned) target[field][key] = { at: new Date().toISOString(), by };
  else delete target[field][key];
  return scope === "group" ? updateGroupSettings(groupId, target) : updateBotSettings(target);
}

export function listBans(scope, groupId = null) {
  const target = scope === "group" ? getGroupSettings(groupId) : getBotSettings();
  return { commands: Object.keys(target.bannedCommands || {}), categories: Object.keys(target.bannedCategories || {}) };
}

export const settingsPaths = files;
