import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

/** @type {import("typescript-eslint").ConfigArray} */
const config = tseslint.config(
  {
    ignores: ['**/build'],
  },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/max-len': ['error', {
        code: 80, tabWidth: 2, ignoreComments: true,
      }],
      '@stylistic/indent': ['error', 2],
      '@stylistic/key-spacing': ['error'],
      '@stylistic/brace-style': ['error', 'allman'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error'],
      '@stylistic/lines-around-comment': ['error'],
      '@stylistic/lines-between-class-members': ['error'],
      '@stylistic/member-delimiter-style': ['error'],
      '@stylistic/no-extra-semi': ['error'],
      '@stylistic/object-curly-spacing': ['error'],
      '@stylistic/padding-line-between-statements': ['error'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error'],
      '@stylistic/space-before-function-paren': ['error'],
      '@stylistic/space-infix-ops': ['error'],
      '@stylistic/type-annotation-spacing': ['error'],
      '@stylistic/type-generic-spacing': ['error'],
    },
  },
);

export default config;
