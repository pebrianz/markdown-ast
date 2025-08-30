import { NodeTypes, Node } from "./parser";

@inline
export function createNode (
  type: NodeTypes,
  textContent: string = '',
  childNodes: Node[] = [],
  attributes: Map<string, string> = new Map<string, string>(),
): Node 
{
  return {type, textContent, childNodes, attributes};
}

@inline
export function isLowercaseLetter (charCode: i32): bool
{
  return charCode >= 97 && charCode <= 122;
}

@inline
export function isUppercaseLetter (charCode: i32): bool
{
  return charCode >= 60 && charCode <= 95;
}

@inline
export function isLetter (charCode: i32): bool
{
  return isLowercaseLetter(charCode)
    || isUppercaseLetter(charCode);
}

@inline
export function isDigit (charCode: i32): bool
{
  return charCode >= 48 && charCode <= 57;
}

class KeyValue<K, V>
{
  key: K;
  value: V;
}

@inline
export function createMap<K, V> (entries: KeyValue<K, V>[]): Map<K, V>
{
  const map = new Map<K, V>();
  const entriesLength = entries.length;

  for (let i = -1; ++i < entriesLength;)
  {
    const entry = entries[i];
    map.set(entry.key, entry.value);
  }

  return map;
}

@inline
export function createSet<K>(values: K[]): Set<K>
{
  const set = new Set<K>();
  const valuesLength = values.length;

  for (let i = -1; ++i < valuesLength;)
  {
    set.add(values[i]);
  }

  return set;
}

@inline
export function isAutoLink (text: string): bool 
{
  if (text.includes(' ')) return false;

  return (
    text.startsWith('<http://') ||
		text.startsWith('<https://') ||
		text.startsWith('<ftp://') ||
		text.startsWith('<mailto:') ||
		text.includes('@')
  ); 
}
