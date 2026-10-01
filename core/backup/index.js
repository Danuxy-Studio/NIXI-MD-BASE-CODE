import fs from "node:fs";
import path from "node:path";

const root = path.resolve("backups");
fs.mkdirSync(root, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

export const backup = {
  create: async (source = "database", label = "manual") => {
    const src = path.resolve(source);
    if (!fs.existsSync(src)) return null;
    const dir = path.join(root, label, `${path.basename(src)}.${Date.now()}`);
    copyRecursive(src, dir);
    return dir;
  },
  restore: async (file, target) => { copyRecursive(path.resolve(file), path.resolve(target)); return true; },
  list: (label = "manual") => {
    const d = path.join(root, label);
    if (!fs.existsSync(d)) return [];
    return fs.readdirSync(d).map(x => path.join(d, x));
  }
};
