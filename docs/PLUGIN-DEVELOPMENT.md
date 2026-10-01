# Plugin Development
## Basic plugin

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

## Metadata

- `apiVersion` — versi API plugin
- `command` — command utama
- `aliases` — alias
- `category` — kategori menu
- `description` — deskripsi
- `usage` — cara penggunaan
- `permissions` — permission requirement
- `cooldown` — cooldown command
- `allowWhenBanned` — hanya untuk command tertentu yang harus tetap dapat mengelola ban

## Lifecycle

Plugin dapat menyediakan `init(api)` dan `destroy(api)` jika membutuhkan setup/cleanup.

## Rules

- Jangan daftarkan command yang sudah dipakai plugin lain.
- Jangan mengubah global socket tanpa alasan kuat.
- Gunakan API/context yang disediakan core.
- Tangani error pada operasi eksternal.
- Jangan menaruh token/password di source.
- Jangan menyimpan data persistent langsung ke random JSON file tanpa mengikuti database layer.

---

[← README](../README.md) · [📚 Documentation Index](README.md)
