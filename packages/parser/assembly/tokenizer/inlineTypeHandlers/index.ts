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
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("`", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Backtick,
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("|", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Pipe,
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("!", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Bang,
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("[", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.OpenBracket,
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("]", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.CloseBracket,
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("(", (text, line, column, spacesLength) => {
  let value = text[0]

  let i = 1
  while (i < text.length) {
    value += text[i]
    if (text[i++] === ")") break
  }

  if (value[i - 1] !== ')') return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.LinkURL,
    value, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("<", (text, line, column, spacesLength) => {
  let value = text[0]

  if (text.length < 1 || text[1] === " ") return new Token()

  let i = 1
  while (i < text.length) {
    if (text[i] === " ") return new Token()

    value += text[i]
    if (text[i++] === ">") break
  }

  if (value[i - 1] !== '>') return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.URL,
    value, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("{", (text, line, column, spacesLength) => {
  let value = text[0]

  if (text.length < 4 || text[1] !== "#" || text[2] === "}") return new Token()

  value += text[1] + text[2]

  let i = 3
  while (i < text.length) {
    value += text[i]
    if (text[i++] === "}") break
  }

  if (value[i - 1] !== "}") return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.CustomID,
    value, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set(":", (text, line, column, spacesLength) => {
  if (text.length < 2 || text[1] !== " ") return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.ColonWithSpace,
    value: text[0] + text[1], line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("=", (text, line, column, spacesLength) => {
  let mark = text[0]

  if (text.length < 2 || text[1] !== "=") return new Token()
  mark += text[1]

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.EqualEqual,
    value: mark, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("~", (text, line, column, spacesLength) => {
  let mark = text[0]

  if (text.length < 2 || text[1] !== "~") return new Token()
  mark += text[1]

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.TildeTilde,
    value: mark, line, column, spacesLength, children: []
  }
})
