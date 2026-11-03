import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Every guide carries the metadata a reader needs to trust it (when it was
// last checked, where the claims come from) and the metadata the site needs
// to route it (topic, which reader personas it serves). A guide missing any
// required field fails the build instead of shipping without it.
const rehberler = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/rehberler' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Last date the guide was checked against current legislation.
    dateModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    topic: z.enum(['baslangic', 'sirket', 'fatura', 'platform', 'kariyer']),
    // Short label used in menus, hubs and related-guide lists.
    navTitle: z.string(),
    blurb: z.string(),
    order: z.number().default(100),
    personas: z
      .array(z.enum(['yazilimci', 'mobil', 'oyun', 'hizmet']))
      .min(1),
    // "Kısaca": 2-4 sentence answers shown above the article.
    summary: z.array(z.string()).max(4).optional(),
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .optional(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    wide: z.boolean().optional(),
    ogImage: z.string().optional(),
  }),
});

export const collections = { rehberler };
