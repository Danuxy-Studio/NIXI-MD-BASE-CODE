# 🤖 NIXI-MD-BASE-CODE

> **Modular WhatsApp Bot Base — maintained by Danuxy Studio**

NIXI-MD-BASE-CODE adalah base framework WhatsApp bot berbasis Node.js dan `@itsliaaa/baileys`.
Repository ini dipelihara oleh **Danuxy Studio / Nuxy** dan mempertahankan fitur-fitur yang sudah tersedia pada base saat ini.

> **Project:** NIXI-MD-BASE-CODE  
> **Maintainer:** Danuxy Studio / Nuxy  
> **Version:** `4.0.1`  
> **Runtime:** Node.js `20+`  
> **Module:** ES Modules  
> **Timezone:** `Asia/Jakarta`

---

## 📚 Dokumentasi

`README.md` adalah pintu masuk utama. Seluruh dokumentasi teknis berada di satu tempat: **[`docs/`](docs/README.md)**.

| Dokumentasi | Keterangan |
|---|---|
| [📖 Documentation Index](docs/README.md) | Daftar seluruh dokumentasi |
| [🏗️ Architecture](docs/ARCHITECTURE.md) | Struktur dan alur runtime |
| [⚙️ Installation](docs/INSTALLATION.md) | Instalasi dari awal |
| [🔧 Configuration](docs/CONFIGURATION.md) | Konfigurasi bot |
| [📋 Commands](docs/COMMANDS.md) | Command, alias, permission, dan ban |
| [🧩 Plugin Development](docs/PLUGIN-DEVELOPMENT.md) | Cara membuat plugin |
| [💾 Database](docs/DATABASE.md) | Database dan persistence |
| [🔐 Security](docs/SECURITY.md) | Sistem keamanan |
| [🤖 Jadibot](docs/JADIBOT.md) | Sistem instance Jadibot |
| [🔌 Connection](docs/CONNECTION.md) | Connection, session, dan reconnect |
| [🎮 Games](docs/GAMES.md) | Status Snake dan TTT |
| [🛠️ Troubleshooting](docs/TROUBLESHOOTING.md) | Masalah dan solusi |
| [👨‍💻 Development](docs/DEVELOPMENT.md) | Panduan pengembangan |
| [📝 Changelog](docs/CHANGELOG.md) | Riwayat perubahan |
| [📦 Third-Party](docs/THIRD-PARTY.md) | Dependency dan attribution |
| [⚖️ NOTICE](NOTICE.md) | Attribution dan license notice |

> **Tidak ada folder `wiki/` di repository ini.** `docs/` adalah sumber dokumentasi tunggal agar tidak terjadi duplikasi.

---

## ✨ Fitur yang Dipertahankan

Base ini **tidak menghapus fitur existing**. Fitur yang sudah ada tetap dipertahankan, termasuk:

- WhatsApp connection, authentication, reconnect, dan graceful shutdown
- Session lock untuk mencegah satu session dipakai dua proses
- Plugin registry dan lazy/plugin isolation
- Command registry dengan metadata, alias, category, permission, dan cooldown
- Help/menu berbasis metadata command
- Permission system
- Global command/category ban
- Group command/category ban
- Global dan group anti-spam
- Anti-call
- Auto-read
- Global user mute dan group member mute
- Welcome/goodbye group
- Anti-SW dan anti-toxic group
- Multi-owner
- Jadibot dengan session terisolasi
- Backup dan migration framework
- JSON database abstraction
- Scheduler dan cache
- Generic HTTP client
- Error isolation
- Structured logger
- Maintenance mode
- Runtime status
- Plugin reload
- Game module Snake dan TTT sebagai **legacy/maintenance**

Untuk detail, buka [Documentation Index](docs/README.md).

---

## 🎮 Snake & TTT

Pengembangan aktif untuk **Snake** dan **TTT** dihentikan sementara karena kompatibilitas penggunaan di beberapa WhatsApp tidak konsisten.

Modul tersebut **tetap ada** di base:

- file tidak dihapus;
- command tidak dihapus;
- struktur tetap dipertahankan;
- dokumentasi tetap tersedia;
- statusnya **legacy/maintenance**;
- bukan target pengembangan aktif saat ini.

Detail: [Games Documentation](docs/GAMES.md).

---

## 🏗️ Struktur Repository

```text
NIXI-MD-BASE-CODE/
├── config/                 # konfigurasi bot
├── core/                   # runtime/core system
├── handler/                # compatibility handlers
├── lib/                    # reusable libraries
├── plugins/                # fitur bot
│   ├── groupsetting/
│   ├── owner/
│   ├── security/
│   └── games/              # legacy/maintenance
├── database/               # runtime data
├── sessions/               # WhatsApp auth
├── backups/                # runtime backups
├── migrations/             # migration files
├── docs/                   # SATU-SATUNYA dokumentasi proyek
├── .github/                # kontribusi dan security policy
├── NOTICE.md               # third-party attribution
├── README.md               # pusat dokumentasi
├── .env.example
├── package.json
└── package-lock.json
```

> `database/`, `sessions/`, dan data runtime pribadi tidak boleh dipublikasikan ke repository.

---

## 🚀 Instalasi Cepat

### Requirements

- Node.js `20+`
- npm
- Nomor WhatsApp untuk pairing/login

### Install

```bash
git clone <URL-REPOSITORY>
cd NIXI-MD-BASE-CODE
npm install
```

Jika menggunakan `.env`:

```bash
cp .env.example .env
```

Jalankan:

```bash
npm start
```

Syntax check:

```bash
npm run check
```

Panduan lengkap: [Installation](docs/INSTALLATION.md).

---

## 🔌 Connection Stability — V4.0.1

V4.0.1 mempertahankan perbaikan untuk kasus `Connection closed (440)` dan reconnect loop.

Proteksi meliputi:

- session lock;
- satu socket aktif per session;
- socket generation check;
- graceful socket replacement;
- exponential backoff;
- logging `lastDisconnect.error`;
- penanganan `connectionReplaced`, `loggedOut`, dan `badSession`.

Detail: [Connection](docs/CONNECTION.md).

---

## 🧩 Pengembangan Plugin

Fitur baru sebaiknya dibuat sebagai plugin dan menggunakan command metadata sebagai sumber informasi command.

Contoh minimal:

```js
export default {
  apiVersion: 1,
  command: "hello",
  aliases: ["hi"],
  category: "example",
  description: "Example command",
  usage: ".hello",
  permissions: [],
  cooldown: 2,
  async execute(ctx) {
    await ctx.reply("Hello!");
  }
};
```

Panduan: [Plugin Development](docs/PLUGIN-DEVELOPMENT.md).

---

## 🏢 Danuxy Studio

**NIXI-MD-BASE-CODE** dikelola sebagai project **Danuxy Studio**.

**Maintainer:** Danuxy Studio / Nuxy

Kode original, integrasi, konfigurasi, plugin, dokumentasi, dan perbaikan khusus NIXI-MD-BASE-CODE dibedakan dari software pihak ketiga yang digunakan sebagai dependency.

---

## 📦 Third-Party & Baileys

NIXI-MD-BASE-CODE menggunakan:

```text
@itsliaaa/baileys@0.3.18-final
```

Package metadata repository tersebut menyebut:

- **Package:** `@itsliaaa/baileys`
- **Author:** Lia Wynn
- **License:** MIT
- **Repository:** `https://github.com/itsliaaa/baileys`

Package tersebut adalah fork/derivasi Baileys. Untuk attribution dan license upstream, repository ini juga mencatat **WhiskeySockets/Baileys** serta copyright notice upstream.

Lihat [Third-Party Attribution](docs/THIRD-PARTY.md) dan [NOTICE](NOTICE.md).

> Attribution ini tidak berarti NIXI-MD-BASE-CODE adalah karya Baileys, tidak berarti Danuxy Studio adalah maintainer Baileys, dan tidak berarti NIXI-MD-BASE-CODE berafiliasi dengan WhatsApp.

---

## ⚠️ WhatsApp Disclaimer

NIXI-MD-BASE-CODE bukan produk resmi WhatsApp dan tidak berafiliasi, berasosiasi, diotorisasi, atau didukung oleh WhatsApp.

Gunakan bot sesuai hukum dan ketentuan layanan platform yang berlaku. Jangan menggunakan project ini untuk spam, stalkerware, atau penyalahgunaan lainnya.

---

## 🤝 Contributing

Sebelum membuat perubahan:

1. Baca [Development Guide](docs/DEVELOPMENT.md).
2. Baca [Plugin Development](docs/PLUGIN-DEVELOPMENT.md) jika menambah plugin.
3. Jangan commit session/auth atau data pribadi.
4. Pertahankan attribution dependency.
5. Jalankan pemeriksaan syntax sebelum push.

Lihat [CONTRIBUTING.md](.github/CONTRIBUTING.md).

---

## 📄 License & Attribution

Kode original NIXI-MD-BASE-CODE dikelola oleh **Danuxy Studio / Nuxy**.

Dependency pihak ketiga tetap tunduk pada license dan copyright masing-masing. Untuk attribution utama, lihat [NOTICE.md](NOTICE.md).

---

**Danuxy Studio · NIXI-MD-BASE-CODE · 4.0.1**
