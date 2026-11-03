# Remote Vergi

Yurtdışına remote çalışanlar için 2026 vergi hesaplayıcı ve rehber.

Canlı: [remotevergi.com](https://remotevergi.com)

## Stack

- [Astro](https://astro.build) (static site, MDX content)
- [Tailwind CSS](https://tailwindcss.com)
- [Alpine.js](https://alpinejs.dev) (calculator interactivity)
- [Pagefind](https://pagefind.app) (client-side search)
- [Plausible](https://plausible.io) (analytics)

## Content structure

- **Guides:** `src/content/rehberler/*.mdx` (Astro content collection, schema in `src/content.config.ts`). Each file is served at `/<filename>/`. Frontmatter must declare `topic`, `personas`, `navTitle`, `blurb` and `dateModified`; optional `summary` (the "Kısaca" box) and `sources`.
- **Figures:** `src/data/facts.ts` is the single source for quoted numbers (Bağ-Kur, YMM threshold, tax brackets...). Calculator-backed values are read from `src/scripts/constants.ts`. In MDX use `<Fact name="bagkurAsgariAylik" />`.
- **Glossary:** `src/data/glossary.ts`, rendered at `/sozluk/`; inline as `<Terim id="dab">DAB</Terim>`.
- **Site structure:** topics, tools and reader personas in `src/data/site.ts`. Persona roadmaps live in `src/pages/{yazilimci,mobil-uygulama-gelistirici,oyun-gelistirici,hizmet-ihracatcisi}.astro`.

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

Push to `main` triggers `.github/workflows/deploy.yml`, which builds with Astro, runs [lychee](https://lychee.cli.rs) to catch broken internal links, and publishes to GitHub Pages at the `remotevergi.com` custom domain.

## License

[PolyForm Noncommercial 1.0.0](./LICENSE) — free to use, study, and modify for non-commercial purposes. Copyright (c) 2024-2026 Swiftmade OÜ.

Bu araç bilgilendirme amaçlıdır ve mali danışmanlık hizmeti yerine geçmez.
