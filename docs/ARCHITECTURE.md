# Architecture
## Overview

NIXI-MD-BASE-CODE menggunakan pemisahan antara core runtime dan plugin feature.

```text
WhatsApp / Baileys
        │
        ▼
core/connection
        │
        ▼
core/event ───────────────► event listeners
        │
        ▼
core/app/context
        │
        ▼
core/guards
        │
        ▼
core/command
        │
        ▼
core/plugin
        │
        ▼
plugins/*
        │
        ├── owner
        ├── groupsetting
        ├── security
        ├── main
        └── games (legacy)
```

## Core responsibilities

| Layer | Tanggung jawab |
|---|---|
| `core/app` | bootstrap aplikasi dan message context |
| `core/connection` | socket, auth, reconnect, shutdown, session lock |
| `core/event` | event bus internal |
| `core/command` | registry, metadata, execution |
| `core/plugin` | discovery, load, reload, isolation |
| `core/guards` | filter dan perlindungan pesan |
| `core/database` | persistence JSON |
| `core/settings` | bot/group settings |
| `core/bot` | lifecycle MAIN/Jadibot |
| `core/logger` | logging |
| `core/error` | error boundary |
| `core/backup` | backup |
| `core/migration` | migrasi |
| `core/scheduler` | task terjadwal |
| `core/cache` | runtime cache |

## Message lifecycle

1. WhatsApp mengirim event.
2. Connection layer meneruskan event ke event bus.
3. Runtime memeriksa apakah bot menerima pesan.
4. Guard menjalankan anti-spam/mute/setting checks.
5. Prefix dan command diparse.
6. Command registry mencari handler.
7. Security/ban checks dijalankan.
8. Permission dan cooldown diverifikasi.
9. Plugin menerima `ctx`.
10. Error plugin diisolasi oleh plugin/runtime layer.

## Design rules

- Core tidak boleh mengetahui detail implementasi setiap feature.
- Feature baru sebaiknya berupa plugin.
- Command metadata adalah sumber informasi command.
- Runtime state tidak boleh dicampur dengan database persistent.
- Session auth tidak boleh disimpan di Git.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
