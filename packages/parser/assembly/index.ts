// The entry file of your WebAssembly module.
import {Tokenizer} from './tokenizer/tokenizer';
import {Parser, Document} from './parser';
import {Token} from './tokenizer/token';

export {TokenTypes} from './tokenizer/token';
export {NodeTypes} from './parser';
export {createNode} from './utils';

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
