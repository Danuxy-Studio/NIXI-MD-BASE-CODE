import { makeWASocket, makeInMemoryStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } from "@itsliaaa/baileys";
import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import { Boom } from "@hapi/boom";
import { events } from "../event/index.js";
import { logger } from "../logger/index.js";
import messages from "../../config/messages.js";
import bot from "../../config/bot.js";
import { serialize } from "../../lib/serializer.js";
import { question } from "../utils/index.js";
import { getBotSettings } from "../settings/index.js";

export class ConnectionManager {
  constructor() {
    this.sock = null;
    this.store = null;
    this.stopped = false;
    this.reconnecting = false;
    this.pairingRequested = false;
    this.pairingPhone = "";
    this.starting = false;
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.connectionGeneration = 0;
    this.lockFd = null;
    this.lockPath = null;
  }

  statusPath() {
    if (!bot.isJadibot) return null;
    return path.resolve("database", "jadibot", bot.botId, "bot-status.json");
  }
  pairingPath() {
    if (!bot.isJadibot) return null;
    return path.resolve("database", "jadibot", bot.botId, "pairing-code.json");
  }
  writeIpc(file, data) {
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ ...data, timestamp: Date.now() }, null, 2));
  }

  getSessionLockPath(sessionDir) {
    return path.join(sessionDir, ".connection.lock");
  }

  acquireSessionLock(sessionDir) {
    const lockPath = this.getSessionLockPath(sessionDir);
    fs.mkdirSync(sessionDir, { recursive: true });

    const writeLock = () => {
      const fd = fs.openSync(lockPath, "wx");
      fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
      this.lockFd = fd;
      this.lockPath = lockPath;
    };

    try {
      writeLock();
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;

      let ownerPid = null;
      try {
        ownerPid = Number(JSON.parse(fs.readFileSync(lockPath, "utf8"))?.pid || 0);
      } catch {}

      if (ownerPid === process.pid && this.lockFd !== null) {
        this.lockPath = lockPath;
        return;
      }

      let alive = false;
      if (ownerPid && ownerPid !== process.pid) {
        try { process.kill(ownerPid, 0); alive = true; } catch {}
      }

      if (alive) {
        throw new Error(`Session sedang digunakan proses lain (PID ${ownerPid}). Hentikan instance duplikat sebelum menjalankan bot ini.`);
      }

      try { fs.unlinkSync(lockPath); } catch {}
      writeLock();
    }
  }

  releaseSessionLock() {
    if (this.lockFd !== null) {
      try { fs.closeSync(this.lockFd); } catch {}
      this.lockFd = null;
    }
    if (this.lockPath) {
      try {
        const data = JSON.parse(fs.readFileSync(this.lockPath, "utf8"));
        if (Number(data?.pid) === process.pid) fs.unlinkSync(this.lockPath);
      } catch {}
      this.lockPath = null;
    }
  }

  async start() {
    if (this.stopped) this.stopped = false;
    if (this.starting) return;
    if (this.sock) return;

    this.starting = true;
    const generation = ++this.connectionGeneration;

    try {
      this.pairingRequested = false;

      const sessionDir = path.resolve(bot.sessionDirectory);
      fs.mkdirSync(sessionDir, { recursive: true });
      this.acquireSessionLock(sessionDir);

      // Migrasi sekali dari struktur lama ./session ke ./sessions/main.
      if (!bot.isJadibot) {
        const legacyDir = path.resolve("session");
        try {
          const current = fs.readdirSync(sessionDir);
          const legacy = fs.readdirSync(legacyDir);
          if (current.length === 0 && legacy.length > 0) {
            for (const entry of legacy) fs.renameSync(path.join(legacyDir, entry), path.join(sessionDir, entry));
            try { fs.rmdirSync(legacyDir); } catch {}
            logger.info("Session lama ./session dipindahkan ke ./sessions/main");
          }
        } catch {}
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      const { version, isLatest } = await fetchLatestBaileysVersion();
      const log = pino({ level: "silent" });
      logger.info(`WhatsApp Web version ${version.join(".")} | latest=${isLatest}`);

      if (!state.creds.registered) {
        let phone = bot.phone;
        if (!phone) phone = await question("Masukkan Nomor WhatsApp Awali 62 : ");
        this.pairingPhone = String(phone).replace(/\D/g, "");
        if (!this.pairingPhone || !this.pairingPhone.startsWith("62")) throw new Error("Nomor WhatsApp tidak valid.");
      }

      if (generation !== this.connectionGeneration || this.stopped) return;

      const sock = makeWASocket({
        version,
        logger: log,
        auth: state,
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
      });

      this.sock = sock;
      this.store = makeInMemoryStore({ logger: log });
      this.store.bind(sock.ev);
      sock.ev.on("creds.update", saveCreds);
      sock.ev.on("messages.upsert", e => this.onMessages(e, sock));
      sock.ev.on("connection.update", e => this.onConnection(e, state, sock, generation));
      sock.ev.on("call", calls => events.emit("call.received", calls, sock));
      sock.ev.on("group-participants.update", update => events.emit("group.participants", update, sock));
      await events.emit("bot.connecting", sock);
    } catch (error) {
      this.releaseSessionLock();
      this.sock = null;
      throw error;
    } finally {
      this.starting = false;
    }
  }

  async onMessages({ messages: incoming, type }, sock = this.sock) {
    if (type !== "notify") return;
    for (const raw of incoming) {
      if (!raw?.message || raw.key?.remoteJid === "status@broadcast") continue;
      if (!sock || sock !== this.sock) continue;
      const m = await serialize(sock, raw);
      logger.chat(m.number || m.sender, m.pushName, m.body, m.isGroup);
      await events.emit("message.received", m);
    }
  }

  async onConnection({ connection, lastDisconnect }, state, sock, generation) {
    // Abaikan event dari socket lama setelah reconnect.
    if (generation !== this.connectionGeneration || sock !== this.sock) return;

    if (connection === "connecting") {
      if (!state.creds.registered && !this.pairingRequested) {
        this.pairingRequested = true;
        logger.info(messages.connection.connecting);
        try {
          await delay(1500);
          if (generation !== this.connectionGeneration || sock !== this.sock || this.stopped) return;
          const custom = bot.pairingCode?.trim();
          const code = custom
            ? await sock.requestPairingCode(this.pairingPhone, custom)
            : await sock.requestPairingCode(this.pairingPhone);
          if (bot.isJadibot) {
            this.writeIpc(this.pairingPath(), { code, phoneNumber: this.pairingPhone });
          } else {
            logger.success(`Pairing Code: ${code}`);
            console.log(`\nPairing Code: ${code}\n`);
          }
          await events.emit("bot.pairing", code);
        } catch (error) {
          this.pairingRequested = false;
          this.writeIpc(this.pairingPath(), { error: error.message || String(error) });
          logger.error(messages.connection.pairingFailed, { error: error.stack || String(error) });
        }
      }
      return;
    }

    if (connection === "open") {
      this.reconnectAttempt = 0;
      logger.success(messages.connection.connected);
      this.writeIpc(this.statusPath(), { status: "connected" });
      await events.emit("bot.connected", sock);
      return;
    }

    if (connection === "close" && !this.stopped) {
      const error = lastDisconnect?.error;
      const reason = new Boom(error)?.output?.statusCode;
      const message = error?.message || "unknown";
      const data = error?.data ?? null;
      logger.warn(`Connection closed (${reason ?? "unknown"}) | ${message}${data ? ` | data=${JSON.stringify(data)}` : ""}`);

      // 440 = connectionReplaced. Reconnecting from this same process immediately
      // can create a socket war if another instance is using the same session.
      if (reason === DisconnectReason.connectionReplaced) {
        logger.error("Session WhatsApp digantikan oleh koneksi lain (440). Auto-reconnect dihentikan untuk mencegah reconnect loop. Pastikan hanya 1 instance memakai session ini.");
        this.writeIpc(this.statusPath(), { status: "error", error: "connection_replaced", reason });
        try { sock.end?.(error); } catch {}
        this.sock = null;
        this.connectionGeneration++;
        await events.emit("bot.disconnected", reason);
        return;
      }

      if (reason === DisconnectReason.loggedOut || reason === DisconnectReason.badSession) {
        logger.error(`WhatsApp session tidak dapat dipakai lagi (${reason}). Re-auth diperlukan.`);
        this.writeIpc(this.statusPath(), { status: "error", error: reason === DisconnectReason.loggedOut ? "logged_out" : "bad_session", reason });
        try { sock.end?.(error); } catch {}
        this.sock = null;
        this.connectionGeneration++;
        await events.emit("bot.disconnected", reason);
        return;
      }

      await events.emit("bot.reconnecting", reason);
      if (this.reconnecting || this.stopped) return;

      this.reconnecting = true;
      this.reconnectAttempt += 1;
      const delayMs = Math.min(30000, 3000 * (2 ** Math.min(this.reconnectAttempt - 1, 3)));
      logger.info(`Menghubungkan ulang dalam ${Math.round(delayMs / 1000)} detik... (attempt=${this.reconnectAttempt})`);

      try { sock.end?.(error); } catch {}
      if (this.sock === sock) this.sock = null;
      this.connectionGeneration++;

      this.reconnectTimer = setTimeout(async () => {
        this.reconnectTimer = null;
        this.reconnecting = false;
        if (this.stopped || this.sock) return;
        try {
          await this.start();
        } catch (reconnectError) {
          logger.error("Reconnect failed", { error: reconnectError.stack || String(reconnectError) });
          // Keep the process alive; next reconnect is scheduled only by a future socket close.
          // If start failed before a socket existed, explicitly schedule another attempt.
          if (!this.stopped && !this.sock && !this.reconnecting) {
            this.reconnecting = true;
            this.reconnectAttempt += 1;
            const retryMs = Math.min(30000, 3000 * (2 ** Math.min(this.reconnectAttempt - 1, 3)));
            logger.info(`Retry koneksi dalam ${Math.round(retryMs / 1000)} detik...`);
            this.reconnectTimer = setTimeout(async () => {
              this.reconnectTimer = null;
              this.reconnecting = false;
              try { await this.start(); } catch (e) { logger.error("Retry reconnect failed", { error: e.stack || String(e) }); }
            }, retryMs);
          }
        }
      }, delayMs);
    }
  }

  async stop() {
    this.stopped = true;
    this.reconnecting = false;
    this.connectionGeneration++;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const sock = this.sock;
    this.sock = null;
    try { sock?.end?.(new Error("Shutdown")); } catch {}
    this.releaseSessionLock();
    await events.emit("bot.disconnected");
  }
}

export const connection = new ConnectionManager();
