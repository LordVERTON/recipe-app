import nextPlugin from "@next/eslint-plugin-next"
import tseslint from "typescript-eslint"

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "supabase/.temp/**",
      "public/ocr/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  nextPlugin.configs["core-web-vitals"],
]

export default config
