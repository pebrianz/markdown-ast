import {describe, it, expect} from 'vitest';
import dedent from 'dedent';
import {
  NodeTypes,
  getMapValue,
  tokenize,
  parse,
} from '@markdown-ast/parser';

import type {Node} from '../types';

describe('table', async ()=>
{
  
  it('should parse table', () => 
  {
    const src = dedent`
      | header1 | header2 | header3 |
      |---|:---:|---:
      | cellA | cellB | cellC |
    `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedHeader: Node = {
      type: NodeTypes.TableHeader,
      textContent: '',
      childNodes: [
        {
          type: NodeTypes.TableCell,
          textContent: ' header1 ',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: ' header1 ',
              childNodes: [],
            },
          ],
        },
        {
          type: NodeTypes.TableCell,
          textContent: ' header2 ',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: ' header2 ',
              childNodes: [],
            },
          ],
        },
        {
          type: NodeTypes.TableCell,
          textContent: ' header3 ',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: ' header3 ',
              childNodes: [],
            },
          ],
        },
      ],
    };
    const expectedRow: Node = {
      type: NodeTypes.TableRow,
      textContent: '',
      childNodes: [
        {
          type: NodeTypes.TableCell,
          textContent: ' cellA ',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: ' cellA ',
              childNodes: [],
            },
          ],
        },
        {
          type: NodeTypes.TableCell,
          textContent: ' cellB ',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: ' cellB ',
              childNodes: [],
            },
          ],
        },
        {
          type: NodeTypes.TableCell,
          textContent: ' cellC ',
          childNodes: [
            {
              type: NodeTypes.Text,
              textContent: ' cellC ',
              childNodes: [],
            },
          ],
        },
      ],
    };
    const expectedTable: Node = {
      type: NodeTypes.Table,
      textContent: '',
      childNodes: [expectedHeader, expectedRow],
    };

    const table = ast.childNodes[0];
    expect(table).toMatchObject(expectedTable);

    const align = getMapValue(table.attributes, 'align');
    expect(align).toBe('left|center|right');
  });

  it('should parse as paragraph if table has no separator/alignment row', () =>
  {
    const src = dedent`
      | header1 | header2 | header3 |
      | cellA | cellB | cellC |
    `;

    const tokens = tokenize(src);
    const ast = parse(tokens);

    const expectedResult: Node[] = [
      {
        type: NodeTypes.Paragraph,
        textContent: '| header1 | header2 | header3 |',
        childNodes: [
          {
            type: NodeTypes.Text,
            textContent: '| header1 | header2 | header3 |',
            childNodes: [],
          },
        ],
      },
      {
        type: NodeTypes.Paragraph,
        textContent: '| cellA | cellB | cellC |',
        childNodes: [
          {
            type: NodeTypes.Text,
            textContent: '| cellA | cellB | cellC |',
            childNodes: [],
          },
        ],
      },
    ];
    expect(ast.childNodes).toMatchObject(expectedResult);
  });
});
