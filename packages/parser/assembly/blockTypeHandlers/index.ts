import { Token, TokenKinds, TokenTypes } from "../token"

export const blockTypeHandlers = new Map<string, (text: string, line: i32, column: i32, spaceslength: i32) => Token>()

blockTypeHandlers.set("#", (text, line, column, spacesLength) => {
  let mark: string = ""
  let i: u8 = 0

  while (text[i] === "#") {
    mark += text[i]
    i++
  }

  if (mark.length > 6 || text[i] !== " ") return new Token()

  mark += text[i]

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.Heading,
    value: mark,
    line,
    column,
    spacesLength,
    children: []
  }
})

blockTypeHandlers.set(">", (text, line, column, spaceLength) => {
  let mark = ""
  let i = 0

  while (text[i] === ">") {
    mark += text[i]
    i++
  }

  if (mark.length > 50 || text[i] !== " ") return new Token()

  mark += text[i]

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.Blockquotes,
    value: mark,
    line,
    column,
    spacesLength: 0,
    children: []
  }
})

blockTypeHandlers.set("|", (text, line, column, spacesLength) => {
  if (!text.startsWith("|")) return new Token()

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.TableRow,
    value: "",
    line,
    column,
    spacesLength,
    children: []
  }
})

blockTypeHandlers.set("-", (text, line, column, spacesLength) => {
  if (text[1] !== " ") return new Token()

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.UnorderedList,
    value: text[0] + text[1],
    line,
    column,
    spacesLength,
    children: []
  }
})

blockTypeHandlers.set("number", (text, line, column, spacesLength) => {
  let mark = text[0]
  let i = 1
  while (i <= 2) {
    mark += text[i]
    i++
  }

  if (mark.length !== 3 || mark[1] !== "." || mark[2] !== " ") return new Token()

  return {
    kind: TokenKinds.Block,
    type: TokenTypes.OrderedList,
    value: mark,
    line,
    column,
    spacesLength,
    children: []
  }
})
