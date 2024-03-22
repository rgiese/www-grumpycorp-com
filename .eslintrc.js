/* eslint-env browser */
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    browser: true,
  },
  ignorePatterns: [".eslintrc.js", "prettier.config.js", "dist/**"],
  rules: {
    "no-inner-declarations": "off", // I like inner declarations. Deal with it.
  },
};
