import { describe, it, expect } from "vitest"
import dedent from "dedent"

import { tokenize, parse } from "../../build/debug.js"
import { NodeKinds, NodeTypes, type Node } from "../../assembly/parser"

describe("blockquotes", async () => {
  it("should parse blockquotes", () => {
    const src = "> this is blockquotes"

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedResult: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Blockquotes,
      textContent: '',
      childNodes: [{
        kind: NodeKinds.Block,
        type: NodeTypes.Paragraph,
        textContent: "",
        childNodes: [{
          kind: NodeKinds.Inline,
          type: NodeTypes.Text,
          textContent: "this is blockquotes",
          childNodes: [],
          attrs: []
        }],
        attrs: []
      }],
      attrs: []
    }
    expect(ast.childNodes).toEqual([expectedResult])
  })

  it("should parse blockquotes with multiple paragraph", () => {
    const src = dedent`
      > this is first paragraph
      >
      > this is second paragraph
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)
    console.dir(ast.childNodes, { depth: null })

    const textNode: Node = {
      kind: NodeKinds.Inline,
      type: NodeTypes.Text,
      textContent: "this is first paragraph",
      attrs: [],
      childNodes: []
    }

    const firstParagraph: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Paragraph,
      textContent: '',
      attrs: [],
      childNodes: [textNode]
    }
    const secondParagraph: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Paragraph,
      textContent: '',
      attrs: [],
      childNodes: [{ ...textNode, textContent: "this is second paragraph" }]
    }
    expect(ast.childNodes[0].childNodes).toEqual([firstParagraph, secondParagraph])
  })

  it("should parse nested blockquotes", () => {
    const src = dedent`
      > this is blockquotes
      > > this is nested blockquotes
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedBlockquotes: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Blockquotes,
      textContent: "",
      attrs: [],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.Paragraph,
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Inline,
            type: NodeTypes.Text,
            textContent: "this is blockquotes",
            childNodes: [],
            attrs: []
          }]
        },
        {
          kind: NodeKinds.Block,
          type: NodeTypes.Blockquotes,
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Block,
            type: NodeTypes.Paragraph,
            textContent: '',
            attrs: [],
            childNodes: [{
              attrs: [],
              kind: NodeKinds.Inline,
              type: NodeTypes.Text,
              textContent: "this is nested blockquotes",
              childNodes: []
            }]
          }]
        }
      ]
    }
    expect(ast.childNodes).toEqual([expectedBlockquotes])
  })

  it("should parse list in blockquotes", () => {
    const src = dedent`
      > - first item
      > - second item
    `

    const tokens = tokenize(src)
    console.dir(tokens, { depth: null })
    const ast = parse(tokens)
    console.dir(ast.childNodes, { depth: null })

    const expectedBlockquotes: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.Blockquotes,
      textContent: "",
      attrs: [],
      childNodes: [
        {
          kind: NodeKinds.Block,
          type: NodeTypes.List,
          textContent: '',
          attrs: [["unordered", "0"]],
          childNodes: [
            {
              kind: NodeKinds.Block,
              type: NodeTypes.ListItem,
              textContent: "",
              attrs: [],
              childNodes: [{
                kind: NodeKinds.Inline,
                type: NodeTypes.Text,
                textContent: "first item",
                childNodes: [],
                attrs: []
              }],
            },
            {
              kind: NodeKinds.Block,
              type: NodeTypes.ListItem,
              textContent: "",
              attrs: [],
              childNodes: [{
                kind: NodeKinds.Inline,
                type: NodeTypes.Text,
                textContent: "second item",
                childNodes: [],
                attrs: []
              }],
            }
          ]
        },
      ]
    }
    expect(ast.childNodes).toEqual([expectedBlockquotes])
  })
})
