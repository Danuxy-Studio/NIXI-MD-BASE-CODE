# Configuration
## `config/bot.js`

Konfigurasi utama:

- `name` — nama bot
- `version` — versi base
- `prefix` — prefix command
- `timezone` — timezone logger/runtime
- `instance` — label MAIN/JADIBOT
- `debug` — debug mode
- `phone` — nomor opsional
- `owner` — owner instance bila mode Jadibot digunakan
- `pairingCode` — custom pairing code
- `mode` — mode instance
- `botId` — identitas instance
- `sessionDirectory` — lokasi session

Default session:

```text
sessions/main
sessions/jadibot/<botId>
```

## `config/owner.js`

Berisi bootstrap owner. Owner tambahan disimpan oleh sistem owner/database.

## `config/security.js`

Berisi batas keamanan seperti panjang command, jumlah argument, dan redaction secret.

## `.env`

`.env` disediakan untuk secret/API key module tambahan. Jangan memasukkan secret langsung ke repository.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
