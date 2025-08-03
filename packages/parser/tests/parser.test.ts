import { describe, it, expect } from "vitest"
import dedent from "dedent"

import { tokenize, parse } from "../build/debug.js"
import { NodeKinds, NodeTypes, type Node } from "../assembly/parser"

describe("parser", async () => {
  it("should parse heading, paragraph and text", () => {
    const src = dedent`
      # heading
      this is paragraph
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedHeading: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Heading,
      textContent: "heading",
      childNodes: [
        {
          kind: NodeKinds.Inline,
          type: NodeTypes.Text,
          textContent: "heading",
          childNodes: [],
          attrs: []
        }
      ],
      attrs: []
    }
    const expectedParagraph: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Paragraph,
      textContent: "this is paragraph",
      childNodes: [
        {
          kind: NodeKinds.Inline,
          type: NodeTypes.Text,
          textContent: "this is paragraph",
          childNodes: [],
          attrs: []
        }
      ],
      attrs: []
    }
    expect(ast.childNodes).toEqual([expectedHeading, expectedParagraph])
  })

  it("should parse heading id", () => {
    const src = "# heading {#custom-id}"

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedResult: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Heading,
      textContent: 'heading ',
      attrs: [["#custom-id"]],
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Text,
        textContent: "heading ",
        childNodes: [],
        attrs: []
      }]
    }
    expect(ast.childNodes).toEqual([expectedResult])
  })

  it.each([["*"]])("should parse bold italic", (mark) => {
    const src = `${mark}italic${mark} ${mark + mark}bold${mark + mark} ${mark + mark + mark}italicbold${mark + mark + mark}`

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedItalic: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.Italic,
      textContent: "italic",
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Text,
        textContent: "italic",
        childNodes: [],
        attrs: []
      }],
      attrs: []
    }
    const expectedBold: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.Bold,
      textContent: "bold",
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Text,
        textContent: "bold",
        childNodes: [],
        attrs: []
      }],
      attrs: []
    }
    const expectedItalicBold: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.BlockItalic,
      textContent: "italicbold",
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Text,
        textContent: "italicbold",
        childNodes: [],
        attrs: []
      }],
      attrs: []
    }

    const space: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.Text,
      textContent: " ",
      childNodes: [],
      attrs: []
    }

    const expectedResult = [
      expectedItalic,
      space,
      expectedBold,
      space,
      expectedItalicBold
    ]
    expect(ast.childNodes[0].childNodes).toEqual(expectedResult)
  })

  it("should parse code", () => {
    const src = "this is `code **hello** world`"

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedCode: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.Code,
      textContent: 'code **hello** world',
      childNodes: [],
      attrs: []
    }
    expect(ast.childNodes[0].childNodes).toContainEqual(expectedCode)
  })

  it("should parse table", () => {
    const src = dedent`
      | header1 | header2 | header3 |
      |---|:---:|---:
      | cellA | cellB | cellC |
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedHeader: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.TableHeader,
      textContent: '',
      attrs: [],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.TableCell,
          textContent: ' header1 ',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: " header1 ",
            attrs: [],
            childNodes: []
          }]
        },
        {
          kind: NodeKinds.Block,
          type: NodeTypes.TableCell,
          textContent: ' header2 ',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: " header2 ",
            attrs: [],
            childNodes: []
          }]
        },
        {
          kind: NodeKinds.Block,
          type: NodeTypes.TableCell,
          textContent: ' header3 ',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: " header3 ",
            attrs: [],
            childNodes: []
          }]
        }
      ]
    }
    const expectedRow: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.TableRow,
      textContent: '',
      attrs: [],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.TableCell,
          textContent: ' cellA ',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: " cellA ",
            attrs: [],
            childNodes: []
          }]
        },
        {
          kind: NodeKinds.Block,
          type: NodeTypes.TableCell,
          textContent: ' cellB ',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: " cellB ",
            attrs: [],
            childNodes: []
          }]
        },
        {
          kind: NodeKinds.Block,
          type: NodeTypes.TableCell,
          textContent: ' cellC ',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: " cellC ",
            attrs: [],
            childNodes: []
          }]
        }
      ]
    }
    const expectedTable: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Table,
      textContent: '',
      attrs: [["left", "center", "right"]],
      childNodes: [expectedHeader, expectedRow]
    }
    expect(ast.childNodes).toEqual([expectedTable])
  })

  it("should parse horizontal rule", () => {
    const src = dedent`
      ---
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedResult: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.HorizontalRule,
      textContent: '',
      attrs: [],
      childNodes: []
    }
    expect(ast.childNodes).toEqual([expectedResult])
  })

  it("should parse link", () => {
    const src = dedent`
      [markdown-ast](https://github.com/pebrianz/markdown-ast "Markdown Parser")
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const ecpectedResult: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Paragraph,
      textContent: 'markdown-ast',
      attrs: [],
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Link,
        textContent: 'markdown-ast',
        attrs: [["https://github.com/pebrianz/markdown-ast", "Markdown Parser"]],
        childNodes: [{
          kind: NodeKinds.Inline,
          type: NodeTypes.Text,
          textContent: "markdown-ast",
          attrs: [],
          childNodes: []
        }]
      }]
    }
    expect(ast.childNodes).toEqual([ecpectedResult])
  })
})
