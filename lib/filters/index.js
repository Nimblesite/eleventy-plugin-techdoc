/**
 * techdoc filters
 */

/**
 * Register all filters
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @param {object} options
 */
export function registerFilters(eleventyConfig, options) {
  const defaultLang = options.i18n.defaultLanguage;

  // Date formatting - respects page language for i18n sites
  eleventyConfig.addFilter("dateFormat", function (dateObj, lang) {
    const locale = lang || this.ctx?.lang || defaultLang || "en";
    return new Date(dateObj).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO date for JSON-LD
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // RFC3339 date format for JSON-LD (same as ISO but explicit for schema.org)
  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return new Date(dateObj).toISOString();
  });

  // Array limit
  eleventyConfig.addFilter("limit", (arr, limit) => {
    return arr.slice(0, limit);
  });

  // Capitalize first letter
  eleventyConfig.addFilter("capitalize", (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  });

  // Slugify string
  eleventyConfig.addFilter("slugify", (str) => {
    return str
      ? str
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
      : "";
  });

  // i18n translation filter - accesses i18n data from template context.
  // Usage in templates: {{ "key.path" | t(lang) | default("Fallback") }}
  //
  // Returns `undefined` for ANY missing translation - no i18n data at all, an
  // unknown language, or an absent key. That lets the template's `default(...)`
  // supply the human-readable fallback. Returning the raw key here (the old
  // behaviour) leaked strings like "blog.tagsTitle" into pages, because a
  // truthy key string silently defeats the `default` filter.
  eleventyConfig.addFilter("t", function (key, lang) {
    const actualLang = lang || this.ctx?.lang || defaultLang;
    const langData = this.ctx?.i18n?.[actualLang] || this.ctx?.i18n?.[defaultLang];
    if (!langData) {
      return undefined;
    }
    let value = langData;
    for (const part of key.split(".")) {
      value = value?.[part];
    }
    // Only scalar leaves are renderable text. A partial path that lands on a
    // nested object (or array) must fall through to `default(...)` rather than
    // stringify as "[object Object]".
    return value != null && typeof value !== "object" ? value : undefined;
  });

  // Get alternate language URL
  eleventyConfig.addFilter("altLangUrl", (url, currentLang, targetLang) => {
    if (currentLang === "en" && targetLang !== "en") {
      return `/${targetLang}${url}`;
    } else if (currentLang !== "en" && targetLang === "en") {
      return url.replace(`/${currentLang}`, "") || "/";
    } else if (currentLang !== "en" && targetLang !== "en") {
      return url.replace(`/${currentLang}`, `/${targetLang}`);
    }
    return url;
  });

  // Extract language from URL (for filtering navigation items)
  eleventyConfig.addFilter("extractLangFromUrl", (url, defaultLanguage) => {
    if (!url) {
      return defaultLanguage;
    }
    const supportedNonDefaultLangs = options.i18n.languages.filter((l) => l !== defaultLanguage);
    for (const lang of supportedNonDefaultLangs) {
      if (url.startsWith(`/${lang}/`)) {
        return lang;
      }
    }
    return defaultLanguage;
  });

  // Convert language code to og:locale format (e.g., en -> en_US, zh -> zh_CN)
  eleventyConfig.addFilter("toOgLocale", (langCode) => {
    const localeMap = {
      en: "en_US",
      zh: "zh_CN",
      es: "es_ES",
      fr: "fr_FR",
      de: "de_DE",
      ja: "ja_JP",
      ko: "ko_KR",
      pt: "pt_BR",
      ru: "ru_RU",
      it: "it_IT",
      nl: "nl_NL",
      ar: "ar_SA",
      hi: "hi_IN",
    };
    return localeMap[langCode] || `${langCode}_${langCode.toUpperCase()}`;
  });
}
