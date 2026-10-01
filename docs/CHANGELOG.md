# Changelog
## 4.0.1

### Connection stability

- Menambahkan session lock.
- Mencegah duplicate socket/session pada proses yang sama.
- Menambahkan connection generation guard.
- Menambahkan graceful socket replacement.
- Mengubah reconnect menjadi exponential backoff.
- Menambahkan logging detail `lastDisconnect.error`.
- Menangani connection replacement/logout/bad session secara terpisah.

### Documentation

- Merapikan README utama.
- Menambahkan dokumentasi architecture, installation, configuration, commands, plugin development, database, security, Jadibot, connection, games, troubleshooting, dan development.
- Menyiapkan halaman `wiki/` untuk GitHub Wiki.

### Games

- Snake dan TTT tetap dipertahankan.
- Status pengembangan diubah menjadi legacy/maintenance.
- Tidak ada fitur game yang dihapus dari base.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
