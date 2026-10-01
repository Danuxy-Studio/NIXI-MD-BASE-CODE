# Database
Base menggunakan JSON-backed persistence untuk data runtime/config yang memang disimpan secara lokal.

## Prinsip

- safe write
- recovery untuk file corrupt
- pemisahan data runtime dan source
- database runtime tidak di-commit ke Git
- backup tersedia melalui core backup system

## Lokasi umum

```text
database/system/
database/plugins/
```

Folder database dikontrol `.gitignore` sehingga data produksi tidak ikut ter-push.

## Backup

Owner dapat menjalankan:

```text
.backup
```

Backup runtime disimpan pada struktur `backups/` sesuai backup subsystem.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
