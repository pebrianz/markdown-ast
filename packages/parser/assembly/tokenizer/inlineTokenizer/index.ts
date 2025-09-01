import {Token, TokenTypes} from '../token';
import {createMap, isAutoLink} from '../../utils';

export const inlineTokenizer = createMap<
  string,
  (text: string, line: u16, column: u16, spaceslength: u8) => Token | null
>([
  {
    key: '*',
    value: (text, line, column, spacesLength) => 
    {
      let mark = text.charAt(0);

      for (let i = 0; text.charAt(++i) === '*';) 
      {
        mark += text.charAt(i);
      }

      if (mark.length > 3) return null;

      return {
        type: TokenTypes.Asterisk,
        value: mark,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '`',
    value: (text, line, column, spacesLength) => 
    {
      const textLength = text.length;
      let value = text.charAt(0);

      for (let i = 0; ++i < textLength;) 
      {
        if (text.charAt(i) === '\\') 
        {
          value += text.charAt(i) + text.charAt(++i);
          continue;
        }
        
        value += text.charAt(i);
        if (text.charAt(i) === '`') break;
      }
      
      return {
        type: TokenTypes.Code,
        value,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '|',
    value: (text, line, column, spacesLength) => 
    {
      return {
        type: TokenTypes.Pipe,
        value: text.charAt(0),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '!',
    value: (text, line, column, spacesLength) => 
    {
      return {
        type: TokenTypes.Bang,
        value: text.charAt(0),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '[',
    value: (text, line, column, spacesLength) => 
    {
      return {
        type: TokenTypes.OpenBracket,
        value: text.charAt(0),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: ']',
    value: (text, line, column, spacesLength) => 
    {
      return {
        type: TokenTypes.CloseBracket,
        value: text.charAt(0),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '(',
    value: (text, line, column, spacesLength) => 
    {
      return {
        type: TokenTypes.OpenParen,
        value: text.charAt(0),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: ')',
    value: (text, line, column, spacesLength) => 
    {
      return {
        type: TokenTypes.CloseParen,
        value: text.charAt(0),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '"',
    value: (text, line, column, spacesLength) =>
    {
      const textLength = text.length;
      let value = text.charAt(0);

      for(let i = 0; ++i < textLength;)
      {
        if(i >= textLength) return null;
        const char = text.charAt(i);
        value += char;
        if(char === '"') break;
      }

      return {
        type: TokenTypes.Delimited,
        value,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '\'',
    value: (text, line, column, spacesLength) =>
    {
      const textLength = text.length;
      let value = text.charAt(0);

      for(let i = 0; ++i;)
      {
        if(i >= textLength) return null;
        const char = text.charAt(i);
        value += char;
        if(char === '\'') break;
      }

      return {
        type: TokenTypes.Delimited,
        value,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '{',
    value: (text, line, column, spacesLength) =>
    {
      if(text.charAt(1) !== '#') return null;

      const textLength = text.length;
      let value = text.charAt(0) + text.charAt(1) + text.charAt(2);

      for (let i = 2; ++i < textLength;)
      {
        const char = text.charAt(i);
        if(char === ' ') return null;

        value += char;
        if(char === '}') break;
      }

      return {
        type: TokenTypes.CustomId,
        value,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '<',
    value: (text, line, column, spacesLength) => 
    {
      const textLength = text.length;
      if (textLength < 2 || text.charAt(1) === ' ') return null;

      let value = text.charAt(0);
      for (let i = 0; ++i < textLength;) 
      {
        const char = text.charAt(i);
        value += char;
        if (char === '>') break;
      }
      if (value.charAt(value.length - 1) !== '>') return null;
      
      if (isAutoLink(value))
        return {
          type: TokenTypes.AutoLink,
          value,
          line,
          column,
          spacesLength,
          children: [],
        };
        
      return {
        type: TokenTypes.HtmlTag,
        value,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: ':',
    value: (text, line, column, spacesLength) => 
    {
      if (text.length < 2 || text.charAt(1) !== ' ') return null;

      return {
        type: TokenTypes.ColonWithSpace,
        value: text.charAt(0) + text.charAt(1),
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '=',
    value: (text, line, column, spacesLength) => 
    {
      const secondChar = text.charAt(1);
      if (text.length > 1 && secondChar !== '=') return null;

      return {
        type: TokenTypes.EqualEqual,
        value: text.charAt(0) + secondChar,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '~',
    value: (text, line, column, spacesLength) => 
    {
      const secondChar = text.charAt(1);
      if (text.length > 1 && secondChar !== '~') return null;

      return {
        type: TokenTypes.TildeTilde,
        value: text.charAt(0) + secondChar,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
]);
