import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "database", "jadibot");
const REGISTRY = path.join(DATA, "registry.json");
const processes = new Map();

function ensure() {
  fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(REGISTRY)) fs.writeFileSync(REGISTRY, "{}");
}
function readRegistry() { ensure(); try { return JSON.parse(fs.readFileSync(REGISTRY, "utf8")); } catch { return {}; } }
function writeRegistry(data) { ensure(); fs.writeFileSync(REGISTRY, JSON.stringify(data, null, 2)); }

export function normalizePhone(input) {
  let phone = String(input || "").replace(/\D/g, "");
  if (phone.startsWith("0")) phone = `62${phone.slice(1)}`;
  if (!phone.startsWith("62") || phone.length < 10 || phone.length > 15) return null;
  return phone;
}
export function botIdFromPhone(phone) { return `bot_${normalizePhone(phone)}`; }
export function isBotRunning(botId) {
  const child = processes.get(botId);
  return !!child && child.exitCode === null;
}

export function startBot({ botId, phone, owner, pairingCode } = {}) {
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error("Nomor WhatsApp tidak valid. Gunakan format 62xxxxxxxxxx.");
  botId ||= botIdFromPhone(normalized);
  const existing = processes.get(botId);
  if (existing && existing.exitCode === null) return { botId, process: existing, alreadyRunning: true };
  if (existing) processes.delete(botId);

  const botData = path.join(DATA, botId);
  const pairingFile = path.join(botData, "pairing-code.json");
  const statusFile = path.join(botData, "bot-status.json");
  const sessionDir = path.join(ROOT, "sessions", "jadibot", botId);
  const hadSession = fs.existsSync(path.join(sessionDir, "creds.json"));
  fs.mkdirSync(botData, { recursive: true });
  fs.mkdirSync(sessionDir, { recursive: true });
  try { fs.rmSync(pairingFile, { force: true }); } catch {}
  try { fs.rmSync(statusFile, { force: true }); } catch {}

  const args = [
    path.join(ROOT, "index.js"), "--mode", "jadibot", "--id", botId,
    "--phone", normalized, "--owner", normalizePhone(owner) || normalized,
    "--pairing", String(pairingCode || "NIXIMDBASE")
  ];

  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    env: { ...process.env, NIXI_CHILD_PROCESS: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });

  const prefix = `JADIBOT:${normalized}`;
  const pipe = (stream, isError = false) => {
    let buffer = "";
    stream.setEncoding("utf8");
    stream.on("data", chunk => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/); buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        if (/Pairing Code:/i.test(line)) continue;
        const output = line.includes("JADIBOT:") ? line : `${prefix} ${line}`;
        (isError ? console.error : console.log)(output);
      }
    });
  };
  pipe(child.stdout); pipe(child.stderr, true);

  processes.set(botId, child);
  child.on("exit", (code, signal) => {
    processes.delete(botId);
    const registry = readRegistry();
    if (registry[botId]) registry[botId].status = "stopped";
    writeRegistry(registry);
    console.log(`🤖 ${prefix} stopped (code=${code ?? "?"}, signal=${signal || "-"})`);
  });

  const registry = readRegistry();
  registry[botId] = {
    botId,
    phone: normalized,
    owner: normalizePhone(owner) || normalized,
    createdAt: registry[botId]?.createdAt || new Date().toISOString(),
    status: "active"
  };
  writeRegistry(registry);

  const pairingPromise = new Promise((resolve, reject) => {
    if (hadSession) return resolve({ alreadyRegistered: true, code: null });
    const started = Date.now();
    const timer = setInterval(() => {
      try {
        if (fs.existsSync(pairingFile)) {
          const data = JSON.parse(fs.readFileSync(pairingFile, "utf8"));
          if (data?.code) { clearInterval(timer); return resolve(data); }
          if (data?.error) { clearInterval(timer); return reject(new Error(data.error)); }
        }
      } catch {}
      if (child.exitCode !== null) { clearInterval(timer); reject(new Error(`Proses Jadibot berhenti (code=${child.exitCode ?? "?"}).`)); }
      else if (Date.now() - started > 90000) { clearInterval(timer); reject(new Error("Timeout menunggu Pairing Code (90 detik).")); }
    }, 250);
  });

  const readyPromise = new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      try {
        if (fs.existsSync(statusFile)) {
          const data = JSON.parse(fs.readFileSync(statusFile, "utf8"));
          if (data?.status === "connected") { clearInterval(timer); return resolve(data); }
          if (data?.status === "error") { clearInterval(timer); return reject(new Error(data.error || "Jadibot gagal tersambung.")); }
        }
      } catch {}
      if (child.exitCode !== null) { clearInterval(timer); reject(new Error(`Proses Jadibot berhenti (code=${child.exitCode ?? "?"}).`)); }
      else if (Date.now() - started > 120000) { clearInterval(timer); reject(new Error("Timeout menunggu Jadibot online.")); }
    }, 300);
  });

  return { botId, process: child, pairingPromise, readyPromise, alreadyRunning: false };
}

export function stopBot(botId) {
  const child = processes.get(botId);
  if (!child || child.exitCode !== null) return false;
  try { child.kill(); } catch {}
  return true;
}

export function listBots() {
  return Object.values(readRegistry()).map(bot => ({ ...bot, running: isBotRunning(bot.botId) }));
}

export function stopAllBots() {
  for (const botId of processes.keys()) stopBot(botId);
}
