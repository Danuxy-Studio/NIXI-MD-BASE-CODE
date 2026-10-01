# Connection & Reconnect
## Version 4.0.1

Base 4.0.1 membawa connection stability fix.

### Proteksi

1. Session lock mencegah dua proses memakai session yang sama.
2. Connection generation mencegah event socket lama mempengaruhi socket aktif.
3. Socket lama ditutup sebelum reconnect.
4. Reconnect sementara menggunakan exponential backoff.
5. Disconnect reason dicatat bersama detail `lastDisconnect.error`.
6. Reason yang menunjukkan session replacement/logout/bad session tidak diperlakukan sebagai disconnect biasa.

## `440`

Log `Connection closed (440)` perlu dibaca bersama detail error disconnect. Pada implementasi Baileys yang digunakan base ini, 440 diperlakukan sebagai kondisi `connectionReplaced`.

Jika terjadi berulang:

1. Hentikan semua process NIXI-MD-BASE-CODE.
2. Pastikan tidak ada PM2/npm/node process lain memakai session tersebut.
3. Jalankan hanya satu instance.
4. Periksa log detail disconnect.
5. Jangan membuat banyak reconnect process untuk session yang sama.

## Production rule

Satu session = satu process/socket aktif.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
