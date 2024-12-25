import defaultTypescriptConfig from "eslint-config-love";

export default [
  {
    ...defaultTypescriptConfig,
    files: ["**/*.[j,t]s"],
    ignores: ["output/**"],
    rules: {
      "no-inner-declarations": "off", // I like inner declarations. Deal with it.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
