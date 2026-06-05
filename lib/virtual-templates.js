/**
 * techdoc virtual templates
 * Registers layouts and pages via Eleventy's addTemplate() API
 * This allows templates to live in the npm package and updates flow automatically
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Register virtual templates (layouts and pages)
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {object} options
 */
export function registerVirtualTemplates(eleventyConfig, options) {
  const templatesDir = join(__dirname, "..", "templates");

  // ============================================
  // LAYOUTS
  // ============================================

  // Register base layout
  eleventyConfig.addTemplate(
    "_includes/layouts/base.njk",
    readFileSync(join(templatesDir, "layouts/base.njk"), "utf-8")
  );

  // Register docs layout if docs feature is enabled
  if (options.features.docs) {
    eleventyConfig.addTemplate(
      "_includes/layouts/docs.njk",
      readFileSync(join(templatesDir, "layouts/docs.njk"), "utf-8")
    );
  }

  // Register blog layout if blog feature is enabled
  if (options.features.blog) {
    eleventyConfig.addTemplate(
      "_includes/layouts/blog.njk",
      readFileSync(join(templatesDir, "layouts/blog.njk"), "utf-8")
    );
  }

  // Register API layout if docs feature is enabled
  if (options.features.docs) {
    eleventyConfig.addTemplate(
      "_includes/layouts/api.njk",
      readFileSync(join(templatesDir, "layouts/api.njk"), "utf-8")
    );
  }

  // ============================================
  // SEO PAGES (always registered)
  // ============================================

  // Feed (RSS/Atom)
  eleventyConfig.addTemplate(
    "feed.njk",
    readFileSync(join(templatesDir, "pages/feed.njk"), "utf-8")
  );

  // Sitemap
  eleventyConfig.addTemplate(
    "sitemap.njk",
    readFileSync(join(templatesDir, "pages/sitemap.njk"), "utf-8")
  );

  // robots.txt
  eleventyConfig.addTemplate(
    "robots.txt.njk",
    readFileSync(join(templatesDir, "pages/robots.txt.njk"), "utf-8")
  );

  // llms.txt (AI context file)
  eleventyConfig.addTemplate(
    "llms.txt.njk",
    readFileSync(join(templatesDir, "pages/llms.txt.njk"), "utf-8")
  );

  // ============================================
  // BLOG PAGES (if blog feature is enabled)
  // Note: These are registered for the default language only.
  // Sites must create their own zh/blog/index.njk etc. for other languages.
  // ============================================

  if (options.features.blog) {
    // Blog index (default language)
    eleventyConfig.addTemplate(
      "blog/index.njk",
      readFileSync(join(templatesDir, "pages/blog/index.njk"), "utf-8")
    );

    // Tags index (default language)
    eleventyConfig.addTemplate(
      "blog/tags.njk",
      readFileSync(join(templatesDir, "pages/blog/tags.njk"), "utf-8")
    );

    // Tag pages - pagination (default language)
    eleventyConfig.addTemplate(
      "blog/tags-pages.njk",
      readFileSync(join(templatesDir, "pages/blog/tags-pages.njk"), "utf-8")
    );

    // Categories index (default language)
    eleventyConfig.addTemplate(
      "blog/categories.njk",
      readFileSync(join(templatesDir, "pages/blog/categories.njk"), "utf-8")
    );

    // Category pages - pagination (default language)
    eleventyConfig.addTemplate(
      "blog/categories-pages.njk",
      readFileSync(join(templatesDir, "pages/blog/categories-pages.njk"), "utf-8")
    );

    // Register i18n blog pages for each non-default language
    const defaultLang = options.i18n?.defaultLanguage || "en";
    const languages = options.i18n?.languages || ["en"];

    for (const lang of languages) {
      if (lang === defaultLang) {
        continue;
      }

      // Blog index for this language
      eleventyConfig.addTemplate(
        `${lang}/blog/index.njk`,
        readFileSync(join(templatesDir, "pages/blog/index.njk"), "utf-8")
          .replace("permalink: /blog/", `permalink: /${lang}/blog/`)
          .replace("title: Blog", `title: Blog\nlang: ${lang}`)
      );

      // Tags index for this language
      eleventyConfig.addTemplate(
        `${lang}/blog/tags.njk`,
        readFileSync(join(templatesDir, "pages/blog/tags.njk"), "utf-8")
          .replace("permalink: /blog/tags/", `permalink: /${lang}/blog/tags/`)
          .replace("title: Tags", `title: Tags\nlang: ${lang}`)
      );

      // Tag pages for this language
      eleventyConfig.addTemplate(
        `${lang}/blog/tags-pages.njk`,
        readFileSync(join(templatesDir, "pages/blog/tags-pages.njk"), "utf-8")
          .replace(
            /permalink: \/blog\/tags\/\{\{ tag \| slugify \}\}\//g,
            `permalink: /${lang}/blog/tags/{{ tag | slugify }}/`
          )
          .replace(/data: collections\.tagList/g, `data: collections.${lang}tagList`)
          .replace(/collections\.postsByTag/g, `collections.${lang}postsByTag`)
      );

      // Categories index for this language
      eleventyConfig.addTemplate(
        `${lang}/blog/categories.njk`,
        readFileSync(join(templatesDir, "pages/blog/categories.njk"), "utf-8")
          .replace("permalink: /blog/categories/", `permalink: /${lang}/blog/categories/`)
          .replace("title: Categories", `title: Categories\nlang: ${lang}`)
      );

      // Category pages for this language
      eleventyConfig.addTemplate(
        `${lang}/blog/categories-pages.njk`,
        readFileSync(join(templatesDir, "pages/blog/categories-pages.njk"), "utf-8")
          .replace(
            /permalink: \/blog\/categories\/\{\{ category \| slugify \}\}\//g,
            `permalink: /${lang}/blog/categories/{{ category | slugify }}/`
          )
          .replace(/data: collections\.categoryList/g, `data: collections.${lang}categoryList`)
          .replace(/collections\.postsByCategory/g, `collections.${lang}postsByCategory`)
      );
    }
  }
}
