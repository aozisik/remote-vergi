import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const pages: Record<string, { title: string; description: string }> = {
  index: {
    title: 'Yurt dışına çalışanlar için vergi hesaplayıcı',
    description:
      '2026 mevzuatına göre %100 hizmet ihracatı kazanç istisnası, YMM tasdik raporu ve net kazanç hesaplayıcı.',
  },
};

for (const entry of await getCollection('rehberler')) {
  pages[entry.id] = {
    title: entry.data.title.replace(/\s*\|\s*Remote Vergi\s*$/i, '').trim(),
    description: entry.data.description,
  };
}

const extraPages = import.meta.glob<{
  frontmatter?: { title?: string; description?: string };
}>('../*.mdx', { eager: true });
for (const [path, mod] of Object.entries(extraPages)) {
  const slug = path.replace(/^\.\.\//, '').replace(/\.mdx$/, '');
  const fm = mod.frontmatter;
  if (slug.startsWith('_') || !fm?.title || !fm?.description) continue;
  pages[slug] = { title: fm.title, description: fm.description };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: { path: './public/icon-512.png', size: [60] },
    bgGradient: [
      [250, 250, 250],
      [243, 244, 246],
    ],
    border: { color: [179, 38, 43], width: 12, side: 'inline-start' },
    padding: 60,
    font: {
      title: {
        color: [15, 23, 42],
        size: 64,
        weight: 'Bold',
        lineHeight: 1.15,
      },
      description: {
        color: [71, 85, 105],
        size: 28,
        weight: 'Normal',
        lineHeight: 1.4,
      },
    },
  }),
});
