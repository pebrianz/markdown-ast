import { Token, TokenKinds, TokenTypes } from "../token"

export const inlineTypeHandlers = new Map<string, (text: string, line: i32, column: i32, spaceslength: i32) => Token>()

/* eslint-disable */
inlineTypeHandlers.set("*", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]
  let i = 0

  // @ts-ignore
  while (text[++i] === "*") {
    // @ts-ignore
    mark += text[i]
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
  // @ts-ignore
  let value = text[0]

  let i = 0
  while (++i < text.length) {
    // @ts-ignore
    const char = text[i]

    if (char === "\\") {
      // @ts-ignore
      value += char + text[++i]
      continue
    }

    value += char

    if (char === "`") break
  }

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Code,
    value, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("|", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Pipe,
    // @ts-ignore
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("!", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.Bang,
    // @ts-ignore
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("[", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.OpenBracket,
    // @ts-ignore
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("]", (text, line, column, spacesLength) => {
  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.CloseBracket,
    // @ts-ignore
    value: text[0],
    line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("(", (text, line, column, spacesLength) => {
  // @ts-ignore
  let value = text[0]
  let i = 0

  while (++i < text.length) {
    // @ts-ignore
    const char = text[i]
    value += char
    if (char === ")") break
  }

  if (value[value.length - 1] !== ')') return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.LinkURL,
    value, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("<", (text, line, column, spacesLength) => {
  // @ts-ignore
  let value = text[0]

  // @ts-ignore
  if (text.length < 2 || text[1] === " ") return new Token()

  let i = 0
  while (++i < text.length) {
    // @ts-ignore
    const char = text[i]

    if (char === " ") return new Token()
    value += char

    if (char === ">") break
  }

  if (value[value.length - 1] !== '>') return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.URL,
    value, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set(":", (text, line, column, spacesLength) => {
  // @ts-ignore
  if (text.length < 2 || text[1] !== " ") return new Token()

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.ColonWithSpace,
    // @ts-ignore
    value: text[0] + text[1], line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("=", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]

  // @ts-ignore
  if (text.length > 1 && text[1] !== "=") return new Token()
  // @ts-ignore
  mark += text[1]

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.EqualEqual,
    value: mark, line, column, spacesLength, children: []
  }
})

inlineTypeHandlers.set("~", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]

  // @ts-ignore
  if (text.length > 1 && text[1] !== "~") return new Token()
  // @ts-ignore
  mark += text[1]

  return {
    kind: TokenKinds.Inline,
    type: TokenTypes.TildeTilde,
    value: mark, line, column, spacesLength, children: []
  }
})
