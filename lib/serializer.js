import { cleanJid, getPhoneNumberFromJid } from "./jid.js";

export const serialize = async (sock, m) => {
  const rawChat = m.key?.remoteJid || "";
  const rawSender = m.key?.participant || m.key?.remoteJidAlt || m.key?.remoteJid || "";

  m.chat = cleanJid(rawChat);
  m.fromMe = !!m.key?.fromMe;
  m.isGroup = m.chat.endsWith("@g.us");

  // In groups, participant can now be @lid. In private chats remoteJid can also
  // be @lid, while remoteJidAlt contains the real PN JID.
  let sender = cleanJid(rawSender);
  if (!m.isGroup && m.key?.remoteJidAlt) sender = cleanJid(m.key.remoteJidAlt);
  m.sender = sender;
  m.number = await getPhoneNumberFromJid(sock, sender, m.chat);

  // If a private chat was represented only by a LID, use the alternate JID.
  if (!m.number && !m.isGroup && m.key?.remoteJidAlt) {
    m.sender = cleanJid(m.key.remoteJidAlt);
    m.number = await getPhoneNumberFromJid(sock, m.sender, m.chat);
  }

  m.pushName = m.pushName || m.notifyName || "";

  const msg = m.message || {};
  m.body = msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    msg.buttonsResponseMessage?.selectedButtonId ||
    msg.templateButtonReplyMessage?.selectedId ||
    msg.listResponseMessage?.singleSelectReply?.selectedRowId || "";

  // Native Flow / interactive button response used by the source-style menu.
  if (!m.body && msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
    try {
      const params = JSON.parse(
        msg.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
      );
      m.body = params.id || params.selectedId || params.text || "";
    } catch {}
  }

  const ctx = msg.extendedTextMessage?.contextInfo ||
    msg.imageMessage?.contextInfo ||
    msg.videoMessage?.contextInfo ||
    msg.documentMessage?.contextInfo || {};

  m.mentionedJid = ctx.mentionedJid || [];
  m.mentionedNumbers = [];
  for (const jid of m.mentionedJid) {
    const phone = await getPhoneNumberFromJid(sock, jid, m.chat);
    if (phone) m.mentionedNumbers.push(phone);
  }

  m.quoted = ctx.quotedMessage ? {
    message: ctx.quotedMessage,
    sender: cleanJid(ctx.participant || ""),
    id: ctx.stanzaId,
    key: {
      remoteJid: m.chat,
      fromMe: false,
      id: ctx.stanzaId,
      participant: cleanJid(ctx.participant || "")
    }
  } : null;

  if (m.quoted?.sender) {
    m.quoted.number = await getPhoneNumberFromJid(sock, m.quoted.sender, m.chat);
  }

  m.getPhoneNumber = jid => getPhoneNumberFromJid(sock, jid, m.chat);
  m.reply = async (text, options = {}) => sock.sendMessage(m.chat, { text, ...options }, { quoted: m });
  return m;
};

export default serialize;
