# Installation
## Requirements

- Node.js 20 atau lebih baru
- npm
- akun WhatsApp untuk bot
- akses filesystem untuk session dan database

## Local

```bash
git clone <URL-REPOSITORY>
cd NIXI-MD-BASE-CODE
npm install
npm run check
npm start
```

## VPS / Linux

```bash
cd /path/ke/NIXI-MD-BASE-CODE
npm install
npm run check
npm start
```

Untuk proses production, gunakan process manager pilihanmu (misalnya PM2), tetapi pastikan hanya satu process memakai session yang sama.

## Pairing

Base mendukung nomor melalui argument konfigurasi bot. Jika nomor tidak diberikan, runtime dapat meminta input sesuai konfigurasi connection.

Contoh pola:

```bash
node index.js --phone 628xxxxxxxxxx
```

Periksa `config/bot.js` sebelum production karena opsi CLI yang digunakan harus mengikuti konfigurasi source yang sedang dipakai.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
