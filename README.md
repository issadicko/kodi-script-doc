# KodiScript documentation

Documentation site of [KodiScript](https://github.com/issadicko), a lightweight scripting language embeddable in Go, Kotlin, TypeScript, Dart, and PHP applications. Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), published on GitHub Pages.

Published at <https://issadicko.github.io/kodi-script-doc/>.

## Develop

Node.js 22.22 or later is required.

```bash
npm install
npm run dev       # http://localhost:4321/kodi-script-doc/
npm run build     # static site in dist/
npm run preview   # serves dist/ under the base path
npm run check     # astro check: types, content frontmatter, components
```

`overrides` in `package.json` forces `postcss-nested` 9: `@expressive-code/core` (through Starlight) still asks for 6, whose `postcss-selector-parser` 6 is flagged by `npm audit` (GHSA-rj75-hqrm-r3gf). Remove the override once `@expressive-code/core` depends on a fixed version.

## Structure

| Path | Content |
|------|---------|
| `src/content/docs/` | Pages (`.mdx`). The sidebar is declared in `astro.config.mjs`. |
| `src/versions.ts` | SDK versions shown in the install commands and the SDK table. Update it on each release. |
| `src/components/Install.astro` | Install command of an SDK, built from `versions.ts`. |
| `src/components/Showcase.astro`, `FeatureGrid.astro` | Home page: script next to its result, feature grid. |
| `src/pages/playground.astro` | The Playground, a full-screen page of its own (outside the docs layout), served at `/playground/`. |
| `src/pages/404.astro` | The 404 page. Starlight's own 404 route is disabled (`disable404Route`), see the file header. |
| `src/playground/` | Playground code: `app.ts` (layout, editor, run), `kodi-language.ts` (CodeMirror mode), `examples.ts`, `natives.ts` (Explorer data), `result.ts`, `share.ts`, `home.ts` (showcase script). |
| `src/grammars/kodi.tmLanguage.json` | TextMate grammar of the `kodi` language, registered in Expressive Code. Use ```` ```kodi ```` for KodiScript samples. |
| `public/` | Static files: favicon, logo, social image. |

Write internal links as root paths, for example `[Variables](/language-guide/variables/)`. `src/components/MarkdownContent.astro` adds the `base` path when it renders the page, so the same source works under `/kodi-script-doc/` and on a custom domain.

### Playground

The Playground runs `@issadicko/kodi-script` (`^0.4.0`) in the browser; nothing is sent to a server. The Explorer lists the native functions parsed from `src/content/docs/language-guide/native-functions.mdx`, so the page and the Playground share one source. A share link keeps the script, the variables and the limits in the URL hash (`#share=...`). The layout and the last script are kept in `localStorage`.

The script shown in the home page is executed with the TypeScript SDK at build time (`src/playground/home.ts`): a broken script fails the build instead of showing a wrong result.

## Deploy on GitHub Pages

`.github/workflows/deploy.yml` builds the site on every push to `main` and on manual runs, then publishes it with the official `upload-pages-artifact` and `deploy-pages` actions.

Enable it once in the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The next push to `main` (or **Actions → Deploy documentation to GitHub Pages → Run workflow**) publishes the site.

The project page is served from `/kodi-script-doc/`, which is why `astro.config.mjs` sets:

```js
site: 'https://issadicko.github.io',
base: '/kodi-script-doc',
```

## Switch to the custom domain

To serve the documentation from `docs-kodiscript.dickode.net`:

1. Add a `public/CNAME` file containing `docs-kodiscript.dickode.net`.
2. In `astro.config.mjs`, set `site: 'https://docs-kodiscript.dickode.net'` and `base: '/'`.
3. In the DNS zone of `dickode.net`, create a `CNAME` record `docs-kodiscript` pointing to `issadicko.github.io`.
4. In **Settings → Pages**, enter the custom domain and enable **Enforce HTTPS** once the certificate is issued.

No page needs editing: internal links are resolved against `base` at build time, and the social image URL in `head` is built from `site` and `base`.
