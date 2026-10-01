import { cleanJid, phoneFromJid } from "../../lib/jid.js";

function canonicalMentionJid(number, fallbackJid = "") {
  const n = String(number || "").replace(/\D/g, "");
  if (n) return `${n}@s.whatsapp.net`;
  return cleanJid(fallbackJid || "") || null;
}

export async function resolveTarget(ctx) {
  const mentioned = ctx.mentionedJid?.[0];
  if (mentioned) {
    const number = await ctx.getPhoneNumber(mentioned);
    const jid = canonicalMentionJid(number, mentioned);
    const target = { jid, rawJid: cleanJid(mentioned), number };
    ctx.target = target;
    return target;
  }

  if (ctx.quoted?.sender) {
    const number = await ctx.getPhoneNumber(ctx.quoted.sender);
    const jid = canonicalMentionJid(number, ctx.quoted.sender);
    const target = { jid, rawJid: cleanJid(ctx.quoted.sender), number };
    ctx.target = target;
    return target;
  }

  const raw = String(ctx.args[0] || "").replace(/\D/g, "");
  if (raw) {
    const number = raw.startsWith("0") ? `62${raw.slice(1)}` : raw;
    const target = { jid: `${number}@s.whatsapp.net`, rawJid: `${number}@s.whatsapp.net`, number };
    ctx.target = target;
    return target;
  }

  return null;
}

export function mentionText(number) {
  const n = String(number || "").replace(/\D/g, "");
  return n ? `@${n}` : "@user";
}
