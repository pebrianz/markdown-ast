// The entry file of your WebAssembly module.
import { Tokenizer } from "./tokenizer/tokenizer"
// biome-ignore lint/style/useImportType:
import { Parser, Document } from "./parser"
// biome-ignore lint/style/useImportType:
import { Token } from "./tokenizer/token"

export { TokenKinds, TokenTypes } from "./tokenizer/token"
export { NodeKinds, NodeTypes } from "./parser"

export function tokenize(src: string): Token[] {
  return new Tokenizer(src).tokenize()
}

export function parse(tokens: Token[]): Document {
  return new Parser(tokens).parse()
}

export function getMapValue(map: Map<string, string>, key: string): string {
  return map.has(key) ? map.get(key) : ""
}

