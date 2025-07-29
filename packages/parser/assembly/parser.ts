import { Token, TokenKinds, TokenTypes } from "./tokenizer/token"

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
  ListItem = 9,
  HorizontalRule = 10,

  // Inline node types
  Text = 50,
  Italic = 51,
  Bold = 52,
  BlockItalic = 53,
  Code = 54,
  Link = 55,
  Image = 56,
}

export class Node {
  kind: NodeKinds
  type: NodeTypes
  childNodes: Node[]
  textContent: string
  attrs: string[][]
}

export class Document {
  kind: NodeKinds = NodeKinds.Document
  type: NodeTypes = NodeTypes.Document
  childNodes: Node[] = []
  references: Map<string, string> = new Map<string, string>()
}

export class Parser {
  private currentToken: Token = new Token()
  private document: Document = new Document()
  constructor(private tokens: Token[]) {
    this.advance()
  }

  private advance(): void {
    if (this.tokens.length > 0) {
      this.currentToken = this.tokens.shift()
    }
  }

  parseInlineCode(): Node {
    const children = this.currentToken.children
    let textContent = ""

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
    const children = this.currentToken.children
    const childNodes: Node[] = []

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: 50 + markLength, textContent: '', childNodes, attrs: [] }

    let currentToken = children.shift()
    while (currentToken.type !== type) {
      childNodes.push(this.parseInline(currentToken))
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Inline, type: 50 + markLength, textContent: '', childNodes, attrs: [] }
  }

  private parseLink(): Node {
    const children = this.currentToken.children
    const childNodes: Node[] = []
    const attrs: string[][] = []

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: NodeTypes.Link, textContent: '', attrs: [], childNodes }

    let currentToken: Token = children.shift()
    while (currentToken.type !== TokenTypes.CloseBracket) {
      childNodes.push(this.parseInline(currentToken))
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    if (children.length > 0 && children[0].type === TokenTypes.LinkURL) {
      const url = children[0].value.slice(1, -1).split('"', 2)
      const arr: string[] = []
      arr[0] = url[0].trim()
      if (url.length > 1) arr[1] = url[1]
      attrs[0] = arr
      children.shift()
    }

    return { kind: NodeKinds.Inline, type: NodeTypes.Link, textContent: '', attrs, childNodes }
  }

  private parseImage(): Node {
    const children = this.currentToken.children
    const childNodes: Node[] = []
    const attrs: string[][] = []

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: NodeTypes.Link, textContent: '', attrs: [], childNodes }

    let currentToken: Token = children.shift()
    while (currentToken.type !== TokenTypes.CloseBracket) {
      childNodes.push(this.parseInline(currentToken))
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    if (children.length > 0 && children[0].type === TokenTypes.LinkURL) {
      const url = children[0].value.slice(1, -1).split('"', 2)
      const arr: string[] = []
      arr[0] = url[0].trim()
      if (url.length > 1) arr[1] = url[1]
      attrs[0] = arr
      children.shift()
    }

    return { kind: NodeKinds.Inline, type: NodeTypes.Image, textContent: '', attrs, childNodes }
  }
  private parseText(value: string): Node {
    return { kind: NodeKinds.Inline, type: NodeTypes.Text, textContent: value, childNodes: [], attrs: [] }
  }

  private parseInline(currentInlineToken: Token): Node {
    switch (currentInlineToken.type) {
      case TokenTypes.Text:
        return this.parseText(currentInlineToken.value)
      case TokenTypes.Asterisk:
        return this.parseBlockItalic(currentInlineToken.type, currentInlineToken.value.length)
      case TokenTypes.Backtick:
        return this.parseInlineCode()
      case TokenTypes.OpenBracket:
        return this.parseLink()
      case TokenTypes.CloseBracket:
        return this.parseText(currentInlineToken.value)
      case TokenTypes.LinkURL:
        return this.parseText(currentInlineToken.value)
      case TokenTypes.Pipe:
        return this.parseText(currentInlineToken.value)
      case TokenTypes.CustomID:
        return this.parseText(currentInlineToken.value)
      case TokenTypes.Bang:
        if (this.currentToken.children.length <= 0 || this.currentToken.children[0].type !== TokenTypes.OpenBracket) {
          return this.parseText(currentInlineToken.value)
        }
        this.currentToken.children.shift()
        return this.parseImage()
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

  private parseHeading(): Node {
    const children: Token[] = this.currentToken.children
    const childNodes: Node[] = []
    const attrs: string[][] = []

    if (children.length <= 0) return { kind: NodeKinds.Block, type: NodeTypes.Heading, textContent: "", childNodes, attrs }

    let currentToken: Token = children.shift()
    while (currentToken.kind === TokenKinds.Inline) {
      if (currentToken.type === TokenTypes.CustomID && children.length <= 0) {
        attrs.push([currentToken.value.slice(1, -1)])
        break
      }
      childNodes.push(this.parseInline(currentToken))
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Block, type: NodeTypes.Heading, textContent: "", childNodes, attrs }
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

  private parseListItems(): Node[] {
    const listItems: Node[] = []
    const currentListType = this.currentToken.type

    while (true) {
      const childNodes = this.parseChildren(this.currentToken.children)

      listItems.push({
        kind: NodeKinds.Block,
        type: NodeTypes.ListItem,
        textContent: '',
        attrs: [],
        childNodes
      })

      if (this.tokens.length <= 0) break

      let nextToken = this.tokens[0]
      if (nextToken.type === TokenTypes.OrderedList || nextToken.type === TokenTypes.UnorderedList) {
        // handle nested list
        if (nextToken.spacesLength / 2 > this.currentToken.spacesLength / 2) {
          this.advance()
          listItems.push(this.parseBlock())

          if (this.tokens.length <= 0) break
          nextToken = this.tokens[0]
        }
      }

      if (nextToken.type !== currentListType) break
      this.advance()
    }

    return listItems
  }

  private parseList(): Node {
    const isOrdered = this.currentToken.type === TokenTypes.OrderedList
    const startFrom = u8.parse(this.currentToken.value[0]).toString()

    return {
      kind: NodeKinds.Block,
      type: NodeTypes.List,
      textContent: '',
      attrs: [[isOrdered ? "ordered" : "unordered", startFrom]],
      childNodes: this.parseListItems()
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

    if (this.tokens.length > 0 && this.tokens[0].type === TokenTypes.TableRow && this.tokens[0].children.length > 0) {
      let currentToken = this.tokens[0].children.shift()

      while (true) {
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
      case TokenTypes.UnorderedList: {
        return this.parseList()
      }
      case TokenTypes.OrderedList: {
        return this.parseList()
      }
      case TokenTypes.HorizontalRule: {
        return { kind: NodeKinds.Block, type: NodeTypes.HorizontalRule, textContent: '', attrs: [], childNodes: [] }
      }
      case TokenTypes.Heading: {
        return this.parseHeading()
      }

      default: {
        const childNodes: Node[] = this.parseChildren(this.currentToken.children)

        switch (this.currentToken.type) {
          case TokenTypes.Paragraph:
            return { kind: NodeKinds.Block, type: NodeTypes.Paragraph, textContent: '', childNodes, attrs: [] }
          case TokenTypes.Blockquotes:
            return this.parseBlockquotes(childNodes)
        }
      }
    }

    throw new Error("")
  }

  parse(): Document {
    while (this.currentToken.kind === TokenKinds.Block) {
      if (this.currentToken.type === TokenTypes.Blankline) {
        if (this.tokens.length <= 0) break
        this.advance()
      }

      this.document.childNodes.push(this.parseBlock())

      if (this.tokens.length <= 0) break
      this.advance()
    }

    return this.document
  }
}
