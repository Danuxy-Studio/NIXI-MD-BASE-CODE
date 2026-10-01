# Development Guide
## Prioritas

```text
STABILITY
   ↓
BACKWARD COMPATIBILITY
   ↓
MODULARITY
   ↓
MAINTAINABILITY
   ↓
UI / EXTRA FEATURES
```

## Sebelum commit

```bash
npm run check
```

Lalu periksa:

- tidak ada secret
- tidak ada session/database runtime
- tidak ada duplicate command
- plugin lama tetap dapat di-load
- MAIN tidak crash karena satu plugin error
- dokumentasi sesuai source

## Versioning

Versi base saat dokumentasi ini dibuat adalah `4.0.1`.

Perubahan core yang mengubah behavior penting harus dicatat pada `docs/CHANGELOG.md`.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
