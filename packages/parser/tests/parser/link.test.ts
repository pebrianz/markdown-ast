import {describe, it, expect} from 'vitest';
import {
  NodeTypes,
  getMapValue,
  tokenize,
  parse,
} from '@markdown-ast/parser';

import type {Node} from '../types';

describe('image, link and references link', async () => 
{
  it('should parse link', () => 
  {
    const src = '[markdown-ast](https://github.com/pebrianz/markdown-ast)';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const ecpectedResult: Node = {
      type: NodeTypes.Paragraph,
      textContent: 'markdown-ast',
      childNodes: [
        {
          type: NodeTypes.Link,
          textContent: 'markdown-ast',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: 'markdown-ast',
              childNodes: [],
            },
          ],
        },
      ],
    };
    const paragraph = ast.childNodes[0];
    expect(paragraph).toMatchObject(ecpectedResult);
  });

  it('should parse link with attribute href and title', () =>
  {
    const src =
     '[text](https://github.com/pebrianz/markdown-ast "Markdown Parser")';
    
    const tokens = tokenize(src);
    const ast = parse(tokens);
    const link = ast.childNodes[0].childNodes[0];

    const href = getMapValue(link.attributes, 'href');
    expect(href).toBe('https://github.com/pebrianz/markdown-ast');

    const title = getMapValue(link.attributes, 'title');
    expect(title).toBe('Markdown Parser');
  });

  it('should parse image', () => 
  {
    const src =
			'![markdown-ast](https://github.com/pebrianz/markdown-ast)';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.Paragraph,
      textContent: 'markdown-ast',
      childNodes: [
        {
          type: NodeTypes.Image,
          textContent: 'markdown-ast',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: 'markdown-ast',
              childNodes: [],
            },
          ],
        },
      ],
    };
    const paragraph = ast.childNodes[0];
    expect(paragraph).toMatchObject(expectedResult);

    const link = paragraph.childNodes[0];
    const href = getMapValue(link.attributes, 'href');
    expect(href).toBe('https://github.com/pebrianz/markdown-ast');
  });

  it('should parse link image', () => 
  {
    const src =
			'[![markdown-ast](imageUrl)](https://github.com/pebrianz/markdown-ast)';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.Paragraph,
      textContent: 'markdown-ast',
      childNodes: [
        {
          type: NodeTypes.Link,
          textContent: 'markdown-ast',
          childNodes: [
            {
              type: NodeTypes.Image,
              textContent: 'markdown-ast',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'markdown-ast',
                  childNodes: [],
                },
              ],
            },
          ],
        },
      ],
    };
    const paragraph = ast.childNodes[0];
    expect(paragraph).toMatchObject(expectedResult);

    const link = paragraph.childNodes[0];
    const href = getMapValue(link.attributes, 'href');
    expect(href).toBe('https://github.com/pebrianz/markdown-ast');

    const image = link.childNodes[0];
    const imageUrl = getMapValue(image.attributes, 'href');
    expect(imageUrl).toBe('imageUrl');
  });

  it('should parse token url to link', () => 
  {
    const src = '<https://github.com/pebrianz/markdown-ast>';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.Link,
      textContent: 'https://github.com/pebrianz/markdown-ast',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'https://github.com/pebrianz/markdown-ast',
          childNodes: [],
        },
      ],
    };
    const paragraph = ast.childNodes[0];
    const link = paragraph.childNodes[0];
    expect(link).toMatchObject(expectedResult);

    const href = getMapValue(link.attributes, 'href');
    expect(href).toBe('https://github.com/pebrianz/markdown-ast');
  });

  it('should parse link reference', () => 
  {
    const src =
    '[1]: https://github.com/pebrianz/markdown-ast "Markdown Parser"';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.ReferenceDefinition,
      textContent:
      '1: https://github.com/pebrianz/markdown-ast "Markdown Parser"',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent:
            '1: https://github.com/pebrianz/markdown-ast "Markdown Parser"',
          childNodes: [],
        },
      ],
    };
    expect(ast.childNodes[0].childNodes).toMatchObject([expectedResult]);

    const reference = getMapValue(ast.references, '1');
    expect(reference)
      .toBe(': https://github.com/pebrianz/markdown-ast "Markdown Parser"');
  });

  it('should parse link with attribute reference label', () => 
  {
    const src = '[markdown][reference]';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const link = ast.childNodes[0].childNodes[0];
    const reference = getMapValue(link.attributes, 'reference');
    expect(reference).toBe('reference');
  });

  it('should parse footnode', () =>
  {
    const src = 'this is text.[^1](abc)';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.Paragraph,
      textContent: 'this is text.(abc)',
      childNodes: [
        {
          type: NodeTypes.Text,
          textContent: 'this is text.',
          childNodes: [],
        },
        {
          type: NodeTypes.Footnote,
          textContent: '',
          childNodes: [],
        },
        {
          type: NodeTypes.Text,
          textContent: '(abc)',
          childNodes: [],
        },
      ],
    };
    expect(ast.childNodes).toMatchObject([expectedResult]);
  });

  it('should treat as text, if missing closing parenthesis', () =>
  {
    const src = '[label](url';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node[] = [
      {
        type: NodeTypes.Link,
        textContent: 'label',
        childNodes: [{
          type: NodeTypes.Text,
          textContent: 'label',
          childNodes: [],
        }],
      },
      {
        type: NodeTypes.Text,
        textContent: '(url',
        childNodes: [],
      },
    ];
    expect(ast.childNodes[0].childNodes).toMatchObject(expectedResult);
  });

  it('should treat as text, if delimiter is missing in title', () =>
  {
    const src = '[label](url "title)';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node[] = [
      {
        type: NodeTypes.Link,
        textContent: 'label',
        childNodes: [{
          type: NodeTypes.Text,
          textContent: 'label',
          childNodes: [],
        }],
      },
      {
        type: NodeTypes.Text,
        textContent: '(url "title)',
        childNodes: [],
      },
    ];
    expect(ast.childNodes[0].childNodes).toMatchObject(expectedResult);
  });

  it('should treat bang as text, if next char is not open bracket', () =>
  {
    const src = 'text !alt](src)';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node = {
      type: NodeTypes.Paragraph,
      textContent: 'text !alt](src)',
      childNodes: [{
        type: NodeTypes.Text,
        textContent: 'text !alt](src)',
        childNodes: [],
      }],
    };
    expect(ast.childNodes).toMatchObject([expectedResult]);
  });

  it('should treat referencelabel as another link, if missing close bracket',
    () =>
    {
      const src = '[label][referenceLabel';

      const tokens = tokenize(src);
      const ast = parse(tokens);

      const expectedResult: Node[] = [
        {
          type: NodeTypes.Link,
          textContent: 'label',
          childNodes: [{
            type: NodeTypes.Text,
            textContent: 'label',
            childNodes: [],
          }],
        },
        {
          type: NodeTypes.Link,
          textContent: 'referenceLabel',
          childNodes: [{
            type: NodeTypes.Text,
            textContent: 'referenceLabel',
            childNodes: [],
          }],
        },
      ];
      expect(ast.childNodes[0].childNodes).toMatchObject(expectedResult);
    });
});
