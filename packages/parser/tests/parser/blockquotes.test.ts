import { describe, it, expect } from "vitest"
import dedent from "dedent"

import { tokenize, parse } from "../../build/debug.js"
import { NodeKinds, NodeTypes, type Node } from "../../assembly/parser"

describe("blockquotes", async () => {
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
})
