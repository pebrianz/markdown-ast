import {describe, it, expect} from 'vitest';
import dedent from 'dedent';
import {
  NodeTypes,
  tokenize,
  getMapValue,
  parse,
} from '@markdown-ast/parser';

import type {Node} from './types';

describe('parser', async () => 
{
  it('should parse paragraph and text', () => 
  {
    const src = 'this is paragraph';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedParagraph: Node = {
      type: NodeTypes.Paragraph,
      textContent: 'this is paragraph',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'this is paragraph',
          childNodes: [],
        },
      ],
    };

    expect(ast.childNodes).toMatchObject([expectedParagraph]);
  });

  it('should parse paragraph and skip blankline', () => 
  {
    const src = dedent`
      this is first paragraph

      
      this is second paragraph
    `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node[] = [
      {
        type: NodeTypes.Paragraph,
        textContent: 'this is first paragraph',
        childNodes: [
          {
            type: NodeTypes.Text,
            textContent: 'this is first paragraph',
            childNodes: [],
          },
        ],
      },
      {
        type: NodeTypes.Paragraph,
        textContent: 'this is second paragraph',
        childNodes: [
          {
            type: NodeTypes.Text,
            textContent: 'this is second paragraph',
            childNodes: [],
          },
        ],
      },
    ];

    expect(ast.childNodes).toMatchObject(expectedResult);
  });

  it('should parse heading', () => 
  {
    const src = '# This is Heading 1';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedHeading: Node = {
      type: NodeTypes.Heading,
      textContent: 'This is Heading 1',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'This is Heading 1',
          childNodes: [],
        },
      ],
    };
    const heading = ast.childNodes[0];
    const id = getMapValue(heading.attributes, 'id');
    expect(id).toBe('This-is-Heading-1');
    expect(heading).toMatchObject(expectedHeading);
  });

  it('should parse heading with custom id', () => 
  {
    const src = '# heading {#custom-id}';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedHeading: Node = {
      type: NodeTypes.Heading,
      textContent: 'heading ',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'heading ',
          childNodes: [],
        },
      ],
    };
    const heading = ast.childNodes[0];
    const id = getMapValue(heading.attributes, 'id');
    expect(id).toBe('custom-id');
    expect(heading).toMatchObject(expectedHeading);
  });

  it.each([['*']])('should parse bold italic', (mark) => 
  {
    let src = `${mark}italic${mark}`;
    src += ` ${mark + mark}bold${mark + mark} `;
    src += `${mark + mark + mark}italicbold${mark + mark + mark}`;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedItalic: Node = {
      type: NodeTypes.Italic,
      textContent: 'italic',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'italic',
          childNodes: [],
        },
      ],
    };
    const expectedBold: Node = {
      type: NodeTypes.Bold,
      textContent: 'bold',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'bold',
          childNodes: [],
        },
      ],
    };
    const expectedItalicBold: Node = {
      type: NodeTypes.BlockItalic,
      textContent: 'italicbold',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'italicbold',
          childNodes: [],
        },
      ],
    };

    const space: Node = {
      type: NodeTypes.Text,
      textContent: ' ',
      childNodes: [],
    };

    const expectedResult = [
      expectedItalic,
      space,
      expectedBold,
      space,
      expectedItalicBold,
    ];

    const paragraph = ast.childNodes[0];
    expect(paragraph.childNodes).toMatchObject(expectedResult);
  });

  it('should parse code', () => 
  {
    const src = '`code \\` **hello** world` and text';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node[] = [
      {
        type: NodeTypes.Code,
        textContent: 'code ` **hello** world',
        childNodes: [],
      },
      {
        type: NodeTypes.Text,
        textContent: ' and text',
        childNodes: [],
      },
    ];

    const paragraph = ast.childNodes[0];
    expect(paragraph.childNodes).toMatchObject(expectedResult);
  });

  it('should parse horizontal rule', () => 
  {
    const src = '---';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.HorizontalRule,
      textContent: '',
      childNodes: [],
    };
    expect(ast.childNodes[0]).toMatchObject(expectedResult);
  });

  it('should parse highlight', () => 
  {
    const src = 'this is ==highlight==';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.Highlight,
      textContent: 'highlight',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'highlight',
          childNodes: [],
        },
      ],
    };
    const paragraph = ast.childNodes[0];
    expect(paragraph.childNodes[1]).toMatchObject(expectedResult);
  });

  it('should parse html tag', () => 
  {
    const src = dedent`
			<div foo="bar">this is
			text</div>
		`;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expected: Node[] = [
      {
        type: NodeTypes.Paragraph,
        textContent: '<div foo="bar">this is',
        childNodes: [
          {
            type: NodeTypes.HtmlTag,
            textContent: '<div foo="bar">',
            childNodes: [],
          },
          {
            type: NodeTypes.Text,
            textContent: 'this is',
            childNodes: [],
          },
        ],
      },
      {
        type: NodeTypes.Paragraph,
        textContent: 'text</div>',
        childNodes: [
          {
            type: NodeTypes.Text,
            textContent: 'text',
            childNodes: [],
          },
          {
            type: NodeTypes.HtmlTag,
            textContent: '</div>',
            childNodes: [],
          },
        ],
      },
    ];
    expect(ast.childNodes).toMatchObject(expected);
  });

  it('should parse fenced code block', () => 
  {
    const src = dedent`
      \`\`\`ts
      let a = "hello world"
      console.log(a)
      \`\`\`
    `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expected: Node = {
      type: NodeTypes.Fenced,
      childNodes: [],
      textContent: '```ts\nlet a = "hello world"\nconsole.log(a)',
    };
    expect(ast.childNodes[0]).toMatchObject(expected);
  });
});
