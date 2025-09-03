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
    const tokens = this.tokens;
    if (tokens.length <= 0) return null;
    this.currentTokens = tokens;
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
    let recentNode: Node | null = null;

    while (currentToken.type !== type) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;

      if(node.type === NodeTypes.Text)
      {
        if(recentNode && recentNode.type === NodeTypes.Text)
        {
          recentNode.textContent += node.textContent;
          if (children.length <= 0) break;
          currentToken = children.shift();
          continue;
        }
        recentNode = node;
      }
      else recentNode = null;

      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return createNode(50 + markLength, textContent, childNodes);
  }

  private parseFootnoteDefinition (): Node
  {
    const blocks: Node[] = [];

    while(this.nextToken())
    {
      if (this.currentToken.type === TokenTypes.Blankline) continue;

      blocks.push(this.parseBlock());
    }

    return createNode(NodeTypes.FootnoteDefinition, '', blocks);
  }

  private parseLink (): Node 
  {
    const children = this.currentToken.children;
    if (children.length <= 0) return createNode(NodeTypes.Link);
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';
    let recentNode: Node | null = null;

    while (currentToken.type !== TokenTypes.CloseBracket) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;

      if(node.type === NodeTypes.Text)
      {
        if(recentNode && recentNode.type === NodeTypes.Text)
        {
          recentNode.textContent += node.textContent;
          if (children.length <= 0) break;
          currentToken = children.shift();
          continue;
        }
        recentNode = node;
      }
      else recentNode = null;

      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    const attributes = new Map<string, string>();
    
    if(textContent.charAt(0) === '^')
    {
      attributes.set('reference', textContent);
      return createNode(NodeTypes.Footnote, '', [], attributes);
    }

    if(children.length <= 0)
      return createNode(NodeTypes.Link, textContent, childNodes, attributes);

    let len = 0;

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
        const parsedChildren = this.parseChildren(children, recentNode);
        
        this.document
          .references.set(textContent, parsedChildren.textContent);

        return createNode(
          NodeTypes.LinkDefinition,
          textContent + parsedChildren.textContent,
          childNodes.concat(parsedChildren.childNodes),
        );
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
  private parseImage (): Node | null
  {
    const children = this.currentToken.children;

    if (children.length <= 0
      || children[0].type !== TokenTypes.OpenBracket) return null; 

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
    const valueLength = value.length;
    let textContent = value.at(1);

    for (let i = 1; ++i < valueLength;) 
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
    let recentNode: Node | null = null;

    while (currentToken.type !== tokenType) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;

      if(node.type === NodeTypes.Text)
      {
        if(recentNode && recentNode.type === NodeTypes.Text)
        {
          recentNode.textContent += node.textContent;
          if (children.length <= 0) break;
          currentToken = children.shift();
          continue;
        }
        recentNode = node;
      }
      else recentNode = null;
      
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
        
      case TokenTypes.Code:
        return this.parseCode(tokenValue);
        
      case TokenTypes.OpenBracket:
        return this.parseLink();
        
      case TokenTypes.HtmlTag:
        return this.parseHtmlTag(tokenValue);
        
      case TokenTypes.Bang:
      {
        const node = this.parseImage();
        if(node) return node;
        return this.parseText(tokenValue);
      }
        
      case TokenTypes.AutoLink:
        return this.parseAutoLink(tokenValue);
        
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
    }

    throw new Error(`Unregonize token type '${this.currentToken.type}'`);
  }

  private parseChildren (
    children: Token[],
    _recentNode: Node | null = null,
  ): Node 
  {
    if (children.length <= 0) return createNode(NodeTypes.Document);
    const childNodes: Node[] = [];

    let currentToken = children.shift();
    let textContent = '';
    let recentNode: Node | null = _recentNode;

    while (true) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;

      if(node.type === NodeTypes.Text)
      {
        if(recentNode && recentNode.type === NodeTypes.Text)
        {
          recentNode.textContent += node.textContent;
          if (children.length <= 0) break;
          currentToken = children.shift();
          continue;
        }
        recentNode = node;
      }
      else recentNode = null;

      childNodes.push(node);

      if (children.length <= 0) break;
      currentToken = children.shift();
    }

    return createNode(NodeTypes.Document, textContent, childNodes);
  }

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
    let recentNode: Node | null = null;

    while (true) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;

      if(node.type === NodeTypes.Text)
      {
        if(recentNode && recentNode.type === NodeTypes.Text)
        {
          recentNode.textContent += node.textContent;
          if (children.length <= 0) break;
          currentToken = children.shift();
          continue;
        }
        recentNode = node;
      }
      else recentNode = null;

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
    let recentNode: Node | null = null;

    while (currentToken.type !== TokenTypes.Pipe) 
    {
      const node = this.parseInline(currentToken);
      textContent += node.textContent;

      if(node.type === NodeTypes.Text)
      {
        if(recentNode && recentNode.type === NodeTypes.Text)
        {
          recentNode.textContent += node.textContent;
          if (children.length <= 0) break;
          currentToken = children.shift();
          continue;
        }
        recentNode = node;
      }
      else recentNode = null;

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
    const tokens = this.tokens;
    const childNodes: Node[] = [];

    if (tokens.length <= 0) return childNodes;
    this.nextToken();

    while (this.currentToken.type === TokenTypes.TableRow) 
    {
      childNodes
        .push(createNode(NodeTypes.TableRow, '', this.parseTableCells()));

      if (tokens.length <= 0) break;
      this.nextToken();
    }

    return childNodes;
  }

  private parseTable (): Node 
  {
    const align: string[] = [];

    if (this.tokens.length > 0)
    {
      const nextToken = this.tokens[0];
      const nextTokenChildrenLength = nextToken.children.length;
    
      if(nextToken.type === TokenTypes.TableRow
        && nextTokenChildrenLength > 0) 
      {
        for(let i = 0; i < nextTokenChildrenLength; i++)
        {
          const currentToken = nextToken.children[i];
          const currentTokenValue = currentToken.value;
          const currentTokenType = currentToken.type;
        
          if (currentTokenType === TokenTypes.Text) 
          {
            const firstchar = currentTokenValue.at(0);
            const lastchar = currentTokenValue.at(-1);
            const firstlastchar = firstchar + lastchar;

            if (firstchar === '-' || firstchar === ':') 
            {
              let bool = true;
              let i = 0;
              const currentTokenValueLenght = currentTokenValue.length - 1;

              while (++i < currentTokenValueLenght) 
              {
                if (currentTokenValue.at(i) !== '-') bool = false;
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
    const currentToken = this.currentToken;
    const currentTokenType = currentToken.type;
    const currentTokenValue = currentToken.value;
    
    switch (currentTokenType) 
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
        return createNode(NodeTypes.Fenced, currentTokenValue);
        
      case TokenTypes.UnorderedList:
        return this.parseList();
        
      case TokenTypes.OrderedList:
        return this.parseList();
        
      case TokenTypes.TableRow:
        return this.parseTable();
    }

    throw new Error(`Unregonize token type '${currentTokenType}'`);
  }

  parse (tokens: Token[]): Document 
  {
    this.tokens = tokens;

    const document = this.document;
    const documentChildNodes = document.childNodes;

    while (this.nextToken()) 
    {
      if (this.currentToken.type === TokenTypes.Blankline) continue;

      documentChildNodes.push(this.parseBlock());
    }

    return document;
  }
}
