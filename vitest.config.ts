import {defineConfig} from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    alias: {
      '@markdown-ast/parser': process.env.TARGET === 'debug'
        ? path.resolve(__dirname, './packages/parser/build/debug.js')
        : path.resolve(__dirname, './packages/parser/build/release.js'),
    },
  },
});
