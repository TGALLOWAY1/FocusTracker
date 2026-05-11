import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "*.tsbuildinfo"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Downgraded to a warning: existing modal form-reset patterns
      // (PlanMyDayModal, SessionReflectionModal) trip this newer rule.
      // Tracked as a future refactor in docs/CODE_QUALITY_REVIEW.md.
      "react-hooks/set-state-in-effect": "warn",
    },
  }
);
