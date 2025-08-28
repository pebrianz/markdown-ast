import {Token, TokenTypes} from '../token';

export const inlineTypeHandlers = new Map<
  string,
  (text: string, line: u16, column: u16, spaceslength: u8) => Token | null
>();

inlineTypeHandlers.set('*', (text, line, column, spacesLength) => 
{
  let mark = text.charAt(0);
  let i: u16 = 0;

  while (text.charAt(++i) === '*') 
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
});

inlineTypeHandlers.set('`', (text, line, column, spacesLength) => 
{
  const textLength = text.length;
  let value = text.charAt(0);
  let i = 0;

  while (++i < textLength) 
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
});

inlineTypeHandlers.set('|', (text, line, column, spacesLength) => 
{
  return {
    type: TokenTypes.Pipe,
    value: text.charAt(0),
    line,
    column,
    spacesLength,
    children: [],
  };
});

inlineTypeHandlers.set('!', (text, line, column, spacesLength) => 
{
  return {
    type: TokenTypes.Bang,
    value: text.charAt(0),
    line,
    column,
    spacesLength,
    children: [],
  };
});

inlineTypeHandlers.set('[', (text, line, column, spacesLength) => 
{
  return {
    type: TokenTypes.OpenBracket,
    value: text.charAt(0),
    line,
    column,
    spacesLength,
    children: [],
  };
});

inlineTypeHandlers.set(']', (text, line, column, spacesLength) => 
{
  return {
    type: TokenTypes.CloseBracket,
    value: text.charAt(0),
    line,
    column,
    spacesLength,
    children: [],
  };
});

inlineTypeHandlers.set('(', (text, line, column, spacesLength) => 
{
  const textLength = text.length;
  let value = text.charAt(0);
  let i = 0;

  while (++i < textLength) 
  {
    value += text.charAt(i);

    if (text.charAt(i) === ')') break;
  }

  if (value.charAt(value.length - 1) !== ')') return null;

  return {
    type: TokenTypes.LinkURL,
    value,
    line,
    column,
    spacesLength,
    children: [],
  };
});

function isAutoLink (text: string): bool 
{
  // no spaces allowed in autolink
  if (text.includes(' ')) return false;

  // starts with URL scheme or looks like email
  return (
    text.startsWith('<http://') ||
		text.startsWith('<https://') ||
		text.startsWith('<ftp://') ||
		text.startsWith('<mailto:') ||
		text.includes('@')
  ); // simple email detection
}

inlineTypeHandlers.set('<', (text, line, column, spacesLength) => 
{
  const textLength = text.length;
  let value = text.charAt(0);

  if (textLength < 2 || text.charAt(1) === ' ') return null;
  let i = 0;

  while (++i < textLength) 
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
});

inlineTypeHandlers.set(':', (text, line, column, spacesLength) => 
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
});

inlineTypeHandlers.set('=', (text, line, column, spacesLength) => 
{
  let mark = text.charAt(0);
  const secondChar = text.charAt(1);

  if (text.length > 1 && secondChar !== '=') return null;
  mark += secondChar;

  return {
    type: TokenTypes.EqualEqual,
    value: mark,
    line,
    column,
    spacesLength,
    children: [],
  };
});

inlineTypeHandlers.set('~', (text, line, column, spacesLength) => 
{
  let mark = text.charAt(0);
  const secondChar = text.charAt(1);

  if (text.length > 1 && secondChar !== '~') return null;
  mark += secondChar;

  return {
    type: TokenTypes.TildeTilde,
    value: mark,
    line,
    column,
    spacesLength,
    children: [],
  };
});
