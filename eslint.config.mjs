import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Module-specific ignores
    "src/modules/**/__tests__/**",
    "src/modules/**/*.test.ts",
    "src/modules/**/*.test.tsx",
    "src/modules/**/*.spec.ts",
    "src/modules/**/*.spec.tsx",
  ]),
  {
    rules: {
      // Module-specific linting rules
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            // Prevent cross-module imports except through public APIs
            "*/modules/*/service/*",
            "*/modules/*/components/*",
            "*/modules/*/hooks/*",
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
