// The entry file of your WebAssembly module.
import {Tokenizer} from './tokenizer/tokenizer';
import {Parser, Document, Node, NodeTypes} from './parser';
import {Token} from './tokenizer/token';

export {TokenTypes} from './tokenizer/token';
export {NodeTypes} from './parser';

export function tokenize (src: string): Token[] 
{
  return new Tokenizer(src).tokenize();
}

export function parse (tokens: Token[]): Document 
{
  return new Parser(tokens).parse();
}

export function getMapValue (
  map: Map<string, string>,
  key: string,
): string | null 
{
  return map.has(key) ? map.get(key) : null;
}

export function createNode (
  type: NodeTypes,
  textContent: string = '',
  childNodes: Node[] = [],
  attributes: Map<string, string> = new Map<string, string>(),
): Node 
{
  return {type, textContent, childNodes, attributes};
}
