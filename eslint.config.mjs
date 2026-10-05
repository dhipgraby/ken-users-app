import next from "eslint-config-next/core-web-vitals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import query from "@tanstack/eslint-plugin-query";
import importPlugin from "eslint-plugin-import";

// Preserve pre-migration hook policy; React Compiler adoption is a separate task.
const legacyHooks = new Set(["react-hooks/rules-of-hooks", "react-hooks/exhaustive-deps"]);
const nextPolicy = next.map(config => ({
  ...config,
  rules: Object.fromEntries(Object.entries(config.rules ?? {}).filter(
    ([name]) => !name.startsWith("react-hooks/") || legacyHooks.has(name)
  ))
}));

const config = [
  // Legacy --ext .ts,.tsx,.js,.jsx excluded CJS regression harnesses.
  // They remain exercised by test:auth and test:http, not application lint rules.
  { ignores: [".next/**", "node_modules/**", "odd/**", "openspec/**", "next-env.d.ts", "tests/**/*.cjs"] },
  ...nextPolicy,
  js.configs.recommended,
  ...ts.configs.recommended,
  ...query.configs["flat/recommended"],
  {
    plugins: { import: importPlugin },
    rules: {
      "@next/next/no-sync-scripts": "off",
      "react/no-unescaped-entities": "off",
      "comma-dangle": ["error", "never"],
      "max-len": ["error", 800],
      "one-var": 0,
      "semi": ["error", "always"],
      "eqeqeq": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unused-vars": "off",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "block-spacing": "error",
      "brace-style": "error",
      "comma-spacing": "error",
      "comma-style": "error",
      "computed-property-spacing": "error",
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "keyword-spacing": "error",
      "no-multiple-empty-lines": "error",
      "no-trailing-spaces": "error",
      "quotes": ["error", "double"],
      "space-infix-ops": "error",
      "space-before-blocks": "error",
      "object-curly-spacing": ["error", "always"],
      "import/extensions": ["error", "ignorePackages", {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }],
      "@typescript-eslint/triple-slash-reference": "off"
    },
    settings: {
      "import/resolver": {
        "node": { "extensions": [".js", ".jsx", ".ts", ".tsx"] }
      }
    }
  }
];

export default config;
