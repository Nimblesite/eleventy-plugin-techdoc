#!/usr/bin/env node

import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
// `@inquirer/prompts` is imported lazily inside main() so `--version`/`--help` start no
// runtime and load no heavy dependencies. [SWR-VERSION-CLI-OUTPUT]

const cwd = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Shipwright binary version contract [SWR-VERSION-CLI-OUTPUT][SWR-VERSION-JSON-OUTPUT] ---
// `--version` prints exactly "<binaryName> <version>", exits 0, starts no runtime, touches no network.
// Version derives from package metadata, never a hard-coded string [SWR-VERSION-BINDINGS].
function readVersion() {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
  return pkg.version;
}

function handleCliArgs(argv) {
  const args = new Set(argv);

  if (args.has("--help") || args.has("-h")) {
    console.log(
      `eleventy-plugin-techdoc ${readVersion()}\n\n` +
        "Usage:\n" +
        "  eleventy-plugin-techdoc            Scaffold a techdoc Eleventy site in the current directory\n" +
        "  eleventy-plugin-techdoc --version  Print the version and exit\n" +
        "  eleventy-plugin-techdoc --help     Show this help and exit"
    );
    process.exit(0);
  }

  if (args.has("--version") || args.has("-v")) {
    const version = readVersion();
    if (args.has("--json")) {
      process.stdout.write(
        JSON.stringify({
          manifestVersion: 1,
          name: "eleventy-plugin-techdoc",
          version,
          kind: "cli",
          language: "javascript",
        }) + "\n"
      );
    } else {
      console.log(`eleventy-plugin-techdoc ${version}`);
    }
    process.exit(0);
  }
}

handleCliArgs(process.argv.slice(2));

// CSS style templates
const cssStyles = {
  minimal: `/* Minimal - Clean light/dark mode */
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

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  margin: 0;
}

a { color: var(--color-primary); }

.site-header {
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-weight: 700;
  text-decoration: none;
  color: var(--color-text);
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text);
}

.docs-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
}

.sidebar ul { list-style: none; padding: 0; }
.sidebar a { text-decoration: none; color: var(--color-text); }

.blog-container {
  max-width: 65ch;
  margin: 0 auto;
  padding: 2rem;
}

.site-footer {
  border-top: 1px solid var(--color-border);
  padding: 2rem;
  margin-top: 4rem;
  text-align: center;
}

@media (max-width: 768px) {
  .docs-layout { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
`,

  c64: `/* C64 - Commodore 64 retro style */
@font-face {
  font-family: 'C64';
  src: local('Courier New'), local('Consolas'), local('monospace');
}

:root {
  --color-bg: #4040e0;
  --color-text: #a0a0ff;
  --color-primary: #a0a0ff;
  --color-border: #7070ff;
  --color-muted: #8080e0;
  --c64-blue-dark: #4040e0;
  --c64-blue-light: #a0a0ff;
}

[data-theme="dark"] {
  --color-bg: #000080;
  --color-text: #a0a0ff;
  --color-primary: #a0a0ff;
  --color-border: #4040e0;
  --color-muted: #6060c0;
}

* {
  box-sizing: border-box;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'C64', 'Courier New', Consolas, monospace;
  font-size: 16px;
  line-height: 1.4;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: normal;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.site-header {
  border-bottom: 4px double var(--color-border);
  padding: 1rem 2rem;
  background: var(--c64-blue-dark);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-weight: normal;
  text-decoration: none;
  color: var(--color-text);
  font-size: 1.2rem;
}

.logo::before {
  content: "*** ";
}

.logo::after {
  content: " ***";
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
}

.nav-link:hover {
  border: 1px solid var(--color-border);
}

.docs-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
}

.sidebar {
  border-right: 2px solid var(--color-border);
  padding-right: 1rem;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li::before {
  content: "> ";
}

.sidebar a {
  text-decoration: none;
  color: var(--color-text);
}

.blog-container {
  max-width: 65ch;
  margin: 0 auto;
  padding: 2rem;
}

.site-footer {
  border-top: 4px double var(--color-border);
  padding: 2rem;
  margin-top: 4rem;
  text-align: center;
  background: var(--c64-blue-dark);
}

.site-footer::before {
  content: "READY.";
  display: block;
  margin-bottom: 1rem;
}

code, pre {
  background: var(--c64-blue-dark);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
}

pre {
  padding: 1rem;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .docs-layout { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .sidebar { border-right: none; border-bottom: 2px solid var(--color-border); }
}
`,

  none: `/* No styles - you provide everything from scratch */
/* Required CSS custom properties for techdoc theme: */
:root {
  --color-bg: #fff;
  --color-text: #000;
  --color-primary: #00f;
  --color-border: #ccc;
}
`,
};

// Handle package.json separately - merge, don't skip
function updatePackageJson() {
  const pkgPath = join(cwd, "package.json");

  const additions = {
    type: "module",
    scripts: {
      dev: "npx @11ty/eleventy --serve",
      build: "npx @11ty/eleventy",
    },
  };

  if (existsSync(pkgPath)) {
    const existing = JSON.parse(readFileSync(pkgPath, "utf-8"));
    existing.type = additions.type;
    existing.scripts = { ...existing.scripts, ...additions.scripts };
    writeFileSync(pkgPath, JSON.stringify(existing, null, 2) + "\n");
    console.log("  update: package.json (added type, scripts)");
  } else {
    const fresh = {
      name: "my-site",
      version: "1.0.0",
      ...additions,
      dependencies: {
        "@11ty/eleventy": "^3.1.2",
        "eleventy-plugin-techdoc": "^0.1.0",
      },
    };
    writeFileSync(pkgPath, JSON.stringify(fresh, null, 2) + "\n");
    console.log("  create: package.json");
  }
}

// Core files always created (minimal structure)
function getCoreFiles(cssStyle, siteConfig = {}) {
  const {
    name = "My Site",
    description = "Built with techdoc",
    author = "",
    githubUrl = "",
    twitterHandle = "",
    discordUrl = "",
  } = siteConfig;

  // Build footer sections - proper multi-column footer like real sites
  const footerSections = [
    {
      title: "Documentation",
      items: [
        { text: "Getting Started", url: "/docs/" },
        { text: "Blog", url: "/blog/" },
      ],
    },
    {
      title: "Community",
      items: [
        ...(githubUrl ? [{ text: "GitHub", url: githubUrl }] : []),
        ...(discordUrl ? [{ text: "Discord", url: discordUrl }] : []),
        ...(twitterHandle
          ? [{ text: "Twitter", url: `https://twitter.com/${twitterHandle.replace("@", "")}` }]
          : []),
      ].filter((item) => item.url),
    },
    {
      title: "More",
      items: [{ text: "Eleventy", url: "https://www.11ty.dev" }],
    },
  ].filter((section) => section.items.length > 0); // Remove empty sections

  // Build site.json with optional fields
  const siteJson = {
    title: name,
    description: description,
    url: "https://example.com",
    stylesheet: "/assets/css/styles.css",
  };
  if (author) {
    siteJson.author = author;
  }
  if (twitterHandle) {
    siteJson.twitterSite = twitterHandle;
  }

  return {
    "eleventy.config.js": `import techdoc from "eleventy-plugin-techdoc";

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(techdoc, {
    site: {
      name: "${name}",
      url: "https://example.com",
      description: "${description}",
    },
    features: {
      blog: true,
      docs: true,
      darkMode: true,
      i18n: false,
    },
  });

  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
  };
}
`,

    "src/_data/site.json": JSON.stringify(siteJson, null, 2) + "\n",

    "src/_data/navigation.json":
      JSON.stringify(
        {
          main: [
            { text: "Docs", url: "/docs/" },
            { text: "API", url: "/api/" },
            { text: "Blog", url: "/blog/" },
            ...(githubUrl ? [{ text: "GitHub", url: githubUrl, external: true }] : []),
          ],
          footer: footerSections,
        },
        null,
        2
      ) + "\n",

    "src/_data/i18n.json": `{
  "en": {
    "blog": {
      "back": "← Back to Blog",
      "title": "Blog",
      "subtitle": "Latest posts and updates"
    },
    "nav": {
      "apiReference": "API Reference",
      "docs": "Documentation",
      "blog": "Blog",
      "api": "API"
    },
    "docs": {
      "title": "Documentation",
      "gettingStarted": "Getting Started"
    }
  },
  "zh": {
    "blog": {
      "back": "← 返回博客",
      "title": "博客",
      "subtitle": "最新文章和更新"
    },
    "nav": {
      "apiReference": "API 参考",
      "docs": "文档",
      "blog": "博客",
      "api": "API"
    },
    "docs": {
      "title": "文档",
      "gettingStarted": "入门指南"
    }
  }
}
`,

    "src/assets/css/styles.css": cssStyles[cssStyle],

    "src/feed.njk": `---json
{
  "permalink": "feed.xml",
  "eleventyExcludeFromCollections": true
}
---
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>{{ site.title }}</title>
  <subtitle>{{ site.description }}</subtitle>
  <link href="{{ site.url }}/feed.xml" rel="self"/>
  <updated>{% if collections.posts | length > 0 %}{{ collections.posts | last | getNewestCollectionItemDate | dateToRfc3339 }}{% else %}{{ "now" | dateToRfc3339 }}{% endif %}</updated>
  <id>{{ site.url }}/</id>
  {%- for post in collections.posts | reverse %}
  <entry>
    <title>{{ post.data.title }}</title>
    <link href="{{ site.url }}{{ post.url }}"/>
    <id>{{ site.url }}{{ post.url }}</id>
    <updated>{{ post.date | dateToRfc3339 }}</updated>
    <content type="html">{{ post.templateContent | htmlBaseUrl(site.url) }}</content>
  </entry>
  {%- endfor %}
</feed>
`,

    "src/sitemap.njk": `---json
{
  "permalink": "sitemap.xml",
  "eleventyExcludeFromCollections": true
}
---
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  {%- for page in collections.all %}
  {%- if not page.data.eleventyExcludeFromCollections %}
  <url>
    <loc>{{ site.url }}{{ page.url }}</loc>
    <lastmod>{{ page.date | isoDate }}</lastmod>
  </url>
  {%- endif %}
  {%- endfor %}
</urlset>
`,

    "src/robots.txt.njk": `---json
{
  "permalink": "robots.txt",
  "eleventyExcludeFromCollections": true
}
---
User-agent: *
Allow: /

Sitemap: {{ site.url }}/sitemap.xml
`,

    "src/llms.txt.njk": `---json
{
  "permalink": "llms.txt",
  "eleventyExcludeFromCollections": true
}
---
# {{ site.title }}

> {{ site.description }}

This site contains documentation and resources.

## Documentation
{% for page in collections.docs %}
- [{{ page.data.title }}]({{ site.url }}{{ page.url }}): {{ page.data.description | default(page.data.title) }}
{% endfor %}

## Blog Posts
{% for post in collections.posts | reverse | limit(10) %}
- [{{ post.data.title }}]({{ site.url }}{{ post.url }}): {{ post.data.excerpt | default(post.data.title) }}
{% endfor %}

## Navigation
- Home: {{ site.url }}/
- Documentation: {{ site.url }}/docs/
- Blog: {{ site.url }}/blog/
- RSS Feed: {{ site.url }}/feed.xml
`,

    "src/_data/languages.json": `{
  "en": { "code": "en", "nativeName": "English" },
  "zh": { "code": "zh", "nativeName": "中文" },
  "es": { "code": "es", "nativeName": "Español" }
}
`,

    "src/index.njk": `---
layout: layouts/base.njk
title: Home
---

<h1>Welcome</h1>
<p>Edit <code>src/index.njk</code> to customize this page.</p>
`,

    "src/docs/index.md": `---
layout: layouts/docs.njk
title: Documentation
eleventyNavigation:
  key: Documentation
  order: 1
---

# Documentation

Your documentation goes here.
`,

    "src/blog/index.njk": `---
layout: layouts/base.njk
title: Blog
---

<div class="blog-container">
  <h1>Blog</h1>
  {%- if collections.posts | length > 0 -%}
  <ul class="post-list" style="list-style: none; padding: 0;">
    {%- for post in collections.posts | reverse -%}
    <li style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border);">
      <a href="{{ post.url }}" style="font-size: 1.25rem; font-weight: 600;">{{ post.data.title }}</a>
      <div style="color: var(--color-muted); font-size: 0.875rem; margin-top: 0.25rem;">
        <time datetime="{{ post.date | isoDate }}">{{ post.date | dateFormat }}</time>
        {% if post.data.author %} &middot; {{ post.data.author }}{% endif %}
      </div>
      {% if post.data.excerpt %}<p style="margin-top: 0.5rem;">{{ post.data.excerpt }}</p>{% endif %}
    </li>
    {%- endfor -%}
  </ul>
  {%- else -%}
  <p>No posts yet. Create markdown files in <code>src/blog/</code> with <code>tags: posts</code> in frontmatter.</p>
  {%- endif -%}
</div>
`,
  };
}

// Sample content files (optional)
function getSampleContentFiles(siteConfig = {}) {
  const {
    name = "My Site",
    author = "",
    description = "Documentation and blog powered by techdoc",
  } = siteConfig;
  const authorName = author || "Your Name";

  return {
    // Override eleventy.config.js with i18n enabled
    "eleventy.config.js": `import techdoc from "eleventy-plugin-techdoc";

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(techdoc, {
    site: {
      name: "${name}",
      url: "https://example.com",
      description: "${description}",
    },
    features: {
      blog: true,
      docs: true,
      darkMode: true,
      i18n: true,
    },
    i18n: {
      defaultLanguage: 'en',
      languages: ['en', 'zh'],
    },
  });

  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
  };
}
`,

    "src/index.njk": `---
layout: layouts/base.njk
title: Home
lang: en
permalink: /
---

<div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
  <h1>Welcome to ${name}</h1>
  <p><strong>This is sample content.</strong> Edit <code>src/index.njk</code> to customize this page.</p>

  <h2>Quick Links</h2>
  <ul>
    <li><a href="/docs/">Documentation</a> - Learn how to use the project</li>
    <li><a href="/blog/">Blog</a> - Read the latest updates</li>
  </ul>

  <h2>Features</h2>
  <ul>
    <li>Fast static site generation with Eleventy</li>
    <li>Dark/light mode toggle</li>
    <li>Documentation with sidebar navigation</li>
    <li>Blog with posts and tags</li>
    <li>Syntax highlighting for code blocks</li>
  </ul>

  <p style="margin-top: 2rem; padding: 1rem; border: 1px solid var(--color-border); border-radius: 4px;">
    <strong>Tip:</strong> Run <code>npm run build</code> to generate production files in <code>_site/</code>
  </p>
</div>
`,

    // Chinese home page
    "src/zh/index.njk": `---
layout: layouts/base.njk
title: 首页
lang: zh
permalink: /zh/
---

<div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
  <h1>欢迎使用 ${name}</h1>
  <p><strong>这是示例内容。</strong>编辑 <code>src/zh/index.njk</code> 来自定义此页面。</p>

  <h2>快速链接</h2>
  <ul>
    <li><a href="/zh/docs/">文档</a> - 了解如何使用项目</li>
    <li><a href="/zh/blog/">博客</a> - 阅读最新更新</li>
  </ul>

  <h2>功能特性</h2>
  <ul>
    <li>使用 Eleventy 快速生成静态网站</li>
    <li>深色/浅色模式切换</li>
    <li>带侧边栏导航的文档</li>
    <li>支持文章和标签的博客</li>
    <li>代码块语法高亮</li>
  </ul>

  <p style="margin-top: 2rem; padding: 1rem; border: 1px solid var(--color-border); border-radius: 4px;">
    <strong>提示：</strong>运行 <code>npm run build</code> 在 <code>_site/</code> 目录生成生产文件
  </p>
</div>
`,

    "src/docs/index.md": `---
layout: layouts/docs.njk
title: Getting Started
eleventyNavigation:
  key: Getting Started
  order: 1
---

# Getting Started

**This is sample documentation.** Replace this content with your own.

## Installation

\`\`\`bash
npm install your-package
\`\`\`

## Quick Start

\`\`\`javascript
import { something } from 'your-package';

// Initialize
const app = something.create({
  option: 'value'
});

// Use it
app.doSomething();
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`option1\` | string | \`"default"\` | Sample option |
| \`option2\` | boolean | \`false\` | Another option |
| \`option3\` | number | \`42\` | Numeric option |

## Next Steps

- Check out the [API Reference](/docs/api/) for detailed documentation
- Read the [Configuration Guide](/docs/configuration/) for advanced setup
- Visit the [Blog](/blog/) for tutorials and updates
`,

    "src/docs/api.md": `---
layout: layouts/docs.njk
title: API Reference
eleventyNavigation:
  key: API Reference
  order: 2
---

# API Reference

**Sample API documentation.** Replace with your actual API docs.

## Methods

### \`create(options)\`

Creates a new instance.

\`\`\`typescript
interface Options {
  name: string;
  debug?: boolean;
}

function create(options: Options): Instance;
\`\`\`

**Parameters:**
- \`options.name\` - Required. The instance name.
- \`options.debug\` - Optional. Enable debug logging.

**Returns:** A new \`Instance\` object.

### \`destroy()\`

Cleans up resources.

\`\`\`javascript
instance.destroy();
\`\`\`

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| \`ready\` | \`{ timestamp }\` | Fired when ready |
| \`error\` | \`{ message, code }\` | Fired on error |
`,

    "src/docs/configuration.md": `---
layout: layouts/docs.njk
title: Configuration
eleventyNavigation:
  key: Configuration
  order: 3
---

# Configuration

**Sample configuration guide.** Customize for your project.

## Basic Setup

Create a config file in your project root:

\`\`\`javascript
// config.js
export default {
  // Site settings
  siteName: 'My Project',
  baseUrl: 'https://example.com',

  // Feature flags
  features: {
    analytics: true,
    comments: false,
  },
};
\`\`\`

## Environment Variables

\`\`\`bash
# .env
API_KEY=your-api-key
DEBUG=true
NODE_ENV=production
\`\`\`

## Advanced Options

For production deployments, consider these settings:

\`\`\`javascript
export default {
  cache: {
    enabled: true,
    ttl: 3600,
  },
  logging: {
    level: 'warn',
    format: 'json',
  },
};
\`\`\`
`,

    "src/blog/index.njk": `---
layout: layouts/base.njk
title: Blog
---

<div class="blog-container">
  <h1>Blog</h1>
  <p style="color: var(--color-muted); margin-bottom: 2rem;">Latest posts and updates</p>

  <ul class="post-list" style="list-style: none; padding: 0;">
    {%- for post in collections.posts | reverse -%}
    <li style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border);">
      <a href="{{ post.url }}" style="font-size: 1.25rem; font-weight: 600;">{{ post.data.title }}</a>
      <div style="color: var(--color-muted); font-size: 0.875rem; margin-top: 0.25rem;">
        <time datetime="{{ post.date | isoDate }}">{{ post.date | dateFormat }}</time>
        {% if post.data.author %} &middot; {{ post.data.author }}{% endif %}
      </div>
      {% if post.data.excerpt %}<p style="margin-top: 0.5rem;">{{ post.data.excerpt }}</p>{% endif %}
    </li>
    {%- endfor -%}
  </ul>
</div>
`,

    "src/blog/hello-world.md": `---
layout: layouts/blog.njk
title: Hello World
date: ${new Date().toISOString().split("T")[0]}
author: ${authorName}
tags: posts
excerpt: Welcome to your new blog! This is a sample post to get you started.
---

# Hello World

**This is a sample blog post.** Replace this content with your own writing.

Welcome to your new blog built with techdoc! This post demonstrates some of the features available.

## Code Highlighting

Here's some JavaScript with syntax highlighting:

\`\`\`javascript
function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

greet('World');
\`\`\`

## Formatting

You can use all standard Markdown formatting:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`inline code\` for technical terms
- [Links](https://example.com) to other pages

> Blockquotes for callouts or citations

## What's Next?

1. Edit this post or delete it
2. Create new posts in \`src/blog/\`
3. Customize the styling in \`src/assets/css/styles.css\`
`,

    "src/blog/getting-started-guide.md": `---
layout: layouts/blog.njk
title: Getting Started with techdoc
date: ${(() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d.toISOString().split("T")[0];
    })()}
author: ${authorName}
tags: posts
excerpt: A quick guide to customizing your new documentation site.
---

# Getting Started with techdoc

**Another sample post.** This one shows how multiple posts appear in the blog listing.

## File Structure

Your site is organized like this:

\`\`\`
src/
├── _data/
│   ├── site.json        # Site metadata
│   └── navigation.json  # Nav links
├── assets/
│   └── css/
│       └── styles.css   # Your custom styles
├── blog/
│   ├── index.njk        # Blog listing page
│   └── *.md             # Blog posts
├── docs/
│   └── *.md             # Documentation pages
└── index.njk            # Home page
\`\`\`

## Customization

### Change Site Info

Edit \`src/_data/site.json\`:

\`\`\`json
{
  "title": "Your Site Name",
  "description": "Your site description",
  "url": "https://your-domain.com"
}
\`\`\`

### Update Navigation

Edit \`src/_data/navigation.json\` to add or remove nav links.

### Style Your Site

All visual styling lives in \`src/assets/css/styles.css\`. The theme provides structure only - you control the look!
`,

    // Chinese docs
    "src/zh/docs/index.md": `---
layout: layouts/docs.njk
title: 入门指南
lang: zh
permalink: /zh/docs/
eleventyNavigation:
  key: 入门指南
  order: 1
---

# 入门指南

**这是示例文档。**请用您自己的内容替换。

## 安装

\`\`\`bash
npm install your-package
\`\`\`

## 快速开始

\`\`\`javascript
import { something } from 'your-package';

// 初始化
const app = something.create({
  option: 'value'
});

// 使用
app.doSomething();
\`\`\`
`,

    "src/zh/docs/api.md": `---
layout: layouts/docs.njk
title: API 参考
lang: zh
permalink: /zh/docs/api/
eleventyNavigation:
  key: API 参考
  order: 2
---

# API 参考

**示例 API 文档。**请用您实际的 API 文档替换。

## 方法

### \`create(options)\`

创建新实例。

\`\`\`typescript
interface Options {
  name: string;
  debug?: boolean;
}

function create(options: Options): Instance;
\`\`\`
`,

    // Chinese blog
    "src/zh/blog/index.njk": `---
layout: layouts/base.njk
title: 博客
lang: zh
permalink: /zh/blog/
---
<div class="blog-container">
  <h1>博客</h1>
  <p style="color: var(--color-muted); margin-bottom: 2rem;">最新文章和更新</p>
  <ul class="post-list" style="list-style: none; padding: 0;">
    {%- for post in collections.zhposts | reverse -%}
    <li style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border);">
      <a href="{{ post.url }}" style="font-size: 1.25rem; font-weight: 600;">{{ post.data.title }}</a>
      <div style="color: var(--color-muted); font-size: 0.875rem; margin-top: 0.25rem;">
        <time datetime="{{ post.date | isoDate }}">{{ post.date | dateFormat }}</time>
        {% if post.data.author %} · {{ post.data.author }}{% endif %}
      </div>
      {% if post.data.excerpt %}<p style="margin-top: 0.5rem;">{{ post.data.excerpt }}</p>{% endif %}
    </li>
    {%- endfor -%}
  </ul>
</div>
`,

    "src/zh/blog/hello-world.md": `---
layout: layouts/blog.njk
title: 你好世界
date: ${new Date().toISOString().split("T")[0]}
author: 你的名字
tags: posts
lang: zh
permalink: /zh/blog/hello-world/
excerpt: 欢迎来到你的新博客！
---

# 你好世界

**这是示例博客文章。**请用您自己的内容替换。

欢迎使用 techdoc 构建的新博客！这篇文章展示了一些可用的功能。

## 代码高亮

这是带语法高亮的 JavaScript 代码：

\`\`\`javascript
function greet(name) {
  // 打印问候语
  const message = \`你好，\${name}！\`;
  console.log(message);
  return message;
}

greet('世界');
\`\`\`

## 格式化

您可以使用所有标准 Markdown 格式：

- **粗体文本** 用于强调
- *斜体文本* 用于轻微强调
- \`行内代码\` 用于技术术语
- [链接](https://example.com) 到其他页面

> 引用块用于提示或引用
`,

    // API section
    "src/api/index.njk": `---
layout: layouts/base.njk
title: API Reference
permalink: /api/
---
<div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
  <h1>API Reference</h1>
  <p style="color: var(--color-muted); margin-bottom: 2rem;">API documentation for the project</p>

  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
    <a href="/docs/api/" style="display: block; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: 8px; text-decoration: none;">
      <h3 style="margin: 0 0 0.5rem 0;">Core API</h3>
      <p style="margin: 0; color: var(--color-muted);">Core functionality and utilities</p>
    </a>
  </div>
</div>
`,

    "src/zh/api/index.njk": `---
layout: layouts/base.njk
title: API 参考
lang: zh
permalink: /zh/api/
---
<div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
  <h1>API 参考</h1>
  <p style="color: var(--color-muted); margin-bottom: 2rem;">项目 API 文档</p>

  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
    <a href="/zh/docs/api/" style="display: block; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: 8px; text-decoration: none;">
      <h3 style="margin: 0 0 0.5rem 0;">核心 API</h3>
      <p style="margin: 0; color: var(--color-muted);">核心功能和工具</p>
    </a>
  </div>
</div>
`,
  };
}

async function main() {
  const { select, input } = await import("@inquirer/prompts");

  console.log("Scaffolding techdoc site...\n");

  // Prompt for CSS style
  const cssStyle = await select({
    message: "Choose a CSS style:",
    choices: [
      {
        name: "Minimal (default)",
        value: "minimal",
        description: "Basic CSS custom properties with simple light/dark mode",
      },
      {
        name: "C64",
        value: "c64",
        description: "Commodore 64 retro style with blocky monospace font",
      },
      {
        name: "None",
        value: "none",
        description: "No CSS generated - you provide all styling from scratch",
      },
    ],
    default: "minimal",
  });

  // Prompt for sample content
  const includeSampleContent = await select({
    message: "Include sample content?",
    choices: [
      {
        name: "Yes (recommended)",
        value: true,
        description: "Include sample docs, blog posts, and example config",
      },
      {
        name: "No",
        value: false,
        description: "Minimal files only - configure from scratch",
      },
    ],
    default: true,
  });

  let siteConfig;

  if (includeSampleContent) {
    // Sample content = use complete example config (no questions!)
    siteConfig = {
      name: "My Awesome Project",
      description: "Documentation and blog powered by techdoc",
      author: "Your Name",
      githubUrl: "https://github.com/your-username/your-project",
      twitterHandle: "@yourhandle",
      discordUrl: "https://discord.gg/example",
    };
    console.log("\nUsing sample configuration. Edit src/_data/ files to customize.\n");
  } else {
    // No sample = ask questions for real config
    console.log("\nConfiguring your site:\n");

    const siteName = await input({
      message: "Site name:",
      default: "My Site",
    });

    const siteDescription = await input({
      message: "Site description:",
      default: "Built with techdoc",
    });

    const authorName = await input({
      message: "Author name (optional):",
      default: "",
    });

    const githubUrl = await input({
      message: "GitHub URL (optional):",
      default: "",
    });

    const twitterHandle = await input({
      message: "Twitter handle (optional, e.g. @username):",
      default: "",
    });

    siteConfig = {
      name: siteName,
      description: siteDescription,
      author: authorName,
      githubUrl: githubUrl,
      twitterHandle: twitterHandle,
    };
  }

  console.log(`Using ${cssStyle} CSS style`);
  console.log(`Sample content: ${includeSampleContent ? "yes" : "no"}\n`);

  updatePackageJson();

  // Get core files, then optionally merge sample content
  const files = getCoreFiles(cssStyle, siteConfig);
  if (includeSampleContent) {
    Object.assign(files, getSampleContentFiles(siteConfig));
  }

  for (const [path, content] of Object.entries(files)) {
    const fullPath = join(cwd, path);
    const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (existsSync(fullPath)) {
      console.log(`  skip: ${path} (exists)`);
    } else {
      writeFileSync(fullPath, content);
      console.log(`  create: ${path}`);
    }
  }

  console.log("\nDone! Run: npm run dev");
}

main().catch(console.error);
