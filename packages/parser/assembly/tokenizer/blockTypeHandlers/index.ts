import { Token, TokenKinds, TokenTypes } from "../token"

export const blockTypeHandlers = new Map<string, (text: string, line: i32, column: i32, spaceslength: i32) => Token>()

blockTypeHandlers.set("#", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]
  let i: u8 = 0

  // @ts-ignore
  while (text[++i] === "#") {
    // @ts-ignore
    mark += text[i]
  }

  // @ts-ignore
  const char = text[i]

  if (mark.length > 6 || char !== " ") return new Token()
  mark += char

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.Heading,
    value: mark,
    line, column, spacesLength, children: []
  }
})

blockTypeHandlers.set(">", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]
  // @ts-ignore
  if (text.length > 1 && text[1] !== " ") return new Token()
  // @ts-ignore
  mark += text[1]

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.Blockquotes,
    value: mark,
    line, column, spacesLength, children: []
  }
})

blockTypeHandlers.set("|", (text, line, column, spacesLength) => {
  if (!text.startsWith("|")) return new Token()

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.TableRow,
    value: "",
    line, column, spacesLength, children: []
  }
})

blockTypeHandlers.set("-", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]
  let i = 0
  let isHorizontalRule = true

  while (++i < text.length) {
    // @ts-ignore
    const char = text[i]

    if (char !== "-") {
      isHorizontalRule = false
      break
    }

    mark += char
  }

  if (isHorizontalRule && mark.length >= 3) return {
    kind: TokenKinds.Block,
    type: TokenTypes.HorizontalRule,
    value: mark,
    line, column, spacesLength, children: []
  }

  // @ts-ignore
  if (text.length > 1 && text[1] !== " ") return new Token()
  // @ts-ignore
  mark += text[1]

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.UnorderedList,
    value: mark,
    line, column, spacesLength, children: []
  }
})

blockTypeHandlers.set("number", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]
  let i = 0

  // @ts-ignore
  while (++i <= 2) { mark += text[i] }

  if (mark.length !== 3 || mark[1] !== "." || mark[2] !== " ") return new Token()

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.OrderedList,
    value: mark,
    line, column, spacesLength, children: []
  }
})

blockTypeHandlers.set("`", (text, line, column, spacesLength) => {
  // @ts-ignore
  let mark = text[0]
  let i = 0
  while (++i < text.length) {
    // @ts-ignore
    const char = text[i]

    if (mark.length < 3 && char !== "`") return new Token()
    mark += char
  }

  if (mark.length < 3) return new Token()

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.Fenced,
    value: mark,
    line, column, spacesLength, children: []
  }
})
