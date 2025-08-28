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

    const link = paragraph.childNodes[0];
    const href = getMapValue(link.attributes, 'href');
    expect(href).toBe('https://github.com/pebrianz/markdown-ast');
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
    const src = '[1]: https://github.com/pebrianz/markdown-ast';

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const link = getMapValue(ast.linkReferences, '1');
    expect(link).toBe('https://github.com/pebrianz/markdown-ast');
  });
});
