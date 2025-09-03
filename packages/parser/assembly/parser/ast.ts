export enum NodeTypes 
{
  // Block node types
  Document = 0,
  Heading = 1,
  Paragraph = 2,
  Blockquotes = 3,
  Table = 4,
  TableRow = 5,
  TableCell = 6,
  TableHeader = 7,
  List = 8,
  ListItem = 9,
  HorizontalRule = 10,
  Fenced = 11,

  // Inline node types
  Text = 50,
  Italic = 51,
  Bold = 52,
  BlockItalic = 53,
  Code = 54,
  Link = 55,
  Image = 56,
  LinkDefinition = 57,
  Highlight = 58,
  Strikethrough = 59,
  HtmlTag = 60,
  Footnote = 61,
  FootnoteDefinition = 62,
}

export class Node 
{
  type: NodeTypes;

  childNodes: Node[];

  textContent: string;

  attributes: Map<string, string>;
}

@final
export class Document 
{
  type: NodeTypes = NodeTypes.Document;

  childNodes: Node[] = [];

  references: Map<string, string> = new Map<string, string>();
}

