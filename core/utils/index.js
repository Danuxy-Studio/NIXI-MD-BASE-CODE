import readline from "node:readline";
export const question = text => new Promise(resolve => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); rl.question(text, answer => { rl.close(); resolve(answer); }); });
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export const formatUptime = input => { let s = Math.floor(input); const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); const sec = s % 60; return `${d ? `${d}d ` : ""}${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${sec}s`; };
export const safeJson = value => JSON.stringify(value, null, 2);
