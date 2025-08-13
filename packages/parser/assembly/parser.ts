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
  Fenced = 11,

  // Inline node types
  Text = 50,
  Italic = 51,
  Bold = 52,
  BlockItalic = 53,
  Code = 54,
  Link = 55,
  Image = 56,
  LinkReference = 57,
  Highlight = 58,
  Strikethrough = 59
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
  private currentTokens: Token[] = []
  constructor(private tokens: Token[]) { }

  private advance(): void {
    if (this.tokens.length > 0) {
      this.currentTokens = this.tokens
      this.currentToken = this.currentTokens.shift()
    }
  }

  private parseCode(): Node {
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: NodeTypes.Code, textContent: '', childNodes: [], attrs: [] }

    let currentToken = children.shift()
    let textContent = ""

    while (currentToken.type !== TokenTypes.Backtick) {
      textContent += currentToken.value

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Inline, type: NodeTypes.Code, textContent, childNodes: [], attrs: [] }
  }

  parseBlockItalic(type: TokenTypes, markLength: i32): Node {
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: 50 + markLength, textContent: '', childNodes: [], attrs: [] }

    const childNodes: Node[] = []

    let currentToken = children.shift()
    let textContent = ""

    while (currentToken.type !== type) {
      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Inline, type: 50 + markLength, textContent, childNodes, attrs: [] }
  }

  private parseLink(): Node {
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: NodeTypes.Link, textContent: '', attrs: [], childNodes: [] }

    const childNodes: Node[] = []

    let currentToken = children.shift()
    let textContent = ''

    while (currentToken.type !== TokenTypes.CloseBracket) {
      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    if (children.length > 1 && children[0].type === TokenTypes.ColonWithSpace) {
      const url = children[1].value.trim()
      this.document.references.set(textContent, children[1].value.trim())
      return { kind: NodeKinds.Inline, type: NodeTypes.LinkReference, textContent, attrs: [[url]], childNodes }
    }

    const attrs: string[][] = []

    if (children.length > 0 && children[0].type === TokenTypes.LinkURL) {
      const url = children[0].value.slice(1, -1).trim()
      attrs[0] = [url]
      children.shift()
    }

    return { kind: NodeKinds.Inline, type: NodeTypes.Link, textContent, attrs, childNodes }
  }

  private parseImage(): Node {
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: NodeTypes.Image, textContent: '', attrs: [], childNodes: [] }

    const childNodes: Node[] = []

    let currentToken: Token = children.shift()
    let textContent = ""

    while (currentToken.type !== TokenTypes.CloseBracket) {
      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    const attrs: string[][] = []

    if (children.length > 0 && children[0].type === TokenTypes.LinkURL) {
      const url = children[0].value.slice(1, -1).trim()
      attrs[0] = [url]
      children.shift()
    }

    return { kind: NodeKinds.Inline, type: NodeTypes.Image, textContent, attrs, childNodes }
  }
  private parseText(value: string): Node {
    return { kind: NodeKinds.Inline, type: NodeTypes.Text, textContent: value, childNodes: [], attrs: [] }
  }

  private parseURL(value: string): Node {
    const url = value.slice(1, -1)
    return {
      kind: NodeKinds.Inline, type: NodeTypes.Link, textContent: url,
      attrs: [[url]],
      childNodes: [{
        kind: NodeKinds.Inline,
        type: NodeTypes.Text,
        textContent: url,
        attrs: [],
        childNodes: []
      }]
    }
  }

  private parseWrapedInline(tokenType: TokenTypes, nodeType: NodeTypes): Node {
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Inline, type: nodeType, textContent: '', attrs: [], childNodes: [] }

    const childNodes: Node[] = []

    let currentToken = children.shift()
    let textContent = ""

    while (currentToken.type !== tokenType) {
      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Inline, type: nodeType, textContent, childNodes, attrs: [] }
  }

  private parseInline(token: Token): Node {
    switch (token.type) {
      case TokenTypes.Text:
        return this.parseText(token.value)
      case TokenTypes.Asterisk:
        return this.parseBlockItalic(token.type, token.value.length)
      case TokenTypes.EqualEqual:
        return this.parseWrapedInline(TokenTypes.EqualEqual, NodeTypes.Highlight)
      case TokenTypes.TildeTilde:
        return this.parseWrapedInline(TokenTypes.TildeTilde, NodeTypes.Strikethrough)
      case TokenTypes.Backtick:
        return this.parseCode()
      case TokenTypes.OpenBracket:
        return this.parseLink()
      case TokenTypes.CloseBracket:
        return this.parseText(token.value)
      case TokenTypes.LinkURL:
        return this.parseText(token.value)
      case TokenTypes.URL:
        return this.parseURL(token.value)
      case TokenTypes.ColonWithSpace:
        return this.parseText(token.value)
      case TokenTypes.Pipe:
        return this.parseText(token.value)
      case TokenTypes.CustomID:
        return this.parseText(token.value)
      case TokenTypes.Bang:
        if (this.currentToken.children.length <= 0 || this.currentToken.children[0].type !== TokenTypes.OpenBracket) {
          return this.parseText(token.value)
        }
        this.currentToken.children.shift()
        return this.parseImage()
    }

    throw new Error()
  }

  private parseChildren(children: Token[]): Node {
    if (children.length <= 0) return { kind: NodeKinds.Document, type: NodeTypes.Document, textContent: '', childNodes: [], attrs: [] }
    const childNodes: Node[] = []

    let currentToken = children.shift()
    let textContent = ""

    while (currentToken.kind === TokenKinds.Inline) {
      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Document, type: NodeTypes.Document, textContent, childNodes, attrs: [] }
  }

  private parseHeading(): Node {
    const children: Token[] = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Block, type: NodeTypes.Heading, textContent: '', childNodes: [], attrs: [] }

    const childNodes: Node[] = []
    const attrs: string[][] = []

    let currentToken: Token = children.shift()
    let textContent = ""

    while (currentToken.kind === TokenKinds.Inline) {
      if (currentToken.type === TokenTypes.CustomID && children.length <= 0) {
        attrs.push([currentToken.value.slice(1, -1)])
        break
      }

      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Block, type: NodeTypes.Heading, textContent, childNodes, attrs }
  }

  private parseBlockquotes(): Node {
    const childNodes: Node[] = []

    const currentToken: Token = this.currentToken
    while (true) {
      this.currentTokens = currentToken.children
      if (this.currentTokens.length <= 0) break
      this.currentToken = this.currentTokens.shift()

      if (this.currentToken.type === TokenTypes.Blankline) continue

      childNodes.push(this.parseBlock())
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
      const parsedChildren = this.parseChildren(this.currentToken.children)

      listItems.push({
        kind: NodeKinds.Block,
        type: NodeTypes.ListItem,
        textContent: parsedChildren.textContent,
        attrs: [],
        childNodes: parsedChildren.childNodes
      })

      if (this.currentTokens.length <= 0) break

      let nextToken = this.currentTokens[0]
      if (nextToken.type === TokenTypes.OrderedList || nextToken.type === TokenTypes.UnorderedList) {
        // handle nested list
        if (nextToken.spacesLength / 2 > this.currentToken.spacesLength / 2) {
          this.currentToken = this.currentTokens.shift()
          listItems.push(this.parseBlock())

          if (this.currentTokens.length <= 0) break
          nextToken = this.tokens[0]
        }
      }

      if (nextToken.type !== currentListType) break
      this.currentToken = this.currentTokens.shift()
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
    const children = this.currentToken.children

    if (children.length <= 0) return { kind: NodeKinds.Block, type: NodeTypes.TableCell, textContent: '', childNodes: [], attrs: [] }

    const childNodes: Node[] = []

    let currentToken = children.shift()
    let textContent = ""

    while (currentToken.type !== TokenTypes.Pipe) {
      const node = this.parseInline(currentToken)
      textContent += node.textContent
      childNodes.push(node)

      if (children.length <= 0) break
      const nextToken = children[0]

      if (nextToken.type === TokenTypes.Pipe) break
      if (children.length <= 0) break
      currentToken = children.shift()
    }

    return { kind: NodeKinds.Block, type: NodeTypes.TableCell, textContent, childNodes, attrs: [] }
  }

  private parseTableCells(): Node[] {
    const children = this.currentToken.children

    if (children.length <= 0) return []

    const childNodes: Node[] = []

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
      return { kind: NodeKinds.Block, type: NodeTypes.Paragraph, textContent: '', childNodes: [], attrs: [] }
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
      case TokenTypes.Heading:
        return this.parseHeading()
      case TokenTypes.Blockquotes:
        return this.parseBlockquotes()
      case TokenTypes.Fenced:
        return { kind: NodeKinds.Block, type: NodeTypes.Fenced, textContent: this.currentToken.value, attrs: [], childNodes: [] }
      case TokenTypes.HorizontalRule:
        return { kind: NodeKinds.Block, type: NodeTypes.HorizontalRule, textContent: '', attrs: [], childNodes: [] }
      case TokenTypes.UnorderedList:
        return this.parseList()
      case TokenTypes.OrderedList:
        return this.parseList()
      case TokenTypes.TableRow:
        return this.parseTable()

      default: {
        const parsedChildren = this.parseChildren(this.currentToken.children)
        const textContent = parsedChildren.textContent
        const childNodes = parsedChildren.childNodes

        switch (this.currentToken.type) {
          case TokenTypes.Paragraph:
            return { kind: NodeKinds.Block, type: NodeTypes.Paragraph, textContent, childNodes, attrs: [] }
        }
      }
    }

    throw new Error("")
  }

  parse(): Document {
    do {
      this.advance()
      if (this.currentToken.type === TokenTypes.Blankline) {
        if (this.tokens.length <= 0) break
        this.advance()
      }
      this.document.childNodes.push(this.parseBlock())
    } while (this.tokens.length > 0)

    return this.document
  }
}
