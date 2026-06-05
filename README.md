# eleventy-plugin-techdoc

Minimal **structural** Eleventy theme for technical documentation and blogs. The theme ships layout, collections, filters, SEO metadata, and a small amount of structural CSS — **but no colors and no visual styling. You provide those.**

[![npm version](https://badge.fury.io/js/eleventy-plugin-techdoc.svg)](https://www.npmjs.com/package/eleventy-plugin-techdoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Requires Eleventy 3.x (peer dependency `@11ty/eleventy` `^3.1.2`) and Node 18+.

## Quick Start

```bash
mkdir my-site && cd my-site
npm init -y
npm install @11ty/eleventy eleventy-plugin-techdoc
npx eleventy-plugin-techdoc      # scaffold the site (interactive)
npm run dev
```

Running `npx eleventy-plugin-techdoc` in a directory scaffolds a working site and prompts for:

- **CSS style** — Minimal (light/dark starter), C64 (retro), or None (blank slate)
- **Sample content** — include example docs/blog posts, or start with a minimal skeleton

It also adds `dev` and `build` scripts and `"type": "module"` to your `package.json`.

## Generated Structure

A minimal scaffold creates:

```
my-site/
├── eleventy.config.js          # Eleventy config that wires in the plugin
└── src/
    ├── _data/
    │   ├── site.json           # Site metadata
    │   ├── navigation.json     # Nav + footer links
    │   ├── i18n.json           # Translation strings
    │   └── languages.json      # Language display names
    ├── assets/css/styles.css   # Your styles (YOU control colors here)
    ├── docs/index.md           # Docs home
    ├── blog/index.njk          # Blog listing
    ├── index.njk               # Home page
    ├── feed.njk                # RSS/Atom feed
    ├── sitemap.njk             # sitemap.xml
    ├── robots.txt.njk          # robots.txt
    └── llms.txt.njk            # llms.txt
```

Choosing **sample content** adds more pages (extra docs such as `api.md` and `configuration.md`, several blog posts, an `api/` section, and `zh/` translated content).

## Configuration

```javascript
import techdoc from "eleventy-plugin-techdoc";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(techdoc, {
    site: {
      name: "My Site",
      url: "https://example.com",
      description: "Built with techdoc",
    },
    features: {
      blog: true, // register blog collections + blog/tag/category pages
      docs: true, // register docs collection + docs/api layouts
      darkMode: true, // render the dark-mode toggle button
      i18n: false, // enable the language switcher + per-language pages
    },
    i18n: {
      defaultLanguage: "en",
      languages: ["en"], // add more, e.g. ["en", "zh"], when i18n: true
    },
  });

  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
  };
}
```

The defaults are `blog: true, docs: true, darkMode: true, i18n: true`; the example above shows the full option shape.

### src/\_data/site.json

```json
{
  "title": "My Site",
  "description": "Built with techdoc",
  "url": "https://example.com",
  "stylesheet": "/assets/css/styles.css"
}
```

`stylesheet` points at your CSS; the theme links it after its own structural CSS. Optional fields the base layout will use if present include `author`, `keywords`, `themeColor`, `ogImage`, `twitterSite`, `favicon`, and `organization`.

### src/\_data/navigation.json

```json
{
  "main": [
    { "text": "Docs", "url": "/docs/" },
    { "text": "Blog", "url": "/blog/" }
  ],
  "footer": [
    {
      "title": "Links",
      "items": [{ "text": "GitHub", "url": "https://github.com/yourname" }]
    }
  ]
}
```

`main` renders the header nav; `footer` renders the footer columns. The `api.njk` layout additionally reads optional `api` and `docs` arrays from this file for its sidebar.

## CSS Custom Properties

The theme's structural CSS (`reset.css`, `layout.css`, `utilities.css`, served at `/techdoc/css/`) contains **no colors** — only layout. You own all color and visual styling in your own stylesheet.

### Colors — you must provide these

The scaffolded `styles.css` and templates reference these variables. Define them in your stylesheet:

```css
:root {
  --color-bg: #fff;
  --color-text: #111;
  --color-primary: #0066cc;
  --color-border: #e5e5e5;
  --color-muted: #666;
}

[data-theme="dark"] {
  --color-bg: #111;
  --color-text: #f0f0f0;
  --color-primary: #66b3ff;
  --color-border: #333;
  --color-muted: #999;
}
```

### Layout — optional overrides (the theme uses these with built-in fallbacks)

```css
:root {
  --max-width: 1200px; /* fallback: 1200px */
  --sidebar-width: 250px; /* fallback: 250px  */
  --content-width: 65ch; /* fallback: 65ch   */
  --header-height: 60px; /* fallback: 60px   */
}
```

The theme also uses a `--space-*` spacing scale in its layout CSS; override those variables to adjust spacing.

## Layouts

Four layouts are registered (docs/api only register when `features.docs` is on; blog only when `features.blog` is on):

| Layout             | Use for                                                      | Notable classes                             |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| `layouts/base.njk` | HTML shell (head, nav, footer, blocks)                       | `.site-header`, `.nav`, `.site-footer`      |
| `layouts/docs.njk` | Documentation                                                | `.docs-layout`, `.sidebar`, `.docs-content` |
| `layouts/blog.njk` | Blog posts                                                   | `.blog-post`, `.blog-container`             |
| `layouts/api.njk`  | API reference (docs-style; `navigation.json`-driven sidebar) | `.docs-layout`, `.sidebar`, `.docs-content` |

```markdown
---
layout: layouts/docs.njk
title: Getting Started
eleventyNavigation:
  key: Getting Started
  order: 1
---

# Getting Started

Your content here...
```

## Blog Posts

Create markdown files in `src/blog/` with `tags: posts`:

```markdown
---
layout: layouts/blog.njk
title: My First Post
date: 2025-01-22
author: Your Name
tags: posts
category: tutorials # optional
excerpt: A brief summary for the listing page.
---

# My First Post

Content here...
```

When `features.blog` is on, the theme generates the blog index plus **tag and category** index/detail pages (e.g. `/blog/tags/<tag>/`, `/blog/categories/<category>/`) from your posts.

## Documentation Sidebar

The `docs.njk` sidebar is built from Eleventy's [`eleventyNavigation`](https://www.11ty.dev/docs/plugins/navigation/) frontmatter:

```markdown
---
layout: layouts/docs.njk
title: API Reference
eleventyNavigation:
  key: API Reference
  order: 2
---
```

## SEO & Generated Files

The base layout emits canonical URLs, Open Graph and Twitter meta, JSON-LD structured data, and `hreflang` alternates from your `site` data. The theme also generates `/feed.xml` (Atom, from blog posts), `/sitemap.xml`, `/robots.txt`, and `/llms.txt`.

## Internationalization (i18n)

Enable i18n and list your languages:

```javascript
eleventyConfig.addPlugin(techdoc, {
  features: { i18n: true },
  i18n: { defaultLanguage: "en", languages: ["en", "zh"] },
});
```

Add translation strings in `src/_data/i18n.json`:

```json
{
  "en": { "blog": { "back": "Back to Blog" }, "nav": { "docs": "Documentation" } },
  "zh": { "blog": { "back": "返回博客" }, "nav": { "docs": "文档" } }
}
```

Put non-default-language content under a language folder (`src/zh/`, etc.). Look up strings with the `t` filter:

```njk
{{ "blog.back" | t(lang) | default("Back to Blog") }}
```

The theme auto-registers per-language blog/tag/category pages for every non-default language. Other pages (home, docs) you create yourself under the language folder.

## Bundled Plugins

The theme adds and configures these for you:

- `@11ty/eleventy-plugin-syntaxhighlight` — code syntax highlighting
- `@11ty/eleventy-plugin-rss` — RSS/Atom feed
- `@11ty/eleventy-navigation` — docs sidebar navigation

## Troubleshooting

**Code blocks show raw backticks** — ensure your config returns `markdownTemplateEngine: "njk"`.

**Styles not loading** — check `site.json` `stylesheet` points at your CSS, that `addPassthroughCopy("src/assets")` is in your config, and that the file exists at `src/assets/css/styles.css`.

**Docs sidebar empty** — add `eleventyNavigation` (with a `key`) to your docs frontmatter.

**Dark mode toggle does nothing** — define `[data-theme="dark"]` color overrides in your CSS (the theme only flips the attribute, it provides no colors).

**Build errors on Eleventy 2.x** — the theme requires Eleventy 3.x: `npm install @11ty/eleventy@latest`.

## Contributing

```bash
git clone https://github.com/MelbourneDeveloper/eleventy-plugin-techdoc.git
cd eleventy-plugin-techdoc
npm install
```

To try changes against a local site, `npm install /path/to/eleventy-plugin-techdoc` in a test project (or use `npm link`), then run `npx eleventy-plugin-techdoc` there.

## License

MIT

## For AI

Context for coding agents wiring this package into an Eleventy site. Everything below is verified against the package source.

**What it is.** `eleventy-plugin-techdoc` is an ESM (`"type": "module"`) Eleventy **3.x** plugin (peer dependency `@11ty/eleventy` `^3.1.2`, Node 18+). It is a _structural_ theme: it registers layouts, collections, filters, a shortcode, SEO metadata, and structural CSS/JS. It defines **no colors and no visual design** — the consuming site supplies all color/typography through CSS custom properties.

**How it works as a "virtual" theme.** Layouts and SEO pages are injected into the build via Eleventy's `addTemplate()` (Virtual Templates) — they are **not** copied into the site. Reference them as `layout: layouts/<name>.njk`; they resolve from inside the npm package, so `npm update eleventy-plugin-techdoc` picks up new versions with no file syncing. The theme's `assets/` are passthrough-copied to the site at `/techdoc/`, so its CSS loads from `/techdoc/css/*` and JS from `/techdoc/js/main.js`.

**Wiring (prefer this over the interactive CLI).** `npx eleventy-plugin-techdoc` is interactive; an agent should create files directly instead.

`eleventy.config.js`:

```javascript
import techdoc from "eleventy-plugin-techdoc";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(techdoc, {
    site: { name: "My Site", url: "https://example.com", description: "…" },
    features: { blog: true, docs: true, darkMode: true, i18n: false },
    i18n: { defaultLanguage: "en", languages: ["en"] },
  });
  eleventyConfig.addPassthroughCopy("src/assets");
  return { dir: { input: "src", output: "_site" }, markdownTemplateEngine: "njk" };
}
```

**Options (full shape; defaults).** `site: { name:"", url:"", description:"" }`; `features: { blog:true, docs:true, darkMode:true, i18n:true }`; `i18n: { defaultLanguage:"en", languages:["en"] }`. `features.docs` gates the `docs`/`api` layouts and the `docs` collection; `features.blog` gates the blog layout, the blog/tag/category pages, and the blog collections; `features.darkMode` renders the toggle button; `features.i18n` renders the language switcher and per-language pages.

**Data files the site must provide** (under `src/_data/`):

- `site.json` — `{ title, description, url, stylesheet }`. Optional fields `base.njk` uses if present: `name, author, keywords, themeColor, ogImage, twitterSite, twitterCreator, favicon, appleTouchIcon, organization{name,logo,sameAs}, searchUrl`.
- `navigation.json` — `main` (header nav: `[{ text, url, external?, i18nKey? }]`) and `footer` (`[{ title, items: [{ text, url }] }]`). `api.njk` also reads optional `api` and `docs` arrays.
- For i18n: `i18n.json` (nested per-language strings) and `languages.json` (`{ "en": { "code": "en", "nativeName": "English" }, … }`).

**Layouts** (`layout: layouts/<name>.njk`): `base.njk` (HTML shell — head meta, Open Graph/Twitter, JSON-LD, hreflang, header, footer; blocks `head`/`content`/`scripts`), `docs.njk` (sidebar from `eleventyNavigation`; classes `.docs-layout`/`.sidebar`/`.docs-content`), `blog.njk` (`.blog-post`/`.blog-container`), `api.njk` (docs-style; sidebar from `navigation.json`).

**Content conventions.**

- Docs: markdown in `src/docs/**/*.md`, `layout: layouts/docs.njk`, add `eleventyNavigation: { key, order }` for the sidebar.
- Blog: markdown in `src/blog/*.md`, `layout: layouts/blog.njk`, frontmatter `tags: posts` (required) plus optional `category`, `excerpt`, `author`, `date`.
- i18n: place non-default-language content under `src/<lang>/…`; per-language blog/tag/category pages are auto-registered.

**Collections** (`collections.*`): `posts`, `tagList`, `categoryList`, `postsByTag`, `postsByCategory`, `docs`. For each non-default language `<lang>`: `<lang>posts`, `<lang>tagList`, `<lang>categoryList`, `<lang>postsByTag`, `<lang>postsByCategory`, `<lang>Docs`.

**Filters:** `dateFormat`, `isoDate`, `dateToRfc3339`, `limit`, `capitalize`, `slugify`, `t` (i18n; returns `undefined` when missing, so chain `| default("…")`), `altLangUrl`, `extractLangFromUrl`, `toOgLocale`. **Shortcode:** `{% year %}`.

**Auto-generated output** (no files needed): `/feed.xml` (Atom, from `posts`), `/sitemap.xml`, `/robots.txt`, `/llms.txt`; the blog index and `/blog/tags/<tag>/`, `/blog/categories/<category>/` (plus per-language variants).

**CSS contract.** The theme loads `/techdoc/css/{reset,layout,utilities}.css`, then the site's `site.stylesheet`. The structural CSS has **no colors**. The site's stylesheet MUST define the color variables the templates use: `--color-bg`, `--color-text`, `--color-primary`, `--color-border`, `--color-muted` — and a `[data-theme="dark"]` block (`base.njk` sets `data-theme` from `localStorage`/`prefers-color-scheme`; the dark-mode button toggles it). Layout variables are optional (the theme uses built-in fallbacks): `--max-width` (1200px), `--sidebar-width` (250px), `--content-width` (65ch), `--header-height` (60px), plus a `--space-*` scale.

**Minimal viable site an agent can generate:** the `eleventy.config.js` above + `src/_data/site.json` + `src/_data/navigation.json` + `src/assets/css/styles.css` (defining the color variables) + `src/index.njk` (`layout: layouts/base.njk`) + a `src/docs/*.md` (`layout: layouts/docs.njk` with `eleventyNavigation`) + optionally `src/blog/*.md` (`tags: posts`). Then run `npx @11ty/eleventy --serve`.
