import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Starlight reads its UI strings from this collection, and Astro warns on every build when it
  // is missing or empty. src/content/i18n/en.json exists for that reason and overrides nothing.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
