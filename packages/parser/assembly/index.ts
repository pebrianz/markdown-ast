// The entry file of your WebAssembly module.
import {Parser} from './parser';
import {Document} from './parser/ast';
import {Tokenizer} from './tokenizer';
import {Token} from './tokenizer/token';

export {NodeTypes} from './parser/ast';
export {TokenTypes} from './tokenizer/token';
export {createNode} from './utils';

export function getMapValue (
  map: Map<string, string>,
  key: string,
): string | null 
{
  return map.has(key) ? map.get(key) : null;
}

export function parse (tokens: Token[]): Document 
{
  return new Parser().parse(tokens);
}

export function tokenize (source: string): Token[] 
{
  return new Tokenizer().tokenize(source);
}

