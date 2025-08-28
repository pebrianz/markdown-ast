import {describe, it, expect} from 'vitest';
import dedent from 'dedent';

import {
  NodeTypes,
  getMapValue,
  tokenize,
  parse,
} from '@markdown-ast/parser';

import type {Node} from '../types';

describe('list', async () => 
{
  it('should parse list', () => 
  {
    const src = dedent`
      5. first item
      9. second item
    `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const orderedList: Node = {
      type: NodeTypes.List,
      textContent: '',
      childNodes: [
        {
          type: NodeTypes.ListItem,
          textContent: '',
          childNodes: [
            {
              type: NodeTypes.Paragraph,
              textContent: 'first item',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'first item',
                  childNodes: [],
                },
              ],
            },
          ],
        },
        {
          type: NodeTypes.ListItem,
          textContent: '',
          childNodes: [
            {
              type: NodeTypes.Paragraph,
              textContent: 'second item',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'second item',
                  childNodes: [],
                },
              ],
            },
          ],
        },
      ],
    };

    const ordered = ast.childNodes[0];
    expect(ordered).toMatchObject(orderedList);

    const typeOrdered = getMapValue(ordered.attributes, 'type');
    const startOrdered = getMapValue(ordered.attributes, 'start');
    expect({typeOrdered, startOrdered}).toMatchObject({
      typeOrdered: 'ordered',
      startOrdered: '5',
    });
  });

  it('should parse nested list', () => 
  {
    const src = dedent`
	     - list
	       - nested list
	   `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedList: Node = {
      type: NodeTypes.List,
      textContent: '',
      childNodes: [
        {
          type: NodeTypes.ListItem,
          textContent: '',
          childNodes: [
            {
              type: NodeTypes.Paragraph,
              textContent: 'list',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'list',
                  childNodes: [],
                },
              ],
            },
            {
              type: NodeTypes.List,
              textContent: '',
              childNodes: [
                {
                  type: NodeTypes.ListItem,
                  textContent: '',
                  childNodes: [
                    {
                      type: NodeTypes.Paragraph,
                      textContent: 'nested list',
                      childNodes: [
                        {
                          type: NodeTypes.Text,
                          textContent: 'nested list',
                          childNodes: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const list = ast.childNodes[0];
    expect(list).toMatchObject(expectedList);
  });

  it('should parse block inside list', () => 
  {
    const src = dedent`
	     - first item of list

	       this is paragraph inside first item

	       > this is blockquotes

	     - second item of list
	   `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedList: Node = {
      type: NodeTypes.List,
      textContent: '',
      childNodes: [
        {
          type: NodeTypes.ListItem,
          textContent: '',
          childNodes: [
            {
              type: NodeTypes.Paragraph,
              textContent: 'first item of list',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'first item of list',
                  childNodes: [],
                },
              ],
            },
            {
              type: NodeTypes.Paragraph,
              textContent: 'this is paragraph inside first item',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'this is paragraph inside first item',
                  childNodes: [],
                },
              ],
            },
            {
              type: NodeTypes.Blockquotes,
              textContent: '',
              childNodes: [
                {
                  type: NodeTypes.Paragraph,
                  textContent: 'this is blockquotes',
                  childNodes: [
                    {
                      type: NodeTypes.Text,
                      textContent: 'this is blockquotes',
                      childNodes: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: NodeTypes.ListItem,
          textContent: '',
          childNodes: [
            {
              type: NodeTypes.Paragraph,
              textContent: 'second item of list',
              childNodes: [
                {
                  type: NodeTypes.Text,
                  textContent: 'second item of list',
                  childNodes: [],
                },
              ],
            },
          ],
        },
      ],
    };
    const list = ast.childNodes[0];
    expect(list).toMatchObject(expectedList);
  });
});
