import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import stylisticTs from "@stylistic/eslint-plugin-ts"

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    plugins: {
      "@stylistic/ts": stylisticTs
    },
  },
  {
    rules: {
      "@typescript-eslint/no-inferrable-types": "off"
    }
  }
)
