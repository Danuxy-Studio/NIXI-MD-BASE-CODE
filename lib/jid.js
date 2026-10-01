/**
 * Canonical WhatsApp JID/phone helpers.
 * Handles normal PN JIDs, device suffixes, LID JIDs and participant.phoneNumber.
 */
export const stripDevice = (jid = "") => String(jid).replace(/:\d+(?=@)/g, "");
export const cleanJid = (jid = "") => stripDevice(jid).trim().toLowerCase();
export const phoneFromJid = (jid = "") => {
  const value = cleanJid(jid);
  if (value.endsWith("@s.whatsapp.net")) return value.split("@")[0].replace(/\D/g, "");
  if (/^\d+$/.test(value)) return value;
  return null;
};

export async function convertLidToJid(sock, lid) {
  if (!lid) return null;
  const value = cleanJid(lid);
  if (value.endsWith("@s.whatsapp.net")) return value;
  if (!value.endsWith("@lid")) return value;

  try {
    const mapped = await sock?.signalRepository?.lidMapping?.getPNForLID(value);
    return mapped ? cleanJid(mapped) : null;
  } catch {
    return null;
  }
}

export async function getPhoneNumberFromJid(sock, jid, chat = null) {
  if (!jid) return null;
  const direct = phoneFromJid(jid);
  if (direct) return direct;

  const value = cleanJid(jid);
  if (value.endsWith("@lid")) {
    const mapped = await convertLidToJid(sock, value);
    const mappedPhone = phoneFromJid(mapped);
    if (mappedPhone) return mappedPhone;
  }

  // Fallback: group participant metadata contains both id and phoneNumber
  if (chat?.endsWith("@g.us")) {
    try {
      const metadata = await sock.groupMetadata(chat);
      const participants = metadata?.participants || [];
      const target = participants.find(p => {
        const id = cleanJid(p?.id || "");
        const phone = cleanJid(p?.phoneNumber || "");
        return value === id || value === phone;
      });
      if (target) {
        const phone = phoneFromJid(target.phoneNumber || "") || phoneFromJid(target.id || "");
        if (phone) return phone;
      }
    } catch {}
  }

  // Last fallback for raw numeric IDs.
  const digits = value.match(/^\d+$/)?.[0];
  return digits || null;
}

export async function resolveParticipant(sock, chat, participant) {
  const jid = cleanJid(participant || "");
  const phone = await getPhoneNumberFromJid(sock, jid, chat);
  return { jid, phone };
}

export function sameIdentity(a, b, phoneA = null, phoneB = null) {
  const aj = cleanJid(a), bj = cleanJid(b);
  if (aj && bj && aj === bj) return true;
  const ap = phoneA || phoneFromJid(aj), bp = phoneB || phoneFromJid(bj);
  return !!ap && !!bp && ap === bp;
}
