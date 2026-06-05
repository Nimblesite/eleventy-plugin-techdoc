# eleventy-plugin-techdoc — Specification

## Overview

Minimal **structural** Eleventy theme for technical documentation and blogs. The theme provides layout, collections, filters, SEO metadata, and structural CSS. **It ships no colors and no visual styling — sites provide those.**

- Eleventy: **3.x** (peer dependency `@11ty/eleventy` `^3.1.2`)
- Node.js: **18+**

## Philosophy

The theme provides **structure only**:

- Layouts (base, docs, blog, api)
- Collections (blog posts, tags, categories, docs)
- Filters (dates, slugify, i18n `t`, language-URL helpers)
- Structural JavaScript (theme toggle, mobile menu, language switcher)
- Structural CSS (reset, layout, accessibility utilities) — no colors

Sites provide **all visual styling**: colors, typography, decorative styles, and branding.

## Installation

```bash
mkdir my-site && cd my-site
npm init -y
npm install @11ty/eleventy eleventy-plugin-techdoc
npx eleventy-plugin-techdoc      # scaffold (interactive)
```

Running the package binary in a directory scaffolds a working site, adds `dev`/`build` scripts and `"type": "module"` to `package.json`, and prompts for a CSS style and whether to include sample content. There is no `init` subcommand — the bin scaffolds when run.

### CSS style choices

1. **Minimal** (default) — basic CSS custom properties, simple light/dark mode.
2. **C64** — blocky Commodore-64 retro style with a monospace font.
3. **None** — no CSS generated; you provide all styling.

## Package Structure

```
eleventy-plugin-techdoc/
├── package.json
├── index.js                      # re-exports lib/index.js
├── lib/
│   ├── index.js                  # plugin entry point
│   ├── virtual-templates.js      # registers layouts + pages via addTemplate()
│   ├── filters/index.js          # filters
│   ├── plugins/
│   │   ├── collections.js        # blog/docs/tag/category collections
│   │   └── markdown.js           # markdown-it configuration
│   └── shortcodes/index.js       # shortcodes
├── templates/
│   ├── layouts/
│   │   ├── base.njk              # HTML shell
│   │   ├── docs.njk              # two-column with sidebar
│   │   ├── blog.njk              # blog post layout
│   │   └── api.njk               # API reference (docs-style)
│   └── pages/                    # feed, sitemap, robots, llms.txt, blog/* pages
├── assets/
│   ├── css/{reset,layout,utilities}.css
│   └── js/{main,theme-toggle,mobile-menu,language-switcher}.js
└── bin/init.js                   # scaffolding CLI (the `eleventy-plugin-techdoc` bin)
```

At build time the theme copies `assets/` into the site at `/techdoc/` (via `addPassthroughCopy`), so its CSS/JS load from `/techdoc/css/` and `/techdoc/js/`.

## Layouts

Layouts are registered into the site under `_includes/layouts/` via Eleventy's Virtual Templates API (`addTemplate()`), so sites reference them as `layout: layouts/<name>.njk`. `base.njk` is always registered; `docs.njk`/`api.njk` register when `features.docs` is on; `blog.njk` when `features.blog` is on.

### base.njk

HTML shell with: `<head>` meta (title, description, canonical, Open Graph, Twitter, JSON-LD structured data, `hreflang` alternates), an inline theme-preference script, a skip link, header nav (`navigation.main`), optional language switcher and dark-mode toggle, footer (`navigation.footer`), and the blocks `{% block head %}`, `{% block content %}`, `{% block scripts %}`.

### docs.njk

Extends base. Two-column layout (`.docs-layout`): a sidebar built from `eleventyNavigation` frontmatter and a `.docs-content` article. Supports optional `prevPage`/`nextPage` footer links. Responsive.

### blog.njk

Extends base. Article layout (`.blog-post`) with post metadata (date, author, category), tag/category links, content, and a "back to blog" link.

### api.njk

Extends base. A **docs-style** two-column layout whose sidebar is built from optional `api` and `docs` arrays in `src/_data/navigation.json`. It renders the page's markdown/content — **the theme does not generate API docs; you author the content (or generate it yourself) and the layout displays it.**

## Filters

| Filter               | Usage                                              | Description                                                              |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `dateFormat`         | `{{ date \| dateFormat }}`                         | Localized long date (respects page `lang`)                               |
| `isoDate`            | `{{ date \| isoDate }}`                            | ISO 8601 timestamp                                                       |
| `dateToRfc3339`      | `{{ date \| dateToRfc3339 }}`                      | RFC 3339 timestamp (feeds/JSON-LD)                                       |
| `limit`              | `{{ posts \| limit(5) }}`                          | Limit array length                                                       |
| `capitalize`         | `{{ str \| capitalize }}`                          | Capitalize first letter                                                  |
| `slugify`            | `{{ str \| slugify }}`                             | URL-safe slug                                                            |
| `t`                  | `{{ "key.path" \| t(lang) }}`                      | i18n lookup (returns `undefined` when missing so `default(...)` applies) |
| `altLangUrl`         | `{{ url \| altLangUrl(currentLang, targetLang) }}` | Map a URL to another language                                            |
| `extractLangFromUrl` | `{{ url \| extractLangFromUrl(defaultLang) }}`     | Detect language prefix in a URL                                          |
| `toOgLocale`         | `{{ lang \| toOgLocale }}`                         | Map a language code to an `og:locale` (e.g. `en` → `en_US`)              |

## Shortcodes

| Shortcode    | Output                                     |
| ------------ | ------------------------------------------ |
| `{% year %}` | Current year (e.g. for a footer copyright) |

## Collections

When `features.blog` is on, for the default language: `posts`, `tagList`, `categoryList`, `postsByTag`, `postsByCategory` (from `src/blog/*.md`). When `features.docs` is on: `docs` (from `src/docs/**/*.md`).

For each non-default language `<lang>`, the same collections are registered with a language prefix (e.g. `zhposts`, `zhtagList`, `zhDocs`) from `src/<lang>/blog/*.md` and `src/<lang>/docs/**/*.md`.

## Required Site Data

### src/\_data/site.json

```json
{
  "title": "My Site",
  "description": "Site description",
  "url": "https://example.com",
  "stylesheet": "/assets/css/styles.css"
}
```

### src/\_data/navigation.json

```json
{
  "main": [
    { "text": "Docs", "url": "/docs/" },
    { "text": "Blog", "url": "/blog/" }
  ],
  "footer": [
    { "title": "Resources", "items": [{ "text": "GitHub", "url": "https://github.com/..." }] }
  ]
}
```

`api.njk` additionally reads optional `api` and `docs` arrays for its sidebar.

## CSS Custom Properties

The theme's structural CSS contains no colors. Sites define color variables in their own stylesheet; the scaffolded `styles.css` and templates reference them:

```css
:root {
  --color-bg: #fff;
  --color-text: #111;
  --color-primary: #0066cc;
  --color-border: #e5e5e5;
  --color-muted: #666;
}
[data-theme="dark"] {
  /* your dark overrides */
}
```

The theme's layout CSS uses these layout variables **with built-in fallback defaults**, so overriding them is optional: `--max-width` (1200px), `--sidebar-width` (250px), `--content-width` (65ch), `--header-height` (60px), plus a `--space-*` spacing scale.

## i18n

```javascript
{
  features: { i18n: true },
  i18n: { defaultLanguage: "en", languages: ["en", "zh"] }
}
```

Define strings in `src/_data/i18n.json`, put non-default-language content under `src/<lang>/`, and look strings up with the `t` filter. Per-language blog/tag/category pages are auto-registered; other pages are authored per language.

## Bundled Plugins

The theme adds and configures `@11ty/eleventy-plugin-syntaxhighlight`, `@11ty/eleventy-plugin-rss`, and `@11ty/eleventy-navigation`.

## Updates Flow Automatically

Layouts and SEO pages are registered through `addTemplate()` rather than copied into the site, so running `npm update eleventy-plugin-techdoc` picks up new versions without manual file syncing.

## Tests

`npm test` is configured to run Playwright (see `playwright.config.js`), which serves a `sample_website/` build and runs specs from `tests/`. Those fixtures are **not committed in this repository**, so `npm test` has nothing to run until they are added.
