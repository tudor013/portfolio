// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Static output: every page is a plain HTML file, so the site works with
  // JavaScript disabled and can be served by any host for free.
  output: 'static',

  // TODO(conținut): replace with the real deployed origin once Cloudflare is
  // connected. Astro needs it to emit absolute URLs in sitemap and Open Graph.
  site: 'https://portfolio.pages.dev',
});
