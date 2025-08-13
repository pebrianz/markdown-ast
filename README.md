# 📚 `markdown-ast`
<!--
[![NPM Version](https://img.shields.io/npm/v/markdown-ast-parser?color=blue\&label=version)](https://www.npmjs.com/package/markdown-ast-parser)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/markdown-ast/ci.yml?branch=main\&label=build)](https://github.com/your-username/markdown-ast/actions)
[![License](https://img.shields.io/github/license/your-username/markdown-ast?color=green)](./LICENSE)
[![Coverage Status](https://img.shields.io/codecov/c/github/your-username/markdown-ast?label=coverage)](https://codecov.io/gh/your-username/markdown-ast)
-->

> **Markdown AST library** — high-performance parser written in **AssemblyScript**.

---

## ✨ Features

* ⚡ **AssemblyScript Core** — Fast & WebAssembly-compatible parsing.
* 📝 **Basic Markdown Support** — Covers common formatting needs (see list below).

---

## ✅ Supported Markdown Syntax

| Category               | Syntax                            | Example                           |
| ---------------------- | --------------------------------- | --------------------------------- |
| **Headings**           | `#`, `##`, `###` … up to `######` | `## Heading 2`                    |
| **Bold / Italic**      | `**bold**`, `*italic*`            | **bold**, *italic*                |
| **Blockquotes**        | `> quote`                         | > This is a quote                 |
| **Lists**              | `- item` / `1. item`              | - Unordered <br> 1. Ordered       |
| **Inline Code**        | `` `code` ``                      | `inline code`                     |
| **Fenced Code Blocks** | ` ```lang … ``` `                 | \`\`\`js <br>console.log("Hello") |
| **Horizontal Rules**   | `---` / `***` / `___`             | ---                               |
| **Links**              | `[text](url)`                     | [example](https://github.com/pebrianz)    |
| **Images**             | `![alt](src)`                     | ![img](image.jpg)                 |

---

## 🛣 Roadmap (Upcoming)

* 🌐 **AST → HTML Transformation**
* 🎨 **Syntax Highlighting** for fenced code blocks
* 🔢 **LaTeX Support** inside Markdown content

---

## 📦 Installation

```bash
npm install @markdown-ast/parser
```

---

## 🚀 Usage Example

```typescript
import { parse } from '@markdown-ast/parser';

const markdown = `
# Welcome

This is **bold**, *italic*, a [link](https://example.com), and some \`inline code\`.

\`\`\`ts
console.log("Hello, AST!");
\`\`\`
`;

const ast = parse(markdown);
console.dir(ast, { depth:null });
```

---

## 📂 Project Structure

```
markdown-ast/
├── packages/
│   └── parser/            # Core AssemblyScript Markdown parser
│   ├── transform/         # (Planned) AST → HTML transformer
└── package.json           # Monorepo workspaces configuration
```

---

## 🤝 Contributing

1. **Fork** the repo
2. Create your branch:

   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:

   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push** and open a Pull Request

---

## 📜 License

Licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

## 💬 Support

* 📌 Issues: [GitHub Issues](https://github.com/pebrianz/markdown-ast/issues)
* 💡 Discussions: [GitHub Discussions](https://github.com/pebrianz/markdown-ast/discussions)

