import { Token, TokenKinds, TokenTypes } from "./token"

export enum NodeKinds {
  Document = 0,
  Block = 1,
  Inline = 2
}

export enum NodeTypes {
  // Block node types
  Document = 0,
  Heading = 1,
  Paragraph = 2,
  Blockquotes = 3,
  Table = 4,
  TableRow = 5,
  TableCell = 6,
  TableHeader = 7,
  List = 8,

  // Inline node types
  Text = 50,
  Italic = 51,
  Bold = 52,
  BlockItalic = 53,
  Code = 54
}

export class Node {
  kind: NodeKinds
  type: NodeTypes
  childNodes: Node[]
  textContent: string
  attrs: string[][]
}

export class Parser {
  private currentToken: Token = new Token()
  constructor(private tokens: Token[]) {
    this.advance()
  }

  private advance(): void {
    if (this.tokens.length > 0) {
      this.currentToken = this.tokens.shift()
    }
  }

  parseInlineCode(): Node {
    let textContent = ""
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: NodeTypes.Code, textContent, childNodes: [], attrs: [] }

    let currentToken = children.shift()
    while (currentToken.type !== TokenTypes.Backtick) {
      textContent += currentToken.value
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Inline, type: NodeTypes.Code, textContent, childNodes: [], attrs: [] }
  }

  parseBlockItalic(type: TokenTypes, markLength: i32): Node {
    const childNodes: Node[] = []
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: 50 + markLength, textContent: '', childNodes, attrs: [] }

    let currentToken = children.shift()
    while (currentToken.type !== type) {
      childNodes.push(this.parseInline(currentToken))
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Inline, type: 50 + markLength, textContent: '', childNodes, attrs: [] }
  }

  private parseInline(currentInlineToken: Token): Node {
    switch (currentInlineToken.type) {
      case TokenTypes.Text:
        return { kind: NodeKinds.Inline, type: NodeTypes.Text, textContent: currentInlineToken.value, childNodes: [], attrs: [] }
      case TokenTypes.Asterisk:
        return this.parseBlockItalic(currentInlineToken.type, currentInlineToken.value.length)
      case TokenTypes.Underscore:
        return this.parseBlockItalic(currentInlineToken.type, currentInlineToken.value.length)
      case TokenTypes.Backtick:
        return this.parseInlineCode()
      case TokenTypes.Pipe:
        return { kind: NodeKinds.Inline, type: NodeTypes.Text, textContent: currentInlineToken.value, childNodes: [], attrs: [] }
    }

    throw new Error()
  }

  private parseChildren(children: Token[]): Node[] {
    const childNodes: Node[] = []
    if (children.length <= 0) return childNodes

    let currentToken: Token = children.shift()
    while (currentToken.kind === TokenKinds.Inline) {
      childNodes.push(this.parseInline(currentToken))
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return childNodes
  }

  private parseBlockquotes(childNodes: Node[]): Node {
    if (this.tokens.length > 0 && this.tokens[0].type === TokenTypes.Blockquotes) {
      // handle nested blockquotes
      if (this.tokens[0].value.length - 1 === this.currentToken.value.length) {
        this.advance()
        childNodes.push(this.parseBlock())
      }
    }

    return {
      kind: NodeKinds.Block,
      type: NodeTypes.Blockquotes,
      textContent: '',
      childNodes,
      attrs: []
    }
  }

  private parseTableCell(): Node {
    const childNodes: Node[] = []
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Block, type: NodeTypes.TableCell, textContent: '', childNodes, attrs: [] }

    let currentToken = children.shift()
    while (currentToken.type !== TokenTypes.Pipe) {
      childNodes.push(this.parseInline(currentToken))

      if (children.length <= 0) break

      const nextToken = children[0]
      if (nextToken.type === TokenTypes.Pipe) break
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Block, type: NodeTypes.TableCell, textContent: '', childNodes, attrs: [] }
  }

  private parseTableCells(): Node[] {
    const childNodes: Node[] = []
    const children = this.currentToken.children

    if (children.length <= 0) return childNodes

    let currentToken = children.shift()
    while (currentToken.type === TokenTypes.Pipe) {
      if (children.length <= 0) break

      const nextToken = children[0]
      if (nextToken.kind !== TokenKinds.Inline) break

      childNodes.push(this.parseTableCell())
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return childNodes
  }

  private parseTableRows(): Node[] {
    const childNodes: Node[] = []

    if (this.tokens.length <= 0) return childNodes
    this.advance()

    while (this.currentToken.type === TokenTypes.TableRow) {
      childNodes.push({
        kind: NodeKinds.Block,
        type: NodeTypes.TableRow,
        textContent: '',
        childNodes: this.parseTableCells(),
        attrs: []
      })
      if (this.tokens.length <= 0) break
      this.advance()
    }

    return childNodes
  }

  private parseTable(): Node {
    const align: string[] = []

    if (this.tokens.length > 0 && this.tokens[0].type === TokenTypes.TableRow) {
      if (this.tokens[0].children.length > 0) {
        let currentToken = this.tokens[0].children.shift()
        while (currentToken) {
          if (currentToken.type === TokenTypes.Text) {
            const firstchar = currentToken.value[0]
            const lastchar = currentToken.value.at(-1)
            const firstlastchar = firstchar + lastchar

            if (firstchar === "-" || firstchar === ":") {
              let bool = true
              let i = 1
              while (i < currentToken.value.length - 1) {
                if (currentToken.value[i] !== "-") bool = false
                i++
              }
              if (bool) {
                if (firstlastchar === "::") align.push("center")
                else if (firstlastchar === "-:") align.push("right")
                else if (lastchar === "-") align.push("left")
              }
            }
          }
          if (this.tokens[0].children.length <= 0) break
          currentToken = this.tokens[0].children.shift()
        }
      }
    }

    if (align.length < 1) {
      const childNodes = this.parseChildren([])
      return { kind: NodeKinds.Block, type: NodeTypes.Paragraph, textContent: '', childNodes, attrs: [] }
    }

    const header: Node = {
      kind: NodeKinds.Block,
      type: NodeTypes.TableHeader,
      textContent: '',
      childNodes: this.parseTableCells(),
      attrs: []
    }
    this.advance()
    return {
      kind: NodeKinds.Block,
      type: NodeTypes.Table,
      textContent: '',
      childNodes: [header].concat(this.parseTableRows()),
      attrs: [align]
    }
  }

  private parseBlock(): Node {
    switch (this.currentToken.type) {
      case TokenTypes.TableRow: {
        return this.parseTable()
      }

      default: {
        const childNodes: Node[] = this.parseChildren(this.currentToken.children)

        switch (this.currentToken.type) {
          case TokenTypes.Paragraph:
            return { kind: NodeKinds.Block, type: NodeTypes.Paragraph, textContent: '', childNodes, attrs: [] }
          case TokenTypes.Heading:
            return { kind: NodeKinds.Block, type: NodeTypes.Heading, textContent: '', childNodes, attrs: [] }
          case TokenTypes.Blockquotes:
            return this.parseBlockquotes(childNodes)
        }
      }
    }

    throw new Error("")
  }

  private parseDocument(): Node {
    const childNodes: Node[] = []

    while (this.currentToken.kind === TokenKinds.Block) {
      childNodes.push(this.parseBlock())
      if (this.tokens.length <= 0) break
      this.advance()
    }

    return { kind: NodeKinds.Document, type: NodeTypes.Document, textContent: '', childNodes, attrs: [] }
  }

  parse(): Node {
    return this.parseDocument()
  }
}
