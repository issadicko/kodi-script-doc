// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const SITE = 'https://issadicko.github.io';
// GitHub Pages project site. With the custom domain: base '/' (see README).
const BASE = '/kodi-script-doc';

const kodiGrammar = JSON.parse(
  readFileSync(new URL('./src/grammars/kodi.tmLanguage.json', import.meta.url), 'utf-8'),
);

const DESCRIPTION =
  'KodiScript: a lightweight, portable scripting language embeddable in Go, Kotlin, TypeScript, Dart, and PHP applications. Cross-platform script interpreter with sandboxed execution.';
const OG_IMAGE = `${SITE}${BASE}/og.png`;

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [
    starlight({
      title: 'KodiScript',
      description: DESCRIPTION,
      titleDelimiter: '–',
      favicon: '/favicon.svg',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/issadicko/kodi-script-doc',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/issadicko/kodi-script-doc/edit/main/',
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
        Footer: './src/components/Footer.astro',
        MarkdownContent: './src/components/MarkdownContent.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
      expressiveCode: {
        shiki: {
          langs: [kodiGrammar],
        },
      },
      head: [
        { tag: 'meta', attrs: { name: 'author', content: 'Issa Dicko' } },
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'scripting language, embeddable script, portable language, cross-platform scripting, lightweight interpreter, sandboxed execution, Go scripting, Kotlin scripting, TypeScript scripting, Dart scripting, PHP scripting, DSL, domain specific language',
          },
        },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
        { tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' } },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'KodiScript' } },
        { tag: 'meta', attrs: { property: 'og:image', content: OG_IMAGE } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: OG_IMAGE } },
        { tag: 'meta', attrs: { name: 'twitter:site', content: '@kodiscript' } },
        { tag: 'meta', attrs: { name: 'twitter:creator', content: '@kodiscript' } },
      ],
      sidebar: [
        { label: 'Introduction', slug: 'index' },
        { label: 'Getting Started', slug: 'getting-started' },
        { label: 'Playground', link: '/playground/' },
        {
          label: 'Language Guide',
          items: [
            { label: 'Variables', slug: 'language-guide/variables' },
            { label: 'Operators', slug: 'language-guide/operators' },
            { label: 'Functions', slug: 'language-guide/functions' },
            { label: 'Control Flow', slug: 'language-guide/control-flow' },
            { label: 'Native Functions', slug: 'language-guide/native-functions' },
            { label: 'Extensibility', slug: 'language-guide/extensibility' },
            { label: 'Security & Limits', slug: 'language-guide/security' },
          ],
        },
        {
          label: 'SDK Reference',
          items: [
            { label: 'Overview', slug: 'sdk-reference' },
            { label: 'Go SDK', slug: 'sdk-reference/go' },
            { label: 'Kotlin SDK', slug: 'sdk-reference/kotlin' },
            { label: 'TypeScript SDK', slug: 'sdk-reference/typescript' },
            { label: 'Dart SDK', slug: 'sdk-reference/dart' },
            { label: 'PHP SDK', slug: 'sdk-reference/php' },
          ],
        },
      ],
    }),
  ],
});
