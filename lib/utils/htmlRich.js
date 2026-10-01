import { randomBytes, randomUUID } from "node:crypto";
import { proto } from "@itsliaaa/baileys";

const BOT_JID = "867051314767696@bot";
const HTML_PRIMITIVE = "GenAIaeacdsnwHtmlPrimitive";

function botMetadataSignature() { const signature = new Uint8Array(64); randomBytes(64).copy(Buffer.from(signature)); return signature; }
function botMetadataCertificate(length = 685) { const certificate = new Uint8Array(length); certificate[0] = 48; certificate[1] = 130; randomBytes(length - 2).copy(Buffer.from(certificate.buffer, certificate.byteOffset + 2, length - 2)); return certificate; }
function wrapToBotForwardedMessage(richResponseMessage, responseId, disclaimerText = "") {
  return { messageContextInfo: { botMetadata: { botResponseId: responseId, ...(disclaimerText ? { messageDisclaimerText: disclaimerText } : {}), verificationMetadata: { proofs: [{ certificateChain: [botMetadataCertificate(), botMetadataCertificate(892)], version: 1, useCase: 1, signature: botMetadataSignature() }] } } }, botForwardedMessage: { message: { richResponseMessage } } };
}

export function buildHtmlRichMessage(html, options = {}) {
  if (typeof html !== "string" || !html.trim()) throw new TypeError("HTML Mini App harus berupa string dan tidak boleh kosong.");
  const responseId = options.responseId || randomUUID();
  const section = { view_model: { primitive: { payload: html, trusted_sources: Array.isArray(options.trustedSources) ? options.trustedSources : [], __typename: HTML_PRIMITIVE }, __typename: "GenAISingleLayoutViewModel" } };
  const unified = { __typename: "GenAIUnifiedResponse", response_id: responseId, sections: [section] };
  const richResponseMessage = proto.AIRichResponseMessage.create({ submessages: [], messageType: proto.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD, unifiedResponse: { data: Buffer.from(JSON.stringify(unified), "utf8") }, contextInfo: { isForwarded: true, forwardingScore: 1, forwardedAiBotMessageInfo: { botJid: BOT_JID }, forwardOrigin: 4 } });
  return { responseId, html, unified, message: wrapToBotForwardedMessage(richResponseMessage, responseId, options.title || options.disclaimerText || "") };
}

export async function sendHtmlApp(sock, jid, html, options = {}) {
  const built = buildHtmlRichMessage(html, options);
  const messageId = options.messageId || randomUUID().replaceAll("-", "").slice(0, 22).toUpperCase();
  await sock.relayMessage(jid, built.message, { messageId });
  if (options.bypassDownload !== false) {
    const editMessage = proto.Message.create({ protocolMessage: { key: { remoteJid: jid, fromMe: true, id: messageId }, editedMessage: built.message, timestampMs: Date.now(), type: proto.Message.ProtocolMessage.Type.MESSAGE_EDIT } });
    const editId = randomUUID().replaceAll("-", "").slice(0, 22).toUpperCase();
    await sock.relayMessage(jid, editMessage, { messageId: editId });
  }
  return { key: { remoteJid: jid, fromMe: true, id: messageId }, responseId: built.responseId };
}
