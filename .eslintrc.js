/* eslint-env browser */
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: [".eslintrc.js", "output/**"],
  rules: {
    "no-inner-declarations": "off", // I like inner declarations. Deal with it.
  },
};
