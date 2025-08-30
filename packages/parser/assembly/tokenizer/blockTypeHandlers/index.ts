import {Token, TokenTypes} from '../token';
import {createMap} from '../../utils';

export const blockTypeHandlers = createMap<
  string,
  (text: string, line: u16, column: u16, spaceslength: u8) => Token | null
>([
  {
    key: '#',
    value: (text, line, column, spacesLength) => 
    {
      let mark = text.charAt(0);
      let i: u16 = 0;

      while (text.charAt(++i) === '#') 
      {
        mark += text.charAt(i);
      }

      if (mark.length > 6 || text.charAt(i) !== ' ') return null;
      mark += text.charAt(i);

      return {
        type: TokenTypes.Heading,
        value: mark,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '>',
    value: (text, line, column, spacesLength) => 
    {
      let mark = text.charAt(0);

      if (text.length > 1 && text.charAt(1) !== ' ') return null;
      mark += text.charAt(1);

      return {
        type: TokenTypes.Blockquotes,
        value: mark,
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
      if (!(text.charAt(0) === '|')) return null;

      return {
        type: TokenTypes.TableRow,
        value: '',
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: '-',
    value: (text, line, column, spacesLength) => 
    {
      const textLength = text.length;
      let mark = text.charAt(0);
      let isHorizontalRule = true;

      for (let i = 0; ++i < textLength;) 
      {
        if (text.charAt(i) !== '-') 
        {
          isHorizontalRule = false;
          break;
        }

        mark += text.charAt(i);
      }

      if (isHorizontalRule && mark.length >= 3)
        return {
          type: TokenTypes.HorizontalRule,
          value: mark,
          line,
          column,
          spacesLength,
          children: [],
        };

      if (text.charAt(1) !== ' ') return null;
      mark += text.charAt(1);

      return {
        type: TokenTypes.UnorderedList,
        value: mark,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
  {
    key: 'digit',
    value: (text, line, column, spacesLength) => 
    {
      let mark = text.charAt(0);

      for (let i = 0; ++i <= 2;) 
      {
        mark += text.charAt(i);
      }

      if (
        mark.length !== 3 ||
    		mark.charAt(1) !== '.' ||
    		mark.charAt(2) !== ' '
      ) return null;

      return {
        type: TokenTypes.OrderedList,
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
      let mark = text.charAt(0);

      for (let i = 0; ++i < textLength;) 
      {
        if (mark.length < 3 && text.charAt(i) !== '`') return null;
        mark += text.charAt(i);
      }

      if (mark.length < 3) return null;

      return {
        type: TokenTypes.Fenced,
        value: mark,
        line,
        column,
        spacesLength,
        children: [],
      };
    },
  },
]);

