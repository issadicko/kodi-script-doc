/**
 * Native functions listed in the Playground explorer, read from the tables of the
 * native-functions page so the two never drift apart.
 */
export interface NativeEntry {
  name: string;
  signature: string;
  description: string;
  category: string;
  /** CodeMirror snippet that inserts a call with its required arguments as fields. */
  snippet: string;
}

const strip = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`/g, '')
    .replace(/\\\|/g, '|')
    .replace(/\s+/g, ' ')
    .trim();

/** Splits a row on its unescaped pipes. */
const cells = (row: string) =>
  row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());

function requiredArguments(signature: string): string[] {
  const open = signature.indexOf('(');
  const close = signature.lastIndexOf(')');
  if (open < 0 || close < open) return [];
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of signature.slice(open + 1, close)) {
    if (char === '[' || char === '(') depth++;
    if (char === ']' || char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts.filter((part) => /^[A-Za-z_]\w*$/.test(part));
}

export function parseNatives(source: string): NativeEntry[] {
  const entries: NativeEntry[] = [];
  let section = '';
  let sub = '';
  for (const line of source.split('\n')) {
    const heading = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      if (heading[1] === '##') {
        section = heading[2].replace(/\s+Functions?$/, '').replace(/\s+Utilities$/, '');
        sub = '';
      } else sub = heading[2];
      continue;
    }
    if (!line.startsWith('|') || /^\|[\s:-]+\|/.test(line)) continue;
    const [nameCell, signatureCell, description] = cells(line);
    if (!nameCell || nameCell === 'Function' || !signatureCell) continue;
    const names = [...nameCell.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    const firstSignature = /`([^`]+)`/.exec(signatureCell)?.[1]?.replace(/\\\|/g, '|');
    if (names.length === 0 || !firstSignature) continue;
    const category = sub && /^(Encoding|Date\/Time)$/.test(section) ? `${section} › ${sub}` : section;
    names.forEach((name, index) => {
      const signature =
        index > 0 && firstSignature.startsWith(`${names[0]}(`)
          ? name + firstSignature.slice(names[0].length)
          : firstSignature;
      const fields = requiredArguments(signature).map((field) => `\${${field}}`);
      entries.push({
        name,
        signature,
        description: strip(description ?? ''),
        category,
        snippet: `${name}(${fields.join(', ')})`,
      });
    });
  }
  return entries;
}
