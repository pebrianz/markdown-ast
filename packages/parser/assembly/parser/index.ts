import {Document, Node, NodeTypes} from './ast';
import {Token, TokenTypes} from '../tokenizer/token';
import {createNode, createSet} from '../utils';

const parseToText: Set<TokenTypes> = createSet([
  TokenTypes.Text,
  TokenTypes.Delimited,
  TokenTypes.OpenParen,
  TokenTypes.CloseParen,
  TokenTypes.CloseBracket,
  TokenTypes.ColonWithSpace,
  TokenTypes.Pipe,
  TokenTypes.CustomId,
]);
  
@final
export class Parser 
{
  private currentToken: Token = new Token();

  private document: Document = new Document();

  private currentTokens: Token[] = [];

  private tokens: Token[] = [];

  @inline
  private nextToken (): Token | null 
  {
    if (this.tokens.length <= 0) return null;
    this.currentTokens = this.tokens;
    this.currentToken = this.currentTokens.shift();

    return this.currentToken;
  }

  private parseBlockItalic (type: TokenTypes, markLength: i32): Node
  {
    if (this.currentToken.children.length <= 0)
      return createNode(50 + markLength);
    const children = this.currentToken.children;
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';

    while (currentToken.type !== type) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;
      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return createNode(50 + markLength, textContent, childNodes);
  }

  private parseLink (): Node 
  {
    const children = this.currentToken.children;
    if (children.length <= 0) return createNode(NodeTypes.Link);
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';

    while (currentToken.type !== TokenTypes.CloseBracket) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;
      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    const attributes = new Map<string, string>();
    let len = 0;

    if(children.length <= 0)
      return createNode(NodeTypes.Link, textContent, childNodes, attributes);

    switch (children[0].type)
    {
      case TokenTypes.OpenBracket:
      {
        if(children.length > 2 && children[2].type === TokenTypes.CloseBracket)
        {
          attributes.set('reference', children[1].value);
          len = 3;
        }
        break;
      }
      case TokenTypes.ColonWithSpace:
      {
        children.shift();
        const parsedChildren = this.parseChildren(children);
        this.document
          .linkReferences.set(textContent, parsedChildren.textContent);
        return this.parseText('');
      }
      case TokenTypes.OpenParen:
      {
        if (children.length <= 2) break;
        const href = children[1].value.trimEnd();

        if(children.length > 3
          && children[2].type === TokenTypes.Delimited
          && children[3].type === TokenTypes.CloseParen)
        {
          const delimited = children[2].value;
          const title = delimited.slice(1, -1);
          attributes.set('title', title);
          attributes.set('href', href);
          len = 4;
        }

        if(children[2].type === TokenTypes.CloseParen)
        {
          attributes.set('href', href);
          len = 3;
        }
      }
    }
    
    for (let i = 0; i++ < len;)
    {
      children.shift();
    }

    return createNode(NodeTypes.Link, textContent, childNodes, attributes);
  }

  @inline
  private parseImage (): Node 
  {
    const children = this.currentToken.children;
    if (children.length <= 0 || children[0].type !== TokenTypes.OpenBracket) 
      return this.parseText(this.currentToken.value);

    children.shift();
    const link = this.parseLink();

    return createNode(
      NodeTypes.Image,
      link.textContent,
      link.childNodes,
      link.attributes,
    );
  }

  @inline
  private parseText (textContent: string): Node 
  {
    return createNode(NodeTypes.Text, textContent);
  }

  private parseAutoLink (value: string): Node 
  {
    const url = value.slice(1, -1);
    const attributes = new Map<string, string>();
    attributes.set('href', url);

    return {
      type: NodeTypes.Link,
      textContent: url,
      attributes,
      childNodes: [createNode(NodeTypes.Text, url)],
    };
  }

  private parseCode (value: string): Node 
  {
    let textContent = value.at(1);

    let i = 1;
    while (++i < value.length) 
    {
      const char = value.at(i);

      if (char === '`') break;
      if (char === '\\') 
      {
        textContent += value.at(++i);
        continue;
      }
      textContent += char;
    }

    return createNode(NodeTypes.Code, textContent);
  }

  private parseWrapedInline (
    tokenType: TokenTypes,
    nodeType: NodeTypes,
  ): Node 
  {
    const children = this.currentToken.children;

    if (children.length <= 0) return createNode(nodeType);

    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';

    while (currentToken.type !== tokenType) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;
      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return createNode(nodeType, textContent, childNodes);
  }

  private parseHtmlTag (value: string): Node 
  {
    return createNode(NodeTypes.HtmlTag, value);
  }

  private parseInline (token: Token): Node 
  {
    const tokenType = token.type;
    const tokenValue = token.value;

    if(parseToText.has(tokenType)) return this.parseText(tokenValue);

    switch (tokenType) 
    {
      case TokenTypes.Asterisk:
        return this.parseBlockItalic(tokenType, tokenValue.length);
      case TokenTypes.EqualEqual:
        return this.parseWrapedInline(
          TokenTypes.EqualEqual,
          NodeTypes.Highlight,
        );
      case TokenTypes.TildeTilde:
        return this.parseWrapedInline(
          TokenTypes.TildeTilde,
          NodeTypes.Strikethrough,
        );
      case TokenTypes.Code:
        return this.parseCode(tokenValue);
      case TokenTypes.OpenBracket:
        return this.parseLink();
      case TokenTypes.AutoLink:
        return this.parseAutoLink(tokenValue);
      case TokenTypes.HtmlTag:
        return this.parseHtmlTag(tokenValue);
      case TokenTypes.Bang:
        return this.parseImage();
    }

    throw new Error(`Unregonize token type '${tokenType}'`);
  }

  private parseChildren (children: Token[]): Node 
  {
    if (children.length <= 0) return createNode(NodeTypes.Document);
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';

    while (true) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;
      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return createNode(NodeTypes.Document, textContent, childNodes);
  }

  @inline
  private parseParagraph (): Node 
  {
    const parsedChildren = this.parseChildren(this.currentToken.children);

    return {
      type: NodeTypes.Paragraph,
      textContent: parsedChildren.textContent,
      childNodes: parsedChildren.childNodes,
      attributes: new Map<string, string>(),
    };
  }

  private parseHeading (): Node 
  {
    const children: Token[] = this.currentToken.children;

    if (children.length <= 0) return createNode(NodeTypes.Heading);

    const childNodes: Node[] = [];
    const attributes = new Map<string, string>();

    if(children.at(-1).type === TokenTypes.CustomId)
    {
      const token = children.pop();
      attributes.set('id', token.value.slice(2, -1));
    }

    let currentToken = children.shift();
    let textContent = '';

    while (true) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;
      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    if(!attributes.has('id'))
    {
      const trimed = textContent.trim();
      const trimedLength = trimed.length;
      let id = '';

      for(let i = -1; ++i < trimedLength;)
      {
        const char = trimed.charAt(i);
        if(char === ' ') id += '-';
        else id += char;
      }

      attributes.set('id', id);
    }

    return createNode(NodeTypes.Heading, textContent, childNodes, attributes);
  }

  private parseBlockquotes (): Node 
  {
    const childNodes: Node[] = [];
    const currentToken = this.currentToken;

    while (true) 
    {
      this.currentTokens = currentToken.children;
      if (this.currentTokens.length <= 0) break;
      this.currentToken = this.currentTokens.shift();

      if (this.currentToken.type === TokenTypes.Blankline) continue;
      childNodes.push(this.parseBlock());
    }

    return createNode(NodeTypes.Blockquotes, '', childNodes);
  }

  private parseListItems (): Node[] 
  {
    const currentListType = this.currentToken.type;
    const currentListLvl = this.currentToken.spacesLength / 2;
    const currentTokens = this.currentTokens;
    const listItems: Node[] = [];

    this.currentToken = this.currentToken.children.shift();

    while (true) 
    {
      const listItem: Node = {
        type: NodeTypes.ListItem,
        textContent: '',
        childNodes: [this.parseBlock()],
        attributes: new Map<string, string>(),
      };

      listItems.push(listItem);

      if (currentTokens.length <= 0) break;
      let nextToken: Token;

      while (true) 
      {
        if (currentTokens.length <= 0) break;
        nextToken = currentTokens[0];

        if (nextToken.type === TokenTypes.Blankline) 
        {
          currentTokens.shift();
          continue;
        }

        if (nextToken.spacesLength / 2 <= currentListLvl) break;
        this.currentToken = currentTokens.shift();
        listItem.childNodes.push(this.parseBlock());
      }

      if (currentTokens.length <= 0) break;
      nextToken = currentTokens[0];

      if (nextToken.type !== currentListType) break;
      this.currentToken = currentTokens.shift().children.shift();
    }

    return listItems;
  }

  @inline
  private parseList (): Node 
  {
    const isOrdered = this.currentToken.type === TokenTypes.OrderedList;
    const startFrom = u8
      .parse(this.currentToken.value.charAt(0))
      .toString();

    const attributes = new Map<string, string>();
    attributes.set('type', isOrdered ? 'ordered' : 'unordered');
    attributes.set('start', startFrom);

    return {
      type: NodeTypes.List,
      textContent: '',
      childNodes: this.parseListItems(),
      attributes,
    };
  }

  private parseTableCell (): Node 
  {
    const children = this.currentToken.children;

    if (children.length <= 0) return createNode(NodeTypes.TableCell);
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';

    while (currentToken.type !== TokenTypes.Pipe) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;
      childNodes.push(node);

      if (children.length <= 0) break;
      const nextToken = children[0];

      if (nextToken.type === TokenTypes.Pipe) break;
      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return createNode(NodeTypes.TableCell, textContent, childNodes);
  }

  private parseTableCells (): Node[] 
  {
    const children = this.currentToken.children;

    if (children.length <= 0) return [];
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    while (currentToken.type === TokenTypes.Pipe) 
    {
      if (children.length <= 0) break;

      childNodes.push(this.parseTableCell());

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return childNodes;
  }

  private parseTableRows (): Node[] 
  {
    const childNodes: Node[] = [];

    if (this.tokens.length <= 0) return childNodes;
    this.nextToken();

    while (this.currentToken.type === TokenTypes.TableRow) 
    {
      childNodes.push(
        createNode(NodeTypes.TableRow, '', this.parseTableCells()),
      );

      if (this.tokens.length <= 0) break;
      this.nextToken();
    }

    return childNodes;
  }

  private parseTable (): Node 
  {
    const align: string[] = [];

    if (
      this.tokens.length > 0 &&
			this.tokens[0].type === TokenTypes.TableRow &&
			this.tokens[0].children.length > 0
    ) 
    {
      const nextToken = this.tokens[0];
      const nextTokenChildrenLength = nextToken.children.length;

      for(let i = 0; i < nextTokenChildrenLength; i++)
      {
        const currentToken = nextToken.children[i];
        
        if (currentToken.type === TokenTypes.Text) 
        {
          const firstchar = currentToken.value.at(0);
          const lastchar = currentToken.value.at(-1);
          const firstlastchar = firstchar + lastchar;

          if (firstchar === '-' || firstchar === ':') 
          {
            let bool = true;
            let i = 0;

            while (++i < currentToken.value.length - 1) 
            {
              if (currentToken.value.at(i) !== '-') bool = false;
            }

            if (bool) 
            {
              if (firstlastchar === '::') align.push('center');
              else if (firstlastchar === '-:') align.push('right');
              else if (lastchar === '-') align.push('left');
            }
          }
        }
      }
    }

    if (align.length < 1) return this.parseParagraph();

    const header: Node = {
      type: NodeTypes.TableHeader,
      textContent: '',
      childNodes: this.parseTableCells(),
      attributes: new Map<string, string>(),
    };

    this.nextToken();

    const attributes = new Map<string, string>();
    attributes.set('align', align.join('|'));

    return {
      type: NodeTypes.Table,
      textContent: '',
      childNodes: [header].concat(this.parseTableRows()),
      attributes,
    };
  }

  private parseBlock (): Node 
  {
    switch (this.currentToken.type) 
    {
      case TokenTypes.Paragraph:
        return this.parseParagraph();
      case TokenTypes.Heading:
        return this.parseHeading();
      case TokenTypes.Blockquotes:
        return this.parseBlockquotes();
      case TokenTypes.HorizontalRule:
        return createNode(NodeTypes.HorizontalRule);
      case TokenTypes.Fenced:
        return createNode(NodeTypes.Fenced, this.currentToken.value);
      case TokenTypes.UnorderedList:
        return this.parseList();
      case TokenTypes.OrderedList:
        return this.parseList();
      case TokenTypes.TableRow:
        return this.parseTable();
    }

    throw new Error(`Unregonize token type '${this.currentToken.type}'`);
  }

  parse (tokens: Token[]): Document 
  {
    this.tokens = tokens;
    while (this.nextToken()) 
    {
      if (this.currentToken.type === TokenTypes.Blankline)
        if (this.nextToken()) break;

      this.document.childNodes.push(this.parseBlock());
    }
    return this.document;
  }
}
