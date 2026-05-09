import { OGImageRoute } from 'astro-og-canvas';

interface PageFrontmatter {
  title?: string;
  description?: string;
}

interface MdxModule {
  frontmatter?: PageFrontmatter;
}

const mdxModules = import.meta.glob<MdxModule>('../*.mdx', { eager: true });

const pages: Record<string, { title: string; description: string }> = {
  index: {
    title: 'Yurt dışına çalışanlar için vergi hesaplayıcı',
    description:
      '2026 mevzuatına göre %100 hizmet ihracatı kazanç istisnası, YMM tasdik raporu ve net kazanç hesaplayıcı.',
  },
};

for (const [path, mod] of Object.entries(mdxModules)) {
  const slug = path.replace(/^\.\.\//, '').replace(/\.mdx$/, '');
  if (slug.startsWith('_')) continue;
  const fm = mod.frontmatter;
  if (!fm?.title || !fm?.description) continue;
  pages[slug] = {
    title: fm.title.replace(/\s*\|\s*Remote Vergi\s*$/i, '').trim(),
    description: fm.description,
  };
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
    border: { color: [227, 10, 23], width: 12, side: 'inline-start' },
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
