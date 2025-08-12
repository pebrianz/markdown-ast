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
  HorizontalRule = 7,
  Fenced = 8,

  // Inline token types
  Text = 50,
  Asterisk = 51,
  Code = 52,
  Pipe = 53,
  Backtick = 55,
  Bang = 56,
  OpenBracket = 57,
  CloseBracket = 58,
  LinkURL = 59,
  CustomID = 60,
  URL = 61,
  ColonWithSpace = 62,
  EqualEqual = 63,
  TildeTilde = 64,

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
