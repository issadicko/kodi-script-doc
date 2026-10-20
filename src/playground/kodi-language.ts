import { HighlightStyle, StreamLanguage, indentService, syntaxHighlighting, type StreamParser } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const KEYWORDS = new Set(['let', 'fn', 'if', 'else', 'for', 'in', 'while', 'return', 'break', 'continue', 'try', 'catch']);
const ATOMS = new Set(['true', 'false', 'null']);

/** Names accepted by the `kodi` language mode, shared with the completion source. */
export const kodiKeywords = [...KEYWORDS, ...ATOMS];

type Mode = { kind: 'string'; quote: string } | { kind: 'template'; depth: number };

interface State {
  comment: boolean;
  stack: Mode[];
}

const OPERATOR = /^(\?\.|\?:|\.\.\.|\+\+|--|[+\-*/%]=?|==|!=|<=|>=|&&|\|\||[<>!=?:])/;

/** Token rules of the KodiScript lexer: three string delimiters, `${}` templates, `//` and block comments. */
const parser: StreamParser<State> = {
  name: 'kodi',
  startState: () => ({ comment: false, stack: [] }),
  copyState: (state) => ({ comment: state.comment, stack: state.stack.map((mode) => ({ ...mode })) }),
  token(stream, state) {
    if (state.comment) {
      while (!stream.eol()) {
        if (stream.match('*/')) {
          state.comment = false;
          break;
        }
        stream.next();
      }
      return 'comment';
    }

    const top = state.stack[state.stack.length - 1];
    if (top?.kind === 'string') {
      const start = stream.pos;
      while (!stream.eol()) {
        if (stream.match('${', false)) {
          if (stream.pos > start) return 'string';
          stream.match('${');
          state.stack.push({ kind: 'template', depth: 1 });
          return 'templateBrace';
        }
        const char = stream.next();
        if (char === '\\') stream.next();
        else if (char === top.quote) {
          state.stack.pop();
          return 'string';
        }
      }
      return 'string';
    }

    if (stream.eatSpace()) return null;
    if (stream.match('//')) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match('/*')) {
      state.comment = true;
      while (!stream.eol()) {
        if (stream.match('*/')) {
          state.comment = false;
          break;
        }
        stream.next();
      }
      return 'comment';
    }

    const char = stream.peek() ?? '';
    if (char === '"' || char === "'" || char === '`') {
      stream.next();
      state.stack.push({ kind: 'string', quote: char });
      return 'string';
    }
    if (stream.match(/^\d+(\.\d+)?/)) return 'number';
    if (stream.match(/^[A-Za-z_]\w*/)) {
      const word = stream.current();
      if (KEYWORDS.has(word)) return 'keyword';
      if (ATOMS.has(word)) return 'atom';
      const before = stream.string.slice(Math.max(0, stream.start - 3), stream.start);
      if (/^\s*\(/.test(stream.string.slice(stream.pos))) return 'function';
      return /[^.]\.$|\?\.$/.test(before) ? 'property' : 'variableName';
    }
    if (stream.match(OPERATOR)) return 'operator';

    stream.next();
    if (char === '{' || char === '}') {
      const mode = top?.kind === 'template' ? top : undefined;
      if (mode) {
        mode.depth += char === '{' ? 1 : -1;
        if (mode.depth === 0) {
          state.stack.pop();
          return 'templateBrace';
        }
      }
      return 'bracket';
    }
    if (char === '(' || char === ')' || char === '[' || char === ']') return 'bracket';
    if (char === ',' || char === ';' || char === '.') return 'punctuation';
    return null;
  },
  tokenTable: {
    keyword: t.keyword,
    atom: t.atom,
    number: t.number,
    string: t.string,
    templateBrace: t.special(t.string),
    comment: t.comment,
    operator: t.operator,
    variableName: t.variableName,
    property: t.propertyName,
    function: t.function(t.variableName),
    bracket: t.bracket,
    punctuation: t.punctuation,
  },
  languageData: {
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
    closeBrackets: { brackets: ['(', '[', '{', '"', "'", '`'] },
    indentOnInput: /^\s*[}\])]$/,
  },
};

export const kodiLanguage = StreamLanguage.define(parser);

/** One indent unit after an opening bracket, one less before a closing one, otherwise the previous line's. */
export const kodiIndentation = indentService.of((context, pos) => {
  const { doc } = context.state;
  let lineNumber = doc.lineAt(pos).number - 1;
  while (lineNumber >= 1 && !doc.line(lineNumber).text.trim()) lineNumber--;
  if (lineNumber < 1) return 0;
  const previous = doc.line(lineNumber).text;
  let indent = /^\s*/.exec(previous)![0].replace(/\t/g, ' '.repeat(context.unit)).length;
  if (/[{(\[]\s*(\/\/.*)?$/.test(previous)) indent += context.unit;
  if (/^\s*[}\])]/.test(context.textAfterPos(pos))) indent -= context.unit;
  return Math.max(0, indent);
});

/** Colours come from CSS variables, so the editor follows the site's light and dark themes. */
export const kodiHighlighting = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.comment, color: 'var(--pg-tok-comment)', fontStyle: 'italic' },
    { tag: t.keyword, color: 'var(--pg-tok-keyword)', fontWeight: '600' },
    { tag: [t.atom, t.bool, t.null], color: 'var(--pg-tok-number)' },
    { tag: t.number, color: 'var(--pg-tok-number)' },
    { tag: t.string, color: 'var(--pg-tok-string)' },
    { tag: t.special(t.string), color: 'var(--pg-tok-template)', fontWeight: '600' },
    { tag: t.function(t.variableName), color: 'var(--pg-tok-function)' },
    { tag: t.propertyName, color: 'var(--pg-tok-property)' },
    { tag: t.operator, color: 'var(--pg-tok-operator)' },
    { tag: [t.bracket, t.punctuation], color: 'var(--pg-tok-operator)' },
  ]),
);
