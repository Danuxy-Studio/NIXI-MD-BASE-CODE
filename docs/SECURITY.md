# Security
## Secrets

Jangan commit:

- WhatsApp auth/session
- API keys
- password
- token
- database produksi
- backup produksi
- file `.env`

## Session isolation

MAIN dan setiap Jadibot memiliki direktori session berbeda. Jangan menjalankan dua instance untuk direktori session yang sama.

## Permissions

Feature sensitif menggunakan permission seperti:

- `BOT_OWNER`
- `GROUP_ADMIN`
- `GROUP_OWNER`
- `BOT_ADMIN`
- role/helper permission yang didefinisikan core

## Plugin isolation

Kesalahan plugin harus diisolasi agar MAIN tetap berjalan.

## Input

Command dan argument dibatasi oleh security configuration. Jangan menganggap input WhatsApp sebagai trusted input.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
