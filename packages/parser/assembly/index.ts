// The entry file of your WebAssembly module.
import { Tokenizer } from "./tokenizer"
import { Node, Parser } from "./parser"

import { Token } from "./token"

export { TokenKinds, TokenTypes } from "./token"
export { NodeKinds, NodeTypes } from "./parser"

export function tokenize(src: string): Token[] {
  const tokenizer = new Tokenizer(src)
  return tokenizer.tokenize()
}

export function parse(tokens: Token[]): Node {
  return new Parser(tokens).parse()
}

class AddParams {
  a: u8
  b: u8
}

export function add(args: AddParams): AddParams {

  if (args.a < args.b) {
    console.log("a grether than b")
  }

  return {
    a: args.a,
    b: args.b,
  }
}


