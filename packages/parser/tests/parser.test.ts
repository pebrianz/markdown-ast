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
      textContent: "",
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
      textContent: "",
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

  it.each([["*"], ["_"]])("should parse bold italic", (mark) => {
    const src = dedent`
      ${mark}italic${mark} ${mark + mark}bold${mark + mark} ${mark + mark + mark}italicbold${mark + mark + mark} 
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedItalic: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.Italic,
      textContent: "",
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
      textContent: "",
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
      textContent: "",
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

  it("should parse blockquotes and nested blockquotes", () => {
    const src = dedent`
      > this is blockquotes
      >> this is nested blockquotes
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const nestedBlockquotes: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Blockquotes,
      textContent: '',
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Text,
        textContent: "this is nested blockquotes",
        childNodes: [],
        attrs: []
      }],
      attrs: []
    }

    const expectedBlockquotes: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Blockquotes,
      textContent: "",
      childNodes: [
        {
          kind: NodeKinds.Inline,
          type: NodeTypes.Text,
          textContent: "this is blockquotes",
          childNodes: [],
          attrs: []
        },
        nestedBlockquotes
      ],
      attrs: []
    }
    expect(ast.childNodes).toEqual([expectedBlockquotes])
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
          textContent: '',
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
          textContent: '',
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
          textContent: '',
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
          textContent: '',
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
          textContent: '',
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
          textContent: '',
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

  it("should parse list", () => {
    const src = dedent`
      - first item
      1. second item
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const unorderedList: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.List,
      textContent: '',
      attrs: [["unordered", "0"]],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.ListItem,
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: "first item",
            attrs: [],
            childNodes: []
          }]
        }
      ]
    }
    const orderedList: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.List,
      textContent: '',
      attrs: [["ordered", "1"]],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.ListItem,
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: "second item",
            attrs: [],
            childNodes: []
          }]
        }
      ]
    }
    expect(ast.childNodes).toEqual([unorderedList, orderedList])
  })

  it("should parse nested list", () => {
    const src = `
      - list
         1. nested list
    `

    const tokens = tokenize(src.trim())
    const ast = parse(tokens)

    const nestedList: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.List,
      textContent: '',
      attrs: [["ordered", "1"]],
      childNodes: [{
        kind: NodeKinds.Block,
        type: NodeTypes.ListItem,
        textContent: '',
        attrs: [],
        childNodes: [{
          kind: NodeKinds.Inline,
          type: NodeTypes.Text,
          textContent: 'nested list',
          attrs: [],
          childNodes: []
        }]
      }]
    }
    const list: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.List,
      textContent: '',
      attrs: [["unordered", "0"]],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.ListItem,
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: 'list',
            attrs: [],
            childNodes: []
          }]
        },
        nestedList
      ]
    }
    expect(ast.childNodes).toEqual([list])
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
      textContent: '',
      attrs: [],
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Link,
        textContent: '',
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
  it("should parse image", () => {
    const src = dedent`
      ![markdown-ast](https://github.com/pebrianz/markdown-ast "Markdown Parser")
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const ecpectedResult: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Paragraph,
      textContent: '',
      attrs: [],
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Image,
        textContent: '',
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

  it("should parse link image", () => {
    const src = dedent`
      [![markdown-ast](linkImage)](https://github.com/pebrianz/markdown-ast)
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const ecpectedResult: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Paragraph,
      textContent: '',
      attrs: [],
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Link,
        textContent: '',
        attrs: [["https://github.com/pebrianz/markdown-ast"]],
        childNodes: [{
          kind: NodeKinds.Inline,
          type: NodeTypes.Image,
          textContent: "",
          attrs: [["linkImage"]],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: "markdown-ast",
            attrs: [],
            childNodes: []
          }]
        }]
      }]
    }
    expect(ast.childNodes).toEqual([ecpectedResult])
  })
})
