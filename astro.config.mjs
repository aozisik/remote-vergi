import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://remotevergi.com',
  integrations: [tailwind(), mdx(), sitemap(), pagefind()],
  build: {
    format: 'directory',
  },
});
