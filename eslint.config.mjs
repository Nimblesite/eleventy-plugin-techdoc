// agent-pmo:74cf183
// ESLint flat config for a plain-JS (ESM) Eleventy plugin + browser theme scripts.
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    // Node-side plugin + CLI source (ES modules).
    files: ["lib/**/*.js", "bin/**/*.js", "index.js", "*.config.js", "*.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      // `== null` / `!= null` is the idiomatic null-and-undefined check; keep
      // strict equality everywhere else.
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // This is a build-time plugin + interactive CLI: console.* is intentional user I/O.
      "no-console": "off",
    },
  },
  {
    // Browser-side theme scripts shipped to the consuming site (ES modules,
    // loaded via <script type="module">).
    files: ["assets/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      // `== null` / `!= null` is the idiomatic null-and-undefined check; keep
      // strict equality everywhere else.
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "sample_website/",
      "**/_site/",
      "playwright-report/",
      "test-results/",
      ".deslop-cache/",
    ],
  },
];
