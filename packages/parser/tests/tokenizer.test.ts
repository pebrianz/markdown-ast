import { describe, it, expect } from "vitest"
import dedent from "dedent"

import { tokenize, TokenKinds, TokenTypes } from "../build/debug.js"
import type { Token } from "../assembly/token"

describe("lexer", async () => {
  it("should tokenize heading, paragraph and text", () => {
    const src = dedent`
      # heading1
      this is a paragraph
    `

    const tokens = tokenize(src)

    const expectedHeading: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.Heading,
      value: "# ",
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "heading1",
          line: 1,
          column: 3,
          spacesLength: 0,
          children: []
        }
      ]
    }
    const expectedParagraph: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.Paragraph,
      value: "",
      line: 2,
      column: 1,
      spacesLength: 0,
      children: [
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "this is a paragraph",
          line: 2,
          column: 1,
          spacesLength: 0,
          children: []
        }
      ]
    }
    const expectedResult = [expectedHeading, expectedParagraph]
    expect(tokens).toEqual(expectedResult)
  })

  it("should tokenize blockquotes", () => {
    const src = dedent`
      > this is blockquotes
    `

    const tokens = tokenize(src)

    const expectedBlockquotes: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.Blockquotes,
      value: "> ",
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "this is blockquotes",
          line: 1,
          column: 3,
          spacesLength: 0,
          children: []
        }
      ]
    }

    expect(tokens).toEqual([expectedBlockquotes])
  })


  it.each([
    ["single asterisk", "*"],
    ["double asterisk", "**"],
    ["triple asterisk", "***"],
  ])("should tokenize %s `%s`", (name, mark) => {
    const src = `should tokenize ${mark + name + mark}`

    const tokens = tokenize(src)
    const [text, mark1, text2, mark2] = tokens[0].children

    const expectedMark: Token = {
      kind: TokenKinds.Inline,
      type: TokenTypes.Asterisk,
      value: mark,
      line: 1,
      column: text.column + text.value.length,
      spacesLength: 0,
      children: []
    }
    const expectedText: Token = {
      kind: TokenKinds.Inline,
      type: TokenTypes.Text,
      value: name,
      line: 1,
      column: expectedMark.column + expectedMark.value.length,
      spacesLength: 0,
      children: []
    }
    const expectedResult: Token[] = [
      expectedMark,
      expectedText,
      { ...expectedMark, column: expectedText.column + expectedText.value.length }
    ]
    expect([mark1, text2, mark2]).toEqual(expectedResult)
  })

  it.each([
    ["single underscore", "_"],
    ["double underscore", "__"],
    ["triple underscore", "___"]
  ])("should tokenize %s `%s`", (name, mark) => {
    const src = `should tokenize ${mark + name + mark}`

    const tokens = tokenize(src)
    const [text, mark1, text2, mark2] = tokens[0].children

    const expectedMark: Token = {
      kind: TokenKinds.Inline,
      type: TokenTypes.Underscore,
      value: mark,
      line: 1,
      column: text.column + text.value.length,
      spacesLength: 0,
      children: []
    }

    const expectedText: Token = {
      kind: TokenKinds.Inline,
      type: TokenTypes.Text,
      value: name,
      line: 1,
      column: expectedMark.column + expectedMark.value.length,
      spacesLength: 0,
      children: []
    }

    const expectedResult: Token[] = [
      expectedMark,
      expectedText,
      { ...expectedMark, column: expectedText.column + expectedText.value.length }
    ]
    expect([mark1, text2, mark2]).toEqual(expectedResult)
  })

  it("should tokenize backtick", () => {
    const src = "this is `backtick`"

    const tokens = tokenize(src)
    const [text, mark1, text2, mark2] = tokens[0].children

    const expectedMark: Token = {
      kind: TokenKinds.Inline,
      type: TokenTypes.Backtick,
      value: "`",
      line: 1,
      column: text.column + text.value.length,
      spacesLength: 0,
      children: []
    }
    const expectedText: Token = {
      kind: TokenKinds.Inline,
      type: TokenTypes.Text,
      value: "backtick",
      line: 1,
      column: expectedMark.column + expectedMark.value.length,
      spacesLength: 0,
      children: []
    }
    const expectedResult: Token[] = [
      expectedMark,
      expectedText,
      { ...expectedMark, column: expectedText.column + expectedText.value.length }
    ]
    expect([mark1, text2, mark2]).toEqual(expectedResult)
  })

  it("should tokenize table row and pipe", () => {
    const src = dedent`
      |----|----|
    `

    const tokens = tokenize(src)
    const markPipe = "|"

    const tableRow: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.TableRow,
      value: '',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 1,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "----",
          line: 1,
          column: 2,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 6,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "----",
          line: 1,
          column: 7,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 11,
          spacesLength: 0,
          children: []
        }
      ]
    }

    expect(tokens).toContainEqual(tableRow)
  })

  it("should tokenize unordered list", () => {
    const src = dedent`
      - first
      - second
    `

    const tokens = tokenize(src)

    const firstOrderedList: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.UnorderedList,
      value: "- ",
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [{
        kind: TokenKinds.Inline,
        type: TokenTypes.Text,
        value: "first",
        line: 1,
        column: 3,
        spacesLength: 0,
        children: []
      }]
    }
    const secondOrderedList: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.UnorderedList,
      value: "- ",
      line: 2,
      column: 1,
      spacesLength: 0,
      children: [{
        kind: TokenKinds.Inline,
        type: TokenTypes.Text,
        value: "second",
        line: 2,
        column: 3,
        spacesLength: 0,
        children: []
      }]
    }
    expect(tokens).toEqual([firstOrderedList, secondOrderedList])
  })

  it("should tokenize ordered list", () => {
    const src = dedent`
      1. first
      2. second
    `

    const tokens = tokenize(src)

    const firstOrderedList: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.OrderedList,
      value: "1. ",
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [{
        kind: TokenKinds.Inline,
        type: TokenTypes.Text,
        value: "first",
        line: 1,
        column: 4,
        spacesLength: 0,
        children: []
      }]
    }
    const secondOrderedList: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.OrderedList,
      value: "2. ",
      line: 2,
      column: 1,
      spacesLength: 0,
      children: [{
        kind: TokenKinds.Inline,
        type: TokenTypes.Text,
        value: "second",
        line: 2,
        column: 4,
        spacesLength: 0,
        children: []
      }]
    }
    expect(tokens).toEqual([firstOrderedList, secondOrderedList])
  })

  it("should tokenize horizontal rule", () => {
    const src = dedent`
      ------
    `

    const tokens = tokenize(src)

    const expectedResult: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.HorizontalRule,
      value: '------',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: []
    }
    expect(tokens).toEqual([expectedResult])
  })

  it("should tokenize link", () => {
    const src = dedent`
      [markdown-ast](https://github.com/pebrianz/markdown-ast)
    `

    const tokens = tokenize(src)

    const ecpectedResult: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.Paragraph,
      value: "",
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.OpenBracket,
          value: "[",
          line: 1,
          column: 1,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "markdown-ast",
          line: 1,
          column: 2,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.CloseBracket,
          value: "]",
          line: 1,
          column: 14,
          spacesLength: 0,
          children: []
        },
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.LinkURL,
          value: "(https://github.com/pebrianz/markdown-ast)",
          line: 1,
          column: 15,
          spacesLength: 0,
          children: []
        }
      ]
    }
    expect(tokens).toEqual([ecpectedResult])
  })

  it("should tokenize escape character", () => {
    const src = dedent`
      \# \*paragraph\*
    `

    const tokens = tokenize(src)

    const expectedResult: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.Paragraph,
      value: "",
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          kind: TokenKinds.Inline,
          type: TokenTypes.Text,
          value: "# *paragraph*",
          line: 1,
          column: 1,
          spacesLength: 0,
          children: []
        }
      ]
    }
    expect(tokens).toContainEqual(expectedResult)
  })
})
