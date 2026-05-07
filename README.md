# Remote Vergi

Yurtdışına remote çalışanlar için 2026 vergi hesaplayıcı ve rehber.

Canlı: [remotevergi.com](https://remotevergi.com)

## Stack

- [Astro](https://astro.build) (static site, MDX content)
- [Tailwind CSS](https://tailwindcss.com)
- [Alpine.js](https://alpinejs.dev) (calculator interactivity)
- [Pagefind](https://pagefind.app) (client-side search)
- [Plausible](https://plausible.io) (analytics)

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produces ./dist
npm run preview  # serve the built site
```

Lint and format with [Biome](https://biomejs.dev):

```bash
npm run check    # lint + autofix
npm run format   # format only
```

## Deployment

Push to `master` triggers `.github/workflows/deploy.yml`, which builds with Astro, runs [lychee](https://lychee.cli.rs) to catch broken internal links, and publishes to GitHub Pages at the `remotevergi.com` custom domain.

## License

[PolyForm Noncommercial 1.0.0](./LICENSE) — free to use, study, and modify for non-commercial purposes. Copyright (c) 2024-2026 Swiftmade OÜ.

Bu araç bilgilendirme amaçlıdır ve mali danışmanlık hizmeti yerine geçmez.
