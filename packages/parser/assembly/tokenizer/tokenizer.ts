import { blockTypeHandlers } from "./blockTypeHandlers"
import { inlineTypeHandlers } from "./inlineTypeHandlers"

import { Token, TokenKinds, TokenTypes } from "./token"

export class Tokenizer {
  private lines: string[] = []
  private currentLine: string = ''
  private currentLineNumber: i32 = 0

  constructor(source: string) {
    this.lines = source.split("\n")
    this.advance()
  }

  private advance(): void {
    if (this.lines.length > 0) {
      this.currentLine = this.lines.shift()
      this.currentLineNumber++
    }
  }

  private tokenizeInline(src: string, column: i32): Token[] {
    const tokens: Token[] = []

    let i = 0
    let text = ""

    while (src[i] !== '') {
      if (src[i] === "\\") {
        text += src[i + 1]
        i += 2
      }

      const key = src[i]
      if (inlineTypeHandlers.has(key)) {
        const handler = inlineTypeHandlers.get(key)
        const inlineToken = handler(src.slice(i), this.currentLineNumber, column + i, 0)

        if (inlineToken.kind !== TokenKinds.Undefined) {
          if (text.length > 0) {
            tokens.push({
              kind: TokenKinds.Inline,
              type: TokenTypes.Text,
              value: text,
              line: this.currentLineNumber,
              column: column + i - text.length,
              spacesLength: 0,
              children: []
            })

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

    if (text.length > 0) tokens.push({
      kind: TokenKinds.Inline,
      type: TokenTypes.Text,
      value: text,
      line: this.currentLineNumber,
      column: column,
      spacesLength: 0,
      children: []
    })

    return tokens
  }

  private tokenizeBlock(line: string): Token {
    const trimed: string = line.trimStart()
    const spacesLength: i32 = line.slice(1, -trimed.length).length

    let column: i32 = spacesLength + 1

    if (trimed.length < 1) return {
      kind: TokenKinds.Block,
      type: TokenTypes.Blankline,
      value: trimed,
      line: this.currentLineNumber,
      column,
      spacesLength,
      children: []
    }

    let token: Token = {
      kind: TokenKinds.Block,
      type: TokenTypes.Paragraph,
      value: '',
      spacesLength,
      line: this.currentLineNumber,
      column,
      children: []
    }

    const key = u8.parse(trimed[0]) === 0 ? trimed[0] : "number"
    if (blockTypeHandlers.has(key)) {
      const handler = blockTypeHandlers.get(key)
      const blockToken = handler(trimed, this.currentLineNumber, column, spacesLength)

      if (blockToken.kind !== TokenKinds.Undefined) token = blockToken
    }

    column = token.spacesLength + token.value.length + 1
    // if (token.type === TokenTypes.Blockquotes) {
    //   token.children.push(this.tokenizeBlock(trimed.slice(token.value.length)))
    //   return token
    // }
    token.children = this.tokenizeInline(trimed.slice(token.value.length), column)

    return token
  }

  tokenize(): Token[] {
    const tokens: Token[] = []

    while (true) {
      tokens.push(this.tokenizeBlock(this.currentLine))
      if (this.lines.length <= 0) break
      this.advance()
    }

    return tokens
  }
}
