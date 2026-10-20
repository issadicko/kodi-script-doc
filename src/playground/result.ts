/** Helpers that turn a run result into text for the result pane. */

export interface Location {
  line: number;
  column?: number;
}

/** Position quoted in an SDK error message ("line 2", "line 1, col 5", "at line 3, column 2"). */
export function errorLocation(message: string): Location | null {
  const match = /\bline (\d+)(?:,? col(?:umn)? (\d+))?/i.exec(message);
  if (!match) return null;
  return { line: Number(match[1]), column: match[2] ? Number(match[2]) : undefined };
}

export function typeName(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `array (${value.length})`;
  if (typeof value === 'object') return `object (${Object.keys(value).length})`;
  if (typeof value === 'function') return 'function';
  return typeof value;
}

const INDENT = '  ';

/** JSON-like text with sorted keys, the order in which the language prints objects. */
export function prettyPrint(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : String(value);
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return '[function]';
  const inner = INDENT.repeat(depth + 1);
  const outer = INDENT.repeat(depth);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => prettyPrint(item, depth + 1));
    const flat = `[${items.join(', ')}]`;
    if (flat.length <= 72 && !flat.includes('\n')) return flat;
    return `[\n${items.map((item) => inner + item).join(',\n')}\n${outer}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    if (entries.length === 0) return '{}';
    const lines = entries.map(([key, item]) => `${inner}${JSON.stringify(key)}: ${prettyPrint(item, depth + 1)}`);
    return `{\n${lines.join(',\n')}\n${outer}}`;
  }
  return String(value);
}
