const messages = {
  permission: {
    owner: "Fitur khusus owner!",
    prem: "Fitur khusus premium!",
    grup: "Fitur khusus grup chat!",
    privat: "Fitur khusus privat chat!",
    admin: "Fitur khusus admin!",
    botadmin: "Bot bukan admin!",
    op: "Fitur khusus owner dan premium!",
    or: "Fitur khusus owner dan reseller!",
    ob: "Fitur khusus owner dan bot!",
    oa: "Fitur khusus owner dan admin!",
    muted: "🔇 Kamu sedang dibisukan oleh owner bot.",
    mutedGroup: "🔇 Kamu sedang dibisukan di grup ini."
  },
  system: {
    loading: "Memuat...",
    processing: "Sedang diproses...",
    success: "Berhasil!",
    failed: "Gagal!",
    ready: "NIXI-MD-BASE-CODE siap digunakan!",
    maintenance: "Bot sedang dalam maintenance. Silakan coba lagi nanti.",
    groupOnly: "Bot hanya dapat digunakan di grup."
  },
  command: {
    notFound: "Perintah tidak ditemukan. Gunakan .menu untuk melihat command yang tersedia.",
    missingArgs: "Argumen belum lengkap!",
    cooldown: "Tunggu %time% detik sebelum menggunakan perintah ini lagi.",
    rateLimit: "Terlalu banyak pesan/perintah. Coba lagi sebentar.",
    disabled: "Perintah sedang dinonaktifkan!",
    error: "Terjadi kesalahan saat menjalankan perintah.",
    banned: "🚫 Command ini sedang diblokir oleh owner bot.",
    bannedGroup: "🚫 Command ini sedang diblokir di grup ini oleh admin.",
    categoryBanned: "🚫 Kategori command ini sedang diblokir oleh owner bot.",
    categoryBannedGroup: "🚫 Kategori command ini sedang diblokir di grup ini oleh admin.",
    helpEmpty: "Belum ada command yang terdaftar."
  },
  group: {
    adminOnly: "Perintah ini hanya untuk admin grup!",
    botAdmin: "Bot harus menjadi admin grup untuk melakukan tindakan ini.",
    enabled: name => `✅ ${name} diaktifkan!`,
    disabled: name => `❌ ${name} dinonaktifkan!`
  },
  connection: {
    connecting: "Menghubungkan ke WhatsApp...",
    connected: "WhatsApp berhasil terhubung!",
    disconnected: "WhatsApp terputus!",
    reconnecting: "Menghubungkan ulang...",
    pairing: "Menunggu pairing code...",
    pairingGenerated: "Pairing code berhasil dibuat!",
    pairingFailed: "Gagal membuat pairing code."
  },
  plugin: {
    loaded: "Plugin berhasil dimuat!",
    failed: "Plugin gagal dimuat!",
    unloaded: "Plugin dilepas!",
    reloaded: "Plugin dimuat ulang!"
  }
};

global.mess = messages.permission;
export default messages;
