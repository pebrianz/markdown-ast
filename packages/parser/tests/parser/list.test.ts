import { describe, it, expect } from "vitest"
import dedent from "dedent"

import { tokenize, parse } from "../../build/debug.js"
import { NodeKinds, NodeTypes, type Node } from "../../assembly/parser"

describe("list", async () => {
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
          textContent: 'first item',
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
          textContent: 'second item',
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
        textContent: 'nested list',
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
          textContent: 'list',
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
})
