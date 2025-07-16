export enum MarkdownMark {
  Asterisk = "*",
  Hash = "#",
  GreaterThan = ">",
  Backtick = "`",
  Pipe = "|"
}

const space = " "

export enum TokenTypes {
  Heading = "HEADING",
  Paragraph = "PARAGRAPH",
  Blankline = "BLANKLINE",
  Text = "TEXT",
  Italic = "ITALIC",
  Bold = "BOLD",
  Code = "CODE",
  Blockquotes = "BLOCKQUOTES",
  TableRow = "TABLE_ROW",
  Pipe = "PIPE"
}

interface TokenProps {
  readonly type: TokenTypes,
  readonly value: string,
  readonly line: number,
  readonly column: number
}

export abstract class Token implements TokenProps {
  type; value; line; column
  constructor({ type, value, line, column }: TokenProps) {
    this.type = type
    this.value = value
    this.line = line
    this.column = column
  }
}

interface BlockTokenProps extends TokenProps {
  spaces: string,
  children?: InlineToken[]
}

export class BlockToken extends Token implements BlockTokenProps {
  spaces; children
  constructor({ type, value, line, column, spaces, children }: BlockTokenProps) {
    super({ type, value: value, line, column })
    this.spaces = spaces
    this.children = children ?? []
  }
}

export class InlineToken extends Token { }



const blockTypeHandlers = new Map<MarkdownMark, (text: string, linecolumn: { line: number, column: number }, spaces: string) => BlockToken | undefined>([
  [MarkdownMark.Hash, (text, linecolumn, spaces) => {
    let mark = ""
    let i = 0

    while (text[i] === MarkdownMark.Hash) {
      mark += text[i]
      i++
    }

    if (mark.length > 6 || text[i] !== space) return
    return new BlockToken({
      type: TokenTypes.Heading,
      value: mark,
      spaces,
      ...linecolumn
    })
  }],
  [MarkdownMark.GreaterThan, (text, linecolumn, spaces) => {
    let mark = ""
    let i = 0

    while (text[i] === MarkdownMark.GreaterThan) {
      mark += text[i]
      i++
    }

    if (mark.length > 50 || text[i] !== space) return
    return new BlockToken({
      type: TokenTypes.Blockquotes,
      value: mark,
      spaces,
      ...linecolumn
    })
  }],
  [MarkdownMark.Pipe, (text, linecolumn, spaces) => {
    if (!text.startsWith(MarkdownMark.Pipe)) return
    return new BlockToken({
      type: TokenTypes.TableRow,
      value: '',
      spaces,
      ...linecolumn
    })
  }]
])

const inlineTypeHandlers = new Map<MarkdownMark, (text: string, linecolumn: { line: number, column: number }) => InlineToken | undefined>([
  [MarkdownMark.Asterisk, (text, linecolumn) => {
    let mark = ""
    let i = 0

    while (text[i] === MarkdownMark.Asterisk) {
      mark += text[i]
      i++
    }

    const markMap: Record<number, TokenTypes> = {
      1: TokenTypes.Italic,
      2: TokenTypes.Bold
    }

    if (mark.length > 3) return
    return new InlineToken({
      type: markMap[mark.length],
      value: mark,
      ...linecolumn
    })
  }],
  [MarkdownMark.Backtick, (text, linecolumn) => new InlineToken({
    type: TokenTypes.Code,
    value: text[0],
    ...linecolumn
  })],
  [MarkdownMark.Pipe, (text, linecolumn) => new InlineToken({
    type: TokenTypes.Pipe,
    value: text[0],
    ...linecolumn
  })]
])

export class Lexer {
  private readonly lines: string[] = []
  private currentLine: string | null = null
  private currentLineNumber = 0

  constructor(private source: string) {
    this.lines = this.source.split(/\n/) ?? []
    this.advance()
  }

  private tokenizeInline(src: string, column: number): Token[] {
    const tokens: Token[] = []

    let i = 0
    let text = ""

    while (src[i]) {
      if (src[i] === "\\") {
        text += src[i + 1]
        i += 2
      }
      const handler = inlineTypeHandlers.get(src[i] as MarkdownMark)

      if (handler) {
        const inlineToken = handler(src.slice(i), {
          line: this.currentLineNumber,
          column: column + i
        })

        if (inlineToken) {
          if (text.length > 0) {
            tokens.push(new InlineToken({
              type: TokenTypes.Text,
              value: text,
              line: this.currentLineNumber,
              column: column + i - text.length
            }))
            text = ""
          }

          tokens.push(inlineToken)
          i += inlineToken.value.length
          continue
        }
      }

      text += src[i]
      i++
    }

    if (text.length > 0) tokens.push(new InlineToken({
      type: TokenTypes.Text,
      value: text,
      line: this.currentLineNumber,
      column,
    }))
    return tokens
  }

  private tokenizeBlock(line: string): BlockToken[] {
    const trimed = line.trimStart()
    const spaces = line.slice(1, -trimed.length)

    const tokens: BlockToken[] = []
    let column = spaces.length + 1

    if (trimed.length < 1) {
      tokens.push(new BlockToken({
        type: TokenTypes.Blankline,
        value: trimed,
        line: this.currentLineNumber,
        column,
        spaces,
      }))
      return tokens
    }

    let blockToken: BlockToken | null = null

    const handler = blockTypeHandlers.get(trimed[0] as MarkdownMark)

    const linecolumn: { line: number, column: number } = {
      line: this.currentLineNumber,
      column
    }

    if (handler) {
      const token = handler(trimed, linecolumn, spaces) || null
      if (token) blockToken = token
      else blockToken = new BlockToken({
        type: TokenTypes.Paragraph,
        value: '',
        spaces,
        ...linecolumn,
      })
    } else blockToken = new BlockToken({
      type: TokenTypes.Paragraph,
      value: '',
      spaces,
      ...linecolumn
    })

    tokens.push(blockToken)

    column = blockToken.spaces.length + blockToken.value.length + 1
    blockToken.children.push(...this.tokenizeInline(trimed.slice(blockToken.value.length), column))

    return tokens
  }

  private advance() {
    this.currentLine = this.lines.shift() ?? null
    this.currentLineNumber++
  }

  private getTokens(): BlockToken[] {
    const tokens: BlockToken[] = []

    while (this.currentLine !== null) {
      tokens.push(...this.tokenizeBlock(this.currentLine))
      this.advance()
    }

    return tokens
  }

  lex(): BlockToken[] {
    return this.getTokens()
  }
}
