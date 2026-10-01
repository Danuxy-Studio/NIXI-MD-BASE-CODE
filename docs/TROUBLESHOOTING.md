# Troubleshooting
## Bot langsung disconnect

Periksa:

- apakah ada process kedua memakai session yang sama
- isi `sessions/`
- log `lastDisconnect.error`
- status session WhatsApp
- process manager/PM2

## `Connection closed (440)`

Ikuti [`CONNECTION.md`](CONNECTION.md). Fokus pertama adalah memastikan tidak ada duplicate process/session.

## Plugin tidak muncul

1. Jalankan `npm run check`.
2. Periksa file plugin export default.
3. Periksa duplicate command.
4. Periksa permission metadata.
5. Gunakan `.reload` sebagai owner bila runtime sudah hidup.

## Command tidak merespons

Periksa:

- prefix di `config/bot.js`
- command metadata
- permission
- global/group ban
- cooldown
- guard/mute state

## Database corrupt

Jangan langsung menghapus database produksi. Periksa backup/recovery file dan gunakan migration/backup layer.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
