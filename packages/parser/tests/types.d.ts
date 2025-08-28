import type {createNode} from '@markdown-ast/parser';

export type Node = Omit<
  Omit<ReturnType<typeof createNode>, 'attributes'>,
  'childNodes'
> & {childNodes: Node[]};
