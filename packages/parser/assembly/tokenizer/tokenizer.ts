import {blockTypeHandlers} from './blockTypeHandlers';
import {inlineTypeHandlers} from './inlineTypeHandlers';
import {isDigit} from '../utils';

import {Token, TokenTypes} from './token';

@final
export class Tokenizer 
{
  private lines: string[] = [];

  private currentLine: string = '';

  private currentLineNumber: u16 = 0;

  constructor (source: string) 
  {
    this.lines = source.split('\n');
  }

  @inline
  private nextLine (): string | null 
  {
    if (this.lines.length <= 0) return null;
    this.currentLine = this.lines.shift();
    this.currentLineNumber++;

    return this.currentLine;
  }

  private tokenizeInline (line: string, column: u16): Token[] 
  {
    const lineLength = u16(line.length);
    const tokens: Token[] = [];

    let i: u16 = 0;
    let text = '';

    while (i < lineLength)
    {
      if (line.charAt(i) === '\\') 
      {
        text += line.charAt(++i);
        i++;
      }

      const key = line.charAt(i);

      if (inlineTypeHandlers.has(key)) 
      {
        const handler = inlineTypeHandlers.get(key);
        const inlineToken = handler(
          line.slice(i),
          this.currentLineNumber,
          column + i,
          0,
        );

        if (inlineToken) 
        {
          if (text.length > 0) 
          {
            tokens.push({
              type: TokenTypes.Text,
              value: text,
              line: this.currentLineNumber,
              column: column + i - u16(text.length),
              spacesLength: 0,
              children: [],
            });

            text = '';
          }

          tokens.push(inlineToken);
          i += u16(inlineToken.value.length);
          continue;
        }
      }

      text += line.charAt(i);
      i++;
    }

    if (text.length > 0)
      tokens.push({
        type: TokenTypes.Text,
        value: text,
        line: this.currentLineNumber,
        column: column,
        spacesLength: 0,
        children: [],
      });

    return tokens;
  }

  private tokenizeBlock (line: string, prevColumn: u16 = 0): Token 
  {
    const trimed = line.trimStart();
    const spacesLength: u8 = u8(line.slice(0, -trimed.length).length);

    let column: u16 = 1 + spacesLength + prevColumn;

    if (trimed.length < 1)
      return {
        type: TokenTypes.Blankline,
        value: trimed,
        line: this.currentLineNumber,
        column,
        spacesLength,
        children: [],
      };

    let token: Token = {
      type: TokenTypes.Paragraph,
      value: '',
      spacesLength,
      line: this.currentLineNumber,
      column,
      children: [],
    };

    const key = isDigit(trimed.charCodeAt(0)) ? 'digit' : trimed.charAt(0);

    if (blockTypeHandlers.has(key)) 
    {
      const handler = blockTypeHandlers.get(key);
      const blockToken = handler(
        trimed,
        this.currentLineNumber,
        column,
        spacesLength,
      );

      if (blockToken) token = blockToken;
    }

    column = token.spacesLength + u16(token.value.length) + prevColumn;

    switch (token.type) 
    {
      case TokenTypes.Fenced: {
        while (this.nextLine()) 
        {
          const currentLine = this.currentLine;

          if (currentLine.trim() === '```') break;
          token.value += `\n${currentLine}`;
        }

        return token;
      }
      case TokenTypes.UnorderedList: {
        token.children.push(
          this.tokenizeBlock(trimed.slice(token.value.length), column),
        );
        return token;
      }
      case TokenTypes.OrderedList: {
        token.children.push(
          this.tokenizeBlock(trimed.slice(token.value.length), column),
        );
        return token;
      }
      case TokenTypes.Blockquotes: {
        token.children.push(
          this.tokenizeBlock(trimed.slice(token.value.length), column),
        );

        if (this.lines.length <= 0) return token;
        let key = this.lines[0].trimStart().charAt(0);

        while (key === '>') 
        {
          this.nextLine();
          token.children = token.children.concat(
            this.tokenizeBlock(this.currentLine).children,
          );

          if (this.lines.length <= 0) break;
          key = this.lines[0].trimStart().charAt(0);
        }

        return token;
      }
    }

    token.children = this.tokenizeInline(
      trimed.slice(token.value.length),
      column + 1,
    );

    return token;
  }

  tokenize (): Token[] 
  {
    const tokens: Token[] = [];

    while (this.nextLine()) 
    {
      tokens.push(this.tokenizeBlock(this.currentLine));
    }

    return tokens;
  }
}
