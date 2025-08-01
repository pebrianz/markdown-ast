import { describe, it, expect } from "vitest"
import dedent from "dedent"

import { tokenize, parse } from "../../build/debug.js"
import { NodeKinds, NodeTypes, type Node } from "../../assembly/parser"

describe("image, link and references link", async () => {
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
