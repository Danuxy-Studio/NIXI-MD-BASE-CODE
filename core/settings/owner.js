import ownerConfig from "../../config/owner.js";
import { getOwners, saveOwners } from "./index.js";

export function normalizeOwnerNumber(input) {
  let n = String(input || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = `62${n.slice(1)}`;
  if (!n.startsWith("62") || n.length < 10 || n.length > 15) return null;
  return n;
}

export function listOwners() {
  const configured = (ownerConfig.owners || []).map(normalizeOwnerNumber).filter(Boolean);
  const stored = getOwners();
  const owners = [...new Set([...configured, ...stored])];
  saveOwners(owners);
  return owners;
}

export function isOwnerNumber(input) {
  const n = normalizeOwnerNumber(input);
  return !!n && listOwners().includes(n);
}

export function addOwner(input) {
  const n = normalizeOwnerNumber(input);
  const owners = listOwners();
  if (!n) return { ok: false, reason: "invalid", owners };
  if (owners.includes(n)) return { ok: false, reason: "exists", owners, number: n };
  owners.push(n); saveOwners(owners);
  return { ok: true, owners, number: n };
}

export function removeOwner(input) {
  const n = normalizeOwnerNumber(input);
  const protectedOwners = (ownerConfig.owners || []).map(normalizeOwnerNumber).filter(Boolean);
  const owners = listOwners();
  if (!n) return { ok: false, reason: "invalid", owners };
  if (protectedOwners.includes(n)) return { ok: false, reason: "protected", owners, number: n };
  if (!owners.includes(n)) return { ok: false, reason: "not_found", owners, number: n };
  const next = owners.filter(x => x !== n); saveOwners(next);
  return { ok: true, owners: next, number: n };
}
