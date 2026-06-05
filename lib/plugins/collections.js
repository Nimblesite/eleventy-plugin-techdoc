/**
 * techdoc collections - blog posts, docs, tags, categories
 * Supports multi-language sites with language-prefixed collections
 */

// Helper: extract unique tags from posts
const extractTags = (posts) => {
  const tagSet = new Set();
  posts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => {
      tag !== "post" && tag !== "posts" && tagSet.add(tag);
    });
  });
  return [...tagSet].sort();
};

// Helper: extract unique categories from posts
const extractCategories = (posts) => {
  const categorySet = new Set();
  posts.forEach((post) => post.data.category && categorySet.add(post.data.category));
  return [...categorySet].sort();
};

// Helper: group posts by tag
const groupByTag = (posts) => {
  const postsByTag = {};
  posts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => {
      tag !== "post" && tag !== "posts" && (postsByTag[tag] = postsByTag[tag] || []).push(post);
    });
  });
  Object.values(postsByTag).forEach((arr) => arr.sort((a, b) => b.date - a.date));
  return postsByTag;
};

// Helper: group posts by category
const groupByCategory = (posts) => {
  const postsByCategory = {};
  posts.forEach((post) => {
    post.data.category &&
      (postsByCategory[post.data.category] = postsByCategory[post.data.category] || []).push(post);
  });
  Object.values(postsByCategory).forEach((arr) => arr.sort((a, b) => b.date - a.date));
  return postsByCategory;
};

/**
 * Register all collections
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {object} options
 */
export function registerCollections(eleventyConfig, options) {
  const { features, i18n } = options;
  const defaultLang = i18n.defaultLanguage;
  const languages = i18n.languages;

  if (features.blog) {
    registerBlogCollections(eleventyConfig, defaultLang, languages);
  }

  if (features.docs) {
    registerDocsCollections(eleventyConfig, defaultLang, languages);
  }
}

function registerBlogCollectionsForLang(eleventyConfig, globPath, prefix) {
  const getPosts = (collectionApi) =>
    collectionApi.getFilteredByGlob(globPath).sort((a, b) => b.date - a.date);

  eleventyConfig.addCollection(`${prefix}posts`, getPosts);
  eleventyConfig.addCollection(`${prefix}tagList`, (api) => extractTags(getPosts(api)));
  eleventyConfig.addCollection(`${prefix}categoryList`, (api) => extractCategories(getPosts(api)));
  eleventyConfig.addCollection(`${prefix}postsByTag`, (api) => groupByTag(getPosts(api)));
  eleventyConfig.addCollection(`${prefix}postsByCategory`, (api) => groupByCategory(getPosts(api)));
}

function registerBlogCollections(eleventyConfig, defaultLang, languages) {
  // Default language (no prefix)
  registerBlogCollectionsForLang(eleventyConfig, "src/blog/*.md", "");

  // Non-default languages (with prefix)
  languages
    .filter((lang) => lang !== defaultLang)
    .forEach((lang) =>
      registerBlogCollectionsForLang(eleventyConfig, `src/${lang}/blog/*.md`, `${lang}`)
    );
}

function registerDocsCollections(eleventyConfig, defaultLang, languages) {
  eleventyConfig.addCollection("docs", (api) => api.getFilteredByGlob("src/docs/**/*.md"));

  languages
    .filter((lang) => lang !== defaultLang)
    .forEach((lang) => {
      eleventyConfig.addCollection(`${lang}Docs`, (api) =>
        api.getFilteredByGlob(`src/${lang}/docs/**/*.md`)
      );
    });
}
