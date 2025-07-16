import { describe, it, expect } from "vitest"
import { Lexer } from "../src"
import { Parser } from "../src/parser"
import dedent from "dedent"

describe("parser", async () => {
  it("should parse", () => {
    const src = dedent`
      # heading1
      this **is** a paragraph
    `

    const lexer = new Lexer(src.trim())
    const tokens = lexer.lex()
    // console.dir(tokens, { depth: null })

    const parser = new Parser(tokens)
    const ast = parser.parse()

    console.dir(ast, { depth: null })
  })

  it("should parse table", () => {
    const src = dedent`
      | header1 | header2 |
      |---|---|
      | cellA | cellB |

      # hello world
    `

    const lexer = new Lexer(src.trim())
    const tokens = lexer.lex()
    // console.dir(tokens, { depth: null })

    const parser = new Parser(tokens)
    const ast = parser.parse()

    console.dir(ast, { depth: null })
  })
})
