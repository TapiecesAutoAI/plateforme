import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "node_modules/**",
  ]),

  {
    files: [
      "engine/testing/**/*.ts",
      "engine/parts/PartRecommendationEngineV2.ts",
      "knowledge/**/*.json",
    ],

    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
    },
  },

  {
    files: [
      "app/**/*.tsx",
      "components/**/*.tsx",
      "engine/**/*.ts",
      "lib/**/*.ts",
    ],

    ignores: [
      "engine/testing/**/*.ts",
      "engine/parts/PartRecommendationEngineV2.ts",
    ],

    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
]);
