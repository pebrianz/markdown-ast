import { Token, TokenKinds, TokenTypes } from "../token"

export const inlineTypeHandlers = new Map<string, (text: string, line: i32, column: i32, spaceslength: i32) => Token>()

inlineTypeHandlers.set("*", (text, line, column, spacesLength) => {
  let mark: string = text[0]
  let i = 1
  while (text[i] === "*") {
    mark += text[i]
    i++
  }

  if (mark.length > 3) return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Asterisk,
    value: mark,
    line,
    column,
    spacesLength,
    children: []
  }
})

inlineTypeHandlers.set("_", (text, line, column, spacesLength) => {
  let mark: string = text[0]
  let i = 1
  while (text[i] === "_") {
    mark += text[i]
    i++
  }

  if (mark.length > 3) return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Underscore,
    value: mark,
    line,
    column,
    spacesLength,
    children: []
  }
})

inlineTypeHandlers.set("`", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Backtick,
    value: text[0],
    line,
    column,
    spacesLength,
    children: []
  }
})

inlineTypeHandlers.set("|", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Pipe,
    value: text[0],
    line,
    column,
    spacesLength,
    children: []
  }
})

