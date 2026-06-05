/**
 * techdoc markdown configuration
 * Sets up markdown-it with anchor plugin for header IDs
 */

import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

/**
 * Configure markdown library
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 */
export function configureMarkdown(eleventyConfig) {
  const mdOptions = {
    html: true,
    breaks: false,
    linkify: true,
  };

  const mdAnchorOptions = {
    permalink: markdownItAnchor.permalink.headerLink(),
    slugify: (s) =>
      s
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, ""),
    level: [1, 2, 3, 4],
  };

  const md = markdownIt(mdOptions).use(markdownItAnchor, mdAnchorOptions);
  eleventyConfig.setLibrary("md", md);
}
