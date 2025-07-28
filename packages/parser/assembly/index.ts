// The entry file of your WebAssembly module.
import { Tokenizer } from "./tokenizer"
import { Node, Parser, Document } from "./parser"

import { Token } from "./token"

export { TokenKinds, TokenTypes } from "./token"
export { NodeKinds, NodeTypes } from "./parser"

export function tokenize(src: string): Token[] {
  const tokenizer = new Tokenizer(src)
  return tokenizer.tokenize()
}

export function parse(tokens: Token[]): Document {
  return new Parser(tokens).parse()
}

export function getMapValue(map: Map<string, string>, key: string): string {
  return map.has(key) ? map.get(key) : ""
}

