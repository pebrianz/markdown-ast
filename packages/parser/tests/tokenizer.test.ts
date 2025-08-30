import {describe, it, expect} from 'vitest';
import dedent from 'dedent';

import {tokenize, TokenTypes} from '@markdown-ast/parser';
import type {Token} from '../assembly/tokenizer/token';

describe('lexer', async () => 
{
  it('should tokenize paragraph and text', () => 
  {
    const src = 'this is a paragraph';

    const tokens = tokenize(src);

    const expectedParagraph: Token = {
      type: TokenTypes.Paragraph,
      value: '',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Text,
          value: 'this is a paragraph',
          line: 1,
          column: 1,
          spacesLength: 0,
          children: [],
        },
      ],
    };
    expect(tokens).toEqual([expectedParagraph]);
  });

  it('should tokenize heading with custom id', () =>
  {
    const src = '# Heading {#this-is_custom:ID123}';

    const tokens = tokenize(src);

    const heading: Token = {
      type: TokenTypes.Heading,
      value: '# ',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Text,
          value: 'Heading ',
          line: 1,
          column: 3,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.CustomId,
          value: '{#this-is_custom:ID123}',
          line: 1,
          column: 11,
          spacesLength: 0,
          children: [],
        },
      ],
    };
    expect(tokens).toEqual([heading]);
  });

  it('should tokenize blockquotes', () => 
  {
    const src = dedent`
      > this is blockquotes
      > 
    `;

    const tokens = tokenize(src);

    const blockquotes: Token = {
      type: TokenTypes.Blockquotes,
      value: '> ',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Paragraph,
          value: '',
          line: 1,
          column: 3,
          spacesLength: 0,
          children: [
            {
              type: TokenTypes.Text,
              value: 'this is blockquotes',
              line: 1,
              column: 3,
              spacesLength: 0,
              children: [],
            },
          ],
        },
        {
          type: TokenTypes.Blankline,
          value: '',
          line: 2,
          column: 2,
          spacesLength: 0,
          children: [],
        },
      ],
    };

    expect(tokens).toEqual([blockquotes]);
  });

  it('should tokenize table row and pipe', () => 
  {
    const src = '|----|----|';

    const tokens = tokenize(src);
    const markPipe = '|';

    const tableRow: Token = {
      type: TokenTypes.TableRow,
      value: '',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 1,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.Text,
          value: '----',
          line: 1,
          column: 2,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 6,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.Text,
          value: '----',
          line: 1,
          column: 7,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.Pipe,
          value: markPipe,
          line: 1,
          column: 11,
          spacesLength: 0,
          children: [],
        },
      ],
    };

    expect(tokens).toContainEqual(tableRow);
  });

  it('should tokenize unordered list', () => 
  {
    const src = dedent`
      - first
      - second
    `;

    const tokens = tokenize(src);

    const firstOrderedList: Token = {
      type: TokenTypes.UnorderedList,
      value: '- ',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Paragraph,
          value: '',
          line: 1,
          column: 3,
          spacesLength: 0,
          children: [
            {
              type: TokenTypes.Text,
              value: 'first',
              line: 1,
              column: 3,
              spacesLength: 0,
              children: [],
            },
          ],
        },
      ],
    };
    const secondOrderedList: Token = {
      type: TokenTypes.UnorderedList,
      value: '- ',
      line: 2,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Paragraph,
          value: '',
          line: 2,
          column: 3,
          spacesLength: 0,
          children: [
            {
              type: TokenTypes.Text,
              value: 'second',
              line: 2,
              column: 3,
              spacesLength: 0,
              children: [],
            },
          ],
        },
      ],
    };
    expect(tokens).toEqual([firstOrderedList, secondOrderedList]);
  });

  it('should tokenize ordered list', () => 
  {
    const src = dedent`
      1. first
      2. second
    `;

    const tokens = tokenize(src);

    const firstOrderedList: Token = {
      type: TokenTypes.OrderedList,
      value: '1. ',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Paragraph,
          value: '',
          line: 1,
          column: 4,
          spacesLength: 0,
          children: [
            {
              type: TokenTypes.Text,
              value: 'first',
              line: 1,
              column: 4,
              spacesLength: 0,
              children: [],
            },
          ],
        },
      ],
    };
    const secondOrderedList: Token = {
      type: TokenTypes.OrderedList,
      value: '2. ',
      line: 2,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Paragraph,
          value: '',
          line: 2,
          column: 4,
          spacesLength: 0,
          children: [
            {
              type: TokenTypes.Text,
              value: 'second',
              line: 2,
              column: 4,
              spacesLength: 0,
              children: [],
            },
          ],
        },
      ],
    };
    expect(tokens).toEqual([firstOrderedList, secondOrderedList]);
  });

  it('should tokenize horizontal rule', () => 
  {
    const src = '------';

    const tokens = tokenize(src);

    const expectedResult: Token = {
      type: TokenTypes.HorizontalRule,
      value: '------',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [],
    };
    expect(tokens).toEqual([expectedResult]);
  });

  it('should tokenize link', () => 
  {
    const src = '[markdown-ast](https://github.com/pebrianz/markdown-ast)';

    const tokens = tokenize(src);

    const ecpectedResult: Token = {
      type: TokenTypes.Paragraph,
      value: '',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.OpenBracket,
          value: '[',
          line: 1,
          column: 1,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.Text,
          value: 'markdown-ast',
          line: 1,
          column: 2,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.CloseBracket,
          value: ']',
          line: 1,
          column: 14,
          spacesLength: 0,
          children: [],
        },
        {
          type: TokenTypes.LinkURL,
          value: '(https://github.com/pebrianz/markdown-ast)',
          line: 1,
          column: 15,
          spacesLength: 0,
          children: [],
        },
      ],
    };
    expect(tokens).toEqual([ecpectedResult]);
  });

  it('should tokenize escape character', () => 
  {
    const src = dedent`\# \*paragraph\*`;

    const tokens = tokenize(src);

    const expectedResult: Token = {
      type: TokenTypes.Paragraph,
      value: '',
      line: 1,
      column: 1,
      spacesLength: 0,
      children: [
        {
          type: TokenTypes.Text,
          value: '# *paragraph*',
          line: 1,
          column: 1,
          spacesLength: 0,
          children: [],
        },
      ],
    };
    expect(tokens).toContainEqual(expectedResult);
  });
});
