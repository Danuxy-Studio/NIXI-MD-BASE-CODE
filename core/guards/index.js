import { getBotSettings, getGroupSettings, isGlobalMuted, isGroupMuted, updateBotSettings, updateGroupSettings } from "../settings/index.js";
import { isOwnerNumber } from "../settings/owner.js";

const spamMemory = new Map();
const toxicWords = [
  "anjing", "bangsat", "bajingan", "tolol", "goblok", "bodoh", "kontol", "memek", "ngentot", "perek", "babi"
];

export function isToxic(text = "") {
  const normalized = String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  return toxicWords.some(word => new RegExp(`(?:^|\\s)${word}(?:$|\\s)`, "i").test(normalized));
}

export function checkGlobalSpam(number) {
  const settings = getBotSettings();
  if (!settings.antiSpam) return { spam: false };
  const now = Date.now();
  const state = spamMemory.get(number) || { times: [], warnings: 0 };
  state.times = state.times.filter(t => now - t < 2000);
  state.times.push(now);
  if (state.times.length > 1) {
    state.warnings += 1;
    spamMemory.set(number, state);
    return { spam: true, warning: state.warnings };
  }
  spamMemory.set(number, state);
  return { spam: false, warning: state.warnings };
}

export function resetGlobalSpam(number) { spamMemory.delete(number); }

export function checkGroupSpam(groupId, number) {
  const settings = getGroupSettings(groupId);
  if (!settings.antiSpam?.enabled) return { spam: false };
  const now = Date.now();
  const key = `${groupId}:${number}`;
  const state = spamMemory.get(key) || { times: [], warnings: 0 };
  const interval = Number(settings.antiSpam.interval || 15) * 1000;
  state.times = state.times.filter(t => now - t < interval);
  state.times.push(now);
  if (state.times.length > Number(settings.antiSpam.maxMessage || 5)) {
    state.warnings += 1;
    state.times = [];
    spamMemory.set(key, state);
    return { spam: true, warning: state.warnings };
  }
  spamMemory.set(key, state);
  return { spam: false, warning: state.warnings };
}

export function resetGroupSpam(groupId, number) { spamMemory.delete(`${groupId}:${number}`); }

export function isMuted(m) {
  const number = m.number;
  if (!number) return false;
  if (isGlobalMuted(number)) return true;
  if (m.isGroup && isGroupMuted(m.chat, number)) return true;
  return false;
}

export async function handleMessageGuards(sock, m) {
  if (!m || m.fromMe || !m.number) return { blocked: false };
  if (isOwnerNumber(m.number)) return { blocked: false };

  if (isMuted(m)) return { blocked: true, reason: "muted" };

  const globalSpam = checkGlobalSpam(m.number);
  if (globalSpam.spam && globalSpam.warning <= 3) {
    await sock.sendMessage(m.chat, {
      text: `⚠️ @${m.number} terdeteksi spam. Peringatan ${globalSpam.warning}/3.`,
      mentions: [m.sender]
    });
    return { blocked: true, reason: "spam" };
  }

  if (!m.isGroup) return { blocked: false };

  const group = getGroupSettings(m.chat);
  if (group.antiSpam?.enabled) {
    const spam = checkGroupSpam(m.chat, m.number);
    if (spam.spam) {
      await sock.sendMessage(m.chat, {
        text: `⚠️ @${m.number} terdeteksi spam grup. Peringatan ${spam.warning}.`,
        mentions: [m.sender]
      });
      return { blocked: true, reason: "group-spam" };
    }
  }

  if (group.antiSw && isGroupStatusMessage(m.message)) {
    await safeDelete(sock, m);
    await warnAndKick(sock, m, "Mengirim Status WhatsApp ke grup (Anti-SW)");
    return { blocked: true, reason: "anti-sw" };
  }

  if (group.antiToxic && m.body && isToxic(m.body)) {
    await safeDelete(sock, m);
    await warnOnly(sock, m, "Mengirim kata toxic");
    return { blocked: true, reason: "anti-toxic" };
  }

  return { blocked: false };
}

export function isGroupStatusMessage(message) {
  if (!message || typeof message !== "object") return false;
  const keys = ["groupStatusMentionMessage", "groupStatusMessage", "groupStatusMessageV2"];
  let current = message;
  for (let depth = 0; depth < 8 && current; depth++) {
    if (keys.some(k => current[k])) return true;
    current = current.ephemeralMessage?.message || current.viewOnceMessage?.message || current.viewOnceMessageV2?.message || current.documentWithCaptionMessage?.message || null;
  }
  return false;
}

async function safeDelete(sock, m) {
  try {
    await sock.sendMessage(m.chat, { delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key?.id,
      participant: m.key?.participant || m.sender
    }});
  } catch {}
}

async function warnOnly(sock, m, reason) {
  await sock.sendMessage(m.chat, {
    text: `⚠️ @${m.number} melanggar aturan grup.\n📋 Alasan: ${reason}\n📌 Peringatan diberikan.`,
    mentions: [m.sender]
  });
}

async function warnAndKick(sock, m, reason) {
  await sock.sendMessage(m.chat, {
    text: `⚠️ @${m.number} melanggar aturan grup.\n📋 Alasan: ${reason}\n👋 Pengguna akan dikeluarkan.`,
    mentions: [m.sender]
  });
  try { await sock.groupParticipantsUpdate(m.chat, [m.sender], "remove"); } catch {}
}

export async function handleGroupSettingUpdate(sock, update) {
  const groupId = update?.id;
  if (!groupId || !update?.participants?.length) return;
  const settings = getGroupSettings(groupId);
  const enabled = update.action === "add" ? settings.welcome?.enabled : settings.goodbye?.enabled;
  if (!enabled) return;
  let subject = "Grup";
  try { subject = (await sock.groupMetadata(groupId)).subject || subject; } catch {}
  for (const participant of update.participants) {
    const jid = typeof participant === "string" ? participant : participant?.id || participant?.phoneNumber;
    if (!jid || jid === sock.user?.id) continue;
    const number = String(jid).replace(/\D/g, "");
    const template = update.action === "add" ? settings.welcome.message : settings.goodbye.message;
    const text = String(template)
      .replace(/@user/g, `@${number}`)
      .replace(/@grup/g, subject)
      .replace(/@tanggal/g, new Date().toLocaleDateString("id-ID"))
      .replace(/@jam/g, new Date().toLocaleTimeString("id-ID"));
    await sock.sendMessage(groupId, { text, mentions: [jid] });
  }
}
