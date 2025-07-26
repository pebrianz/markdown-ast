export enum TokenKinds {
  Undefined = 0,
  Block = 1,
  Inline = 2
}

export enum TokenTypes {
  // Block token types
  Blankline = 0,
  Heading = 1,
  Paragraph = 2,
  Blockquotes = 3,
  TableRow = 4,
  OrderedList = 5,
  UnorderedList = 6,

  // Inline token types
  Text = 50,
  Asterisk = 51,
  Code = 52,
  Pipe = 53,
  Underscore = 54,
  Backtick = 55,

  Undefined = 500
}

export class Token {
  kind: TokenKinds = TokenKinds.Undefined
  type: TokenTypes = TokenTypes.Undefined
  line: i32 = 0
  column: i32 = 0
  value: string = ""
  spacesLength: i32 = 0
  children: Token[] = []
}
