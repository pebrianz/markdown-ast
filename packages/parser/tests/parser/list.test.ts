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
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Block,
            type: NodeTypes.Paragraph,
            textContent: "first item",
            attrs: [],
            childNodes: [{
              kind: NodeKinds.Inline,
              type: NodeTypes.Text,
              textContent: "first item",
              attrs: [],
              childNodes: []
            }]
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
            kind: NodeKinds.Block,
            type: NodeTypes.Paragraph,
            textContent: "second item",
            attrs: [],
            childNodes: [{
              kind: NodeKinds.Inline,
              type: NodeTypes.Text,
              textContent: "second item",
              attrs: [],
              childNodes: []
            }]
          }]
        }
      ]
    }
    expect(ast.childNodes).toEqual([unorderedList, orderedList])
  })

  it("should parse nested list", () => {
    const src = dedent`
      - list
        1. nested list
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

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
            kind: NodeKinds.Block,
            type: NodeTypes.Paragraph,
            textContent: "list",
            attrs: [],
            childNodes: [{
              kind: NodeKinds.Inline,
              type: NodeTypes.Text,
              textContent: "list",
              attrs: [],
              childNodes: []
            }]
          },
          {
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
                kind: NodeKinds.Block,
                type: NodeTypes.Paragraph,
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
            }]
          }
          ]
        },
      ]
    }
    expect(ast.childNodes).toEqual([list])
  })

  it("should parse block inside list", () => {
    const src = dedent`
      - first item of list
        
        this is paragraph inside first item
         
        > this is blockquotes
         
      - second item of list
    `

    const tokens = tokenize(src)
    const ast = parse(tokens)

    const expectedList: Node = {
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
          childNodes: [
            {
              kind: NodeKinds.Block,
              type: NodeTypes.Paragraph,
              textContent: "first item of list",
              attrs: [],
              childNodes: [{
                kind: NodeKinds.Inline,
                type: NodeTypes.Text,
                textContent: 'first item of list',
                attrs: [],
                childNodes: []
              }]
            },
            {
              kind: NodeKinds.Block,
              type: NodeTypes.Paragraph,
              textContent: "this is paragraph inside first item",
              attrs: [],
              childNodes: [{
                kind: NodeKinds.Inline,
                type: NodeTypes.Text,
                textContent: 'this is paragraph inside first item',
                attrs: [],
                childNodes: []
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
                textContent: "this is blockquotes",
                attrs: [],
                childNodes: [{
                  kind: NodeKinds.Inline,
                  type: NodeTypes.Text,
                  textContent: "this is blockquotes",
                  attrs: [],
                  childNodes: []
                }]
              }]
            }
          ]
        },
        {
          kind: NodeKinds.Block,
          type: NodeTypes.ListItem,
          textContent: '',
          attrs: [],
          childNodes: [{
            kind: NodeKinds.Block,
            type: NodeTypes.Paragraph,
            textContent: "second item of list",
            attrs: [],
            childNodes: [{
              kind: NodeKinds.Inline,
              type: NodeTypes.Text,
              textContent: "second item of list",
              attrs: [],
              childNodes: []
            }]
          }]
        }
      ]
    }
    expect(ast.childNodes).toEqual([expectedList])
  })
})
