/**
 * techdoc - Minimal structural Eleventy theme for tech documentation
 *
 * NO colors, NO typography, NO decorative styles.
 * Sites must provide ALL visual styling via CSS custom properties.
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { registerFilters } from "./filters/index.js";
import { registerCollections } from "./plugins/collections.js";
import { registerVirtualTemplates } from "./virtual-templates.js";
import { registerShortcodes } from "./shortcodes/index.js";
import { configureMarkdown } from "./plugins/markdown.js";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import rss from "@11ty/eleventy-plugin-rss";
import navigation from "@11ty/eleventy-navigation";

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultOptions = {
  site: {
    name: "",
    url: "",
    description: "",
  },
  features: {
    blog: true,
    docs: true,
    darkMode: true,
    i18n: true,
  },
  i18n: {
    defaultLanguage: "en",
    languages: ["en"],
  },
};

/**
 * Main plugin entry point
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {typeof defaultOptions} userOptions
 */
export default function techdocPlugin(eleventyConfig, userOptions = {}) {
  // Version check - require Eleventy 3.x
  try {
    eleventyConfig.versionCheck(">=3.0");
  } catch (e) {
    console.warn(`[techdoc] Warning: ${e.message}`);
  }

  // Merge options
  const options = {
    ...defaultOptions,
    ...userOptions,
    site: { ...defaultOptions.site, ...userOptions.site },
    features: { ...defaultOptions.features, ...userOptions.features },
    i18n: { ...defaultOptions.i18n, ...userOptions.i18n },
  };

  // Add global data
  eleventyConfig.addGlobalData("techdocOptions", options);
  eleventyConfig.addGlobalData("supportedLanguages", options.i18n.languages);
  eleventyConfig.addGlobalData("defaultLanguage", options.i18n.defaultLanguage);

  // Configure markdown
  configureMarkdown(eleventyConfig);

  // Register bundled plugins FIRST so the theme's own filters override any
  // colliding plugin filter. eleventy-plugin-rss registers a strict
  // dateToRfc3339 (calls dateObj.toISOString() directly, throwing on non-Date
  // input); registering the theme's lenient new Date(...) version afterwards
  // wins the name and keeps feed/date rendering robust.
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(rss);
  eleventyConfig.addPlugin(navigation);

  // Register filters (overrides rss's dateToRfc3339 with the theme's version)
  registerFilters(eleventyConfig, options);

  // Register collections
  registerCollections(eleventyConfig, options);

  // Register shortcodes
  registerShortcodes(eleventyConfig);

  // Register virtual templates (layouts)
  registerVirtualTemplates(eleventyConfig, options);

  // Add passthrough copy for theme assets (structural CSS/JS)
  const assetsDir = join(__dirname, "..", "assets");
  eleventyConfig.addPassthroughCopy({ [assetsDir]: "techdoc" });
}

export { defaultOptions };
