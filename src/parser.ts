import { TokenTypes, InlineToken, BlockToken } from "./index.js";

/* eslint-disable */
abstract class Node { }

abstract class BlockNode extends Node {
  abstract readonly childNodes: InlineNode[]
}

abstract class InlineNode extends Node {
}

class DocumentNode {
  constructor(readonly childNodes: BlockNode[]) { }
}

class TextNode extends InlineNode {
  constructor(readonly value: string) {
    super()
  }
}

class BoldNode extends InlineNode {
  constructor(readonly childNodes: InlineNode[]) {
    super()
  }
}

class HeadingNode extends BlockNode {
  constructor(readonly childNodes: InlineNode[]) {
    super()
  }
}

class ParagraphNode extends BlockNode {
  constructor(readonly childNodes: InlineNode[]) {
    super()
  }
}

class TableCellNode extends BlockNode {
  constructor(readonly childNodes: InlineNode[]) {
    super()
  }
}

class TableHeaderNode extends BlockNode {
  constructor(readonly childNodes: TableCellNode[]) {
    super()
  }
}

class TableRowNode extends BlockNode {
  constructor(readonly childNodes: TableCellNode[]) {
    super()
  }
}


enum Align {
  center = "(-)+",
  start = "^:(-)+",
  end = "(-)+:$"
}

class TableNode extends BlockNode {
  constructor(
    readonly header: TableHeaderNode,
    readonly align: Array<"center" | "start" | "end">,
    readonly childNodes: TableRowNode[]
  ) {
    super()
  }
}

export class Parser {
  private currentToken: BlockToken | null = null
  constructor(private tokens: BlockToken[]) {
    this.advance()
  }

  private advance() {
    this.currentToken = this.tokens.shift() ?? null
  }

  private parseBold(): BoldNode {
    const childNodes: InlineNode[] = []
    const children = this.currentToken?.children ?? []

    let currentToken = children.shift()
    while (currentToken && currentToken.type !== TokenTypes.Bold) {
      childNodes.push(this.parseInline(currentToken))
      currentToken = children.shift()
    }

    return new BoldNode(childNodes)
  }

  private parseInline(currentToken: InlineToken): InlineNode {

    switch (currentToken?.type) {
      case TokenTypes.Text:
        return new TextNode(currentToken.value)
      case TokenTypes.Pipe:
        return new TextNode(currentToken.value)
      case TokenTypes.Bold:
        return this.parseBold()
    }

    throw new Error()
  }

  private parseChildren(children: InlineToken[] = []): InlineNode[] {
    const childNodes: InlineNode[] = []

    let currentToken = children.shift()
    while (currentToken instanceof InlineToken) {
      childNodes.push(this.parseInline(currentToken))
      currentToken = children.shift()
    }

    return childNodes
  }

  private parseTableCell(): TableCellNode {
    const childNodes: InlineNode[] = []
    const children = this.currentToken?.children ?? []

    let currentToken = children.shift()
    while (currentToken && currentToken.type !== TokenTypes.Pipe) {
      childNodes.push(this.parseInline(currentToken))

      const nextToken = children.at(0)
      if (nextToken?.type === TokenTypes.Pipe) break

      currentToken = children.shift()
    }

    return new TableCellNode(childNodes)
  }

  private parseTableCells(): TableCellNode[] {
    const childNodes: TableCellNode[] = []
    const children = this.currentToken?.children ?? []

    let currentToken = children.shift()
    while (currentToken && currentToken.type === TokenTypes.Pipe) {
      const nextToken = children.at(0)
      if (!(nextToken instanceof InlineToken)) break

      childNodes.push(this.parseTableCell())
      currentToken = children.shift()
    }
    return childNodes
  }

  private parseTableRows(): TableRowNode[] {
    const childNodes: TableRowNode[] = []

    this.advance()

    while (this.currentToken?.type === TokenTypes.TableRow) {
      const tableRow = new TableRowNode(this.parseTableCells())
      childNodes.push(tableRow)
      this.advance()
    }

    return childNodes
  }

  private parseTable(): TableNode | ParagraphNode {
    const nextToken = this.tokens[0]
    const align: TableNode['align'] = []

    if (nextToken && nextToken.type === TokenTypes.TableRow) {
      let currentToken = nextToken.children.shift()
      while (currentToken) {
        if (new RegExp(Align.center).test(currentToken.value)) {
          align.push("center")
        } else if (new RegExp(Align.start).test(currentToken.value)) {
          align.push("start")
        } else if (new RegExp(Align.end).test(currentToken.value)) {
          align.push("end")
        }
        currentToken = nextToken.children.shift()
      }
    }

    if (align.length < 1) {
      const childNodes: InlineNode[] = this.parseChildren()
      return new ParagraphNode(childNodes)
    }

    const header: TableHeaderNode = new TableHeaderNode(this.parseTableCells())
    this.advance()
    const childNodes: TableRowNode[] = this.parseTableRows()
    return new TableNode(header, align, childNodes)

  }

  private parseBlock(): BlockNode {
    switch (this.currentToken?.type) {
      case TokenTypes.TableRow: {
        return this.parseTable()
      }

      default: {
        const tokenType = this.currentToken?.type
        const childNodes: InlineNode[] = this.parseChildren(this.currentToken?.children)

        switch (tokenType) {
          case TokenTypes.Heading:
            return new HeadingNode(childNodes)
          case TokenTypes.Paragraph:
            return new ParagraphNode(childNodes)
        }
      }
    }

    throw new Error("")
  }

  private parseDocument(): DocumentNode {
    const children: BlockNode[] = []

    while (this.currentToken instanceof BlockToken) {
      children.push(this.parseBlock())
      this.advance()
    }

    return new DocumentNode(children)
  }

  parse() {
    return this.parseDocument()
  }
}
