import js from "@eslint/js";
import ts from "typescript-eslint";
import security from "eslint-plugin-security";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  security.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "vite.config.ts", "src/vite-env.d.ts"]
  },
  {
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-useless-escape": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "security/detect-object-injection": "off"
    }
  }
);
