import { commands } from "../command/index.js";
import { events } from "../event/index.js";
import { cleanJid, getPhoneNumberFromJid, sameIdentity } from "../../lib/jid.js";
import { isOwnerNumber } from "../settings/owner.js";
import bot from "../../config/bot.js";

export function normalizeJid(value = "") { return cleanJid(value); }
export async function resolvePhone(sock, jid, chat = null) { return getPhoneNumberFromJid(sock, jid, chat); }
export async function isOwner(sock, jid) {
  const number = await getPhoneNumberFromJid(sock, jid);
  return isOwnerNumber(number) || (bot.isJadibot && bot.owner && String(bot.owner).replace(/\D/g, "") === number);
}

function participantPhone(p) {
  const raw = cleanJid(p?.phoneNumber || "");
  if (raw.endsWith("@s.whatsapp.net")) return raw.split("@")[0];
  return /^\d+$/.test(raw) ? raw : null;
}

export async function findParticipant(sock, chat, jid) {
  if (!String(chat).endsWith("@g.us")) return null;
  try {
    const meta = await sock.groupMetadata(chat);
    const participants = meta?.participants || [];
    const targetPhone = await getPhoneNumberFromJid(sock, jid, chat);
    const targetJid = cleanJid(jid);
    return participants.find(p => {
      const pid = cleanJid(p?.id || "");
      const pphone = participantPhone(p);
      return pid === targetJid ||
        (targetPhone && pphone && targetPhone === pphone) ||
        sameIdentity(pid, targetJid, pphone, targetPhone);
    }) || null;
  } catch { return null; }
}

export async function isAdmin(sock, chat, jid) {
  const participant = await findParticipant(sock, chat, jid);
  return participant?.admin === "admin" || participant?.admin === "superadmin";
}

export async function isGroupOwner(sock, chat, jid) {
  if (!String(chat).endsWith("@g.us")) return false;
  try {
    const meta = await sock.groupMetadata(chat);
    const targetPhone = await getPhoneNumberFromJid(sock, jid, chat);
    const ownerJid = cleanJid(meta?.owner || "");
    const ownerPhone = await getPhoneNumberFromJid(sock, ownerJid, chat);
    return sameIdentity(ownerJid, jid, ownerPhone, targetPhone);
  } catch { return false; }
}

export async function isBotAdmin(sock, chat) {
  if (!String(chat).endsWith("@g.us") || !sock?.user?.id) return false;
  return isAdmin(sock, chat, sock.user.id);
}

export async function buildContext(sock, m) {
  const sender = normalizeJid(m.sender);
  const number = m.number || await getPhoneNumberFromJid(sock, sender, m.chat);
  const group = !!m.isGroup;
  const admin = group ? await isAdmin(sock, m.chat, sender) : false;
  const groupOwner = group ? await isGroupOwner(sock, m.chat, sender) : false;
  const botAdmin = group ? await isBotAdmin(sock, m.chat) : false;
  const own = await isOwner(sock, sender);
  const premium = !!m.isPremium;
  const reseller = !!m.isReseller;

  const permission = {
    async check(levels = []) {
      if (!levels?.length) return { allowed: true, denied: null };
      const checks = {
        USER: true, OWNER: own, BOT_OWNER: own,
        GROUP: group, GRUP: group, PRIVATE: !group, PRIVAT: !group,
        ADMIN: admin, GROUP_ADMIN: admin, GROUP_OWNER: groupOwner,
        BOT_ADMIN: botAdmin, PREMIUM: premium, PREM: premium,
        RESELLER: reseller, OP: own && premium, OR: own && reseller,
        OB: own && botAdmin, OA: own && admin
      };
      for (const raw of levels) {
        if (checks[String(raw).toUpperCase()]) return { allowed: true, denied: null };
      }
      const first = String(levels[0]).toLowerCase();
      const aliases = {
        group_admin: "admin", group_owner: "admin", bot_owner: "owner",
        premium: "prem", group: "grup", private: "privat", bot_admin: "botadmin"
      };
      return { allowed: false, denied: aliases[first] || first };
    }
  };

  let contextTarget = null;

  const reply = (text, options = {}) => {
    const target = contextTarget;
    let output = text;
    const mentions = Array.isArray(options.mentions) ? [...options.mentions] : [];

    if (target?.number) {
      const number = String(target.number).replace(/\D/g, "");
      const jid = target.jid || `${number}@s.whatsapp.net`;
      const tag = `@${number}`;

      if (typeof output === "string") {
        // If the response already contains the bare number, turn it into a real mention.
        const escaped = number.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const bareNumber = new RegExp(`(?<!@)${escaped}\\b`);
        output = output.replace(bareNumber, tag);

        // If the target was explicitly selected by tag/reply/number but the response
        // does not mention it yet, keep the source behaviour: tag the target in reply.
        if (!output.includes(tag)) output = `${tag} ${output}`;
      }

      if (!mentions.includes(jid)) mentions.push(jid);
    }

    return m.reply(output, mentions.length ? { ...options, mentions } : options);
  };
  const send = (content, options = {}) => sock.sendMessage(m.chat, content, options);
  const react = emoji => sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } });

  return {
    bot: sock, message: m, sender, number, chat: m.chat, args: m.args || [], command: m.command || "",
    prefix: m.prefix || "", text: m.text || "", isGroup: group, isAdmin: admin,
    isGroupOwner: groupOwner, isBotAdmin: botAdmin, isOwner: own, isPremium: premium,
    isReseller: reseller, mentionedJid: m.mentionedJid || [], mentionedNumbers: m.mentionedNumbers || [],
    quoted: m.quoted, pushName: m.pushName, getPhoneNumber: jid => getPhoneNumberFromJid(sock, jid, m.chat),
    reply, send, react,
    get target() { return contextTarget; },
    set target(value) { contextTarget = value || null; },
    sendText: (text, o) => send({ text }, o),
    sendImage: (url, caption = "", o) => send({ image: typeof url === "string" ? { url } : url, caption, ...o }, o),
    sendVideo: (url, caption = "", o) => send({ video: typeof url === "string" ? { url } : url, caption, ...o }, o),
    sendAudio: (url, o = {}) => send({ audio: typeof url === "string" ? { url } : url, ...o }, o),
    sendDocument: (url, fileName = "file", o = {}) => send({ document: typeof url === "string" ? { url } : url, fileName, ...o }, o),
    sendSticker: (data, o = {}) => send({ sticker: data, ...o }, o),
    permission, events, commands
  };
}
