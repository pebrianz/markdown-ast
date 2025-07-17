import { describe, it, expect } from "vitest"
import dedent from "dedent"
import { Lexer, BlockToken, TokenTypes, InlineToken } from "../src"

describe("lexer", async () => {
  it("should tokenize heading and paragraph", () => {
    const src = dedent`
      # heading1
      this is a paragraph
    `

    const lexer = new Lexer(src)
    const tokens = lexer.lex()

    console.dir(tokens, { depth: null })

    const heading = new BlockToken({
      type: TokenTypes.Heading,
      value: "#",
      line: 1,
      column: 1,
      spaces: "",
      children: [
        new InlineToken({
          type: TokenTypes.Text,
          value: " heading1",
          line: 1,
          column: 2
        })
      ]
    })

    const paragraph = new BlockToken({
      type: TokenTypes.Paragraph,
      value: "",
      line: 2, column: 1, spaces: "",
      children: [
        new InlineToken({
          type: TokenTypes.Text,
          value: "this is a paragraph",
          line: 2,
          column: 1
        })
      ]
    })

    const expectedResult = [heading, paragraph]
    expect(tokens).toEqual(expectedResult)
  })

  it("should tokenize bold", () => {
    const src = "this is **bold**"

    const lexer = new Lexer(src)
    const tokens = lexer.lex()

    const boldMark = "**"

    const openMark = new InlineToken({
      type: TokenTypes.Bold,
      value: boldMark,
      line: 1,
      column: 9
    })
    const textToken = new InlineToken({
      type: TokenTypes.Text,
      value: "bold",
      line: 1, column: openMark.column + openMark.value.length
    })
    const closeMark = new InlineToken({
      type: TokenTypes.Bold,
      value: boldMark,
      line: 1,
      column: textToken.column + textToken.value.length
    })

    const expectedResult = [openMark, textToken, closeMark]

    const [, ...result] = tokens[0].children
    expect(result).toEqual(expectedResult)
  })

  it("should tokenize italic", () => {
    const src = "this is *italic*"

    const lexer = new Lexer(src)
    const tokens = lexer.lex()

    const mark = "*"

    const openMark = new InlineToken({
      type: TokenTypes.Italic,
      value: mark,
      line: 1,
      column: 9
    })
    const textToken = new InlineToken({
      type: TokenTypes.Text,
      value: "italic",
      line: 1, column: openMark.column + openMark.value.length
    })
    const closeMark = new InlineToken({
      type: TokenTypes.Italic,
      value: mark,
      line: 1,
      column: textToken.column + textToken.value.length
    })

    const expectedResult = [openMark, textToken, closeMark]

    const [, ...result] = tokens[0].children
    expect(result).toEqual(expectedResult)
  })

  it("should tokenize code", () => {
    const src = "this is `inlinecode`"

    const lexer = new Lexer(src)
    const tokens = lexer.lex()

    const mark = "`"

    const openMark = new InlineToken({
      type: TokenTypes.Code,
      value: mark,
      line: 1,
      column: 9
    })
    const textToken = new InlineToken({
      type: TokenTypes.Text,
      value: "inlinecode",
      line: 1, column: openMark.column + openMark.value.length
    })
    const closeMark = new InlineToken({
      type: TokenTypes.Code,
      value: mark,
      line: 1,
      column: textToken.column + textToken.value.length
    })

    const expectedResult = [openMark, textToken, closeMark]

    const [, ...result] = tokens[0].children
    expect(result).toEqual(expectedResult)
  })

  it("should tokenize table row and pipe", () => {
    const src = dedent`
      |----|----|
    `
    const lexer = new Lexer(src)
    const tokens = lexer.lex()

    const markPipe = "|"

    const tableRow = new BlockToken({
      type: TokenTypes.TableRow,
      value: '',
      line: 1,
      column: 1,
      spaces: '',
      children: [
        new InlineToken({
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 1
        }),
        new InlineToken({
          type: TokenTypes.Text,
          value: "----",
          line: 1,
          column: 2
        }),
        new InlineToken({
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 6
        }),
        new InlineToken({
          type: TokenTypes.Text,
          value: "----",
          line: 1,
          column: 7
        }),
        new InlineToken({
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 11
        }),
      ]
    })

    console.dir(tokens, { depth: null })

    expect(tokens[0]).toEqual(tableRow)
  })

  // it("should tokenize heading", () => {
  //   const src = `
  //     # heading1
  //     this is a paragraph

  //     ## heading2
  //     ########## p\`a\`ragr**apa**aa
  //     > this is a blockquotes.
  //   `
  //   const lexer = new Lexer(src)
  //   const tokens = lexer.lex()

  //   const expectedResult = new BlockToken(TokenTypes.Heading, "#", "     ")
  //   expect(tokens[1]).toEqual(expectedResult)
  // })
})
