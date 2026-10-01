# Games — Legacy / Maintenance
Snake dan TTT tetap berada di base karena user meminta seluruh fitur yang sudah ada dipertahankan.

## Snake

`.snake` membuka HTML Mini App lokal melalui rich HTML message. Game menggunakan Canvas dan pointer/touch steering.

## TTT

`.ttt` menggunakan `lib/games/gameApiClient.js` untuk berkomunikasi dengan Game Server terpisah. Backend game tidak dijalankan sebagai HTTP server di dalam MAIN bot.

## Status

Pengembangan aktif untuk Snake dan TTT dihentikan. Jangan menghapus module, command, atau API client hanya karena statusnya legacy.

Perubahan pada core harus tetap memperhatikan agar keberadaan module legacy tidak merusak startup maupun command registry.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
