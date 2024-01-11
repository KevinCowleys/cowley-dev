import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import icon from "astro-icon";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  site: "https://www.cowley.dev",
  output: "server",
  adapter: cloudflare(),
  integrations: [icon(), tailwind(), sitemap(), robotsTxt()]
});