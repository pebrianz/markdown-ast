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
	Bang = 56,
	OpenBracket = 57,
	CloseBracket = 58,
	LinkURL = 59,
	AutoLink = 60,
	ColonWithSpace = 61,
	EqualEqual = 62,
	TildeTilde = 63,
	HtmlTag = 64,
}

@final
export class Token {
	type: TokenTypes = TokenTypes.Blankline;
	line: u16 = 0;
	column: u16 = 0;
	value: string = "";
	spacesLength: u8 = 0;
	children: Token[] = [];
}
