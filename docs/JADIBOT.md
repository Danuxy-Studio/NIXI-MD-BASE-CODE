# Jadibot
Jadibot adalah instance bot tambahan yang memiliki lifecycle dan session terpisah dari MAIN.

## Commands

```text
.jadibot <nomor>
.listjadibot
.stopjadibot <nomor>
```

## Session layout

```text
sessions/
└── jadibot/
    └── <botId>/
```

## Rules

- Setiap Jadibot harus mempunyai session sendiri.
- Jangan menggunakan `sessions/main` untuk Jadibot.
- Jangan menjalankan dua proses dengan bot/session ID yang sama.
- Hentikan Jadibot melalui lifecycle manager agar socket ditutup dengan benar.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
