import { EditorState, type Extension } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, temporarilySetTabFocusMode } from '@codemirror/commands';
import { bracketMatching, indentOnInput, indentUnit, syntaxTree } from '@codemirror/language';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  snippet,
  type Completion,
  type CompletionContext,
} from '@codemirror/autocomplete';
import { lintGutter, linter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { KodiScript } from '@issadicko/kodi-script';
import { kodiHighlighting, kodiIndentation, kodiKeywords, kodiLanguage } from './kodi-language';
import { decodeShare, encodeShare } from './share';
import { errorLocation, prettyPrint, typeName } from './result';
import type { NativeEntry } from './natives';
import type { PlaygroundExample } from './examples';

interface PageData {
  examples: PlaygroundExample[];
  natives: NativeEntry[];
  engineVersion: string;
}

interface Layout {
  explorerOpen: boolean;
  explorerWidth: number;
  editorRatio: number;
  bottomHeight: number;
  bottomTab: 'variables' | 'settings';
}

interface Saved {
  script: string;
  variables: string;
  maxOperations: number;
  timeoutMs: number;
  layout: Layout;
}

const STORAGE_KEY = 'kodiscript-playground:v1';
const THEME_KEY = 'starlight-theme';
const DEFAULT_MAX_OPERATIONS = 1_000_000;
const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OPERATIONS_CEILING = 100_000_000;
const TIMEOUT_CEILING_MS = 30_000;
const DEFAULT_LAYOUT: Layout = {
  // On a narrow screen the panes stack, so the Explorer starts closed.
  explorerOpen: !window.matchMedia('(max-width: 860px)').matches,
  explorerWidth: 280,
  editorRatio: 0.5,
  bottomHeight: 200,
  bottomTab: 'variables',
};

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Playground markup is missing ${selector}`);
  return element;
};

/** localStorage can be absent or throw (private windows, blocked site data): never rely on it. */
const storage = {
  read(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* the playground works without persistence */
    }
  },
};

const data = JSON.parse($('#pg-data').textContent ?? '{}') as PageData;
const root = $<HTMLElement>('[data-app]');
const { examples, natives, engineVersion } = data;

// ---- State -----------------------------------------------------------------------------------

function loadSaved(): Saved {
  const first = examples[0];
  const fallback: Saved = {
    script: first.code,
    variables: first.variables ?? '{}',
    maxOperations: DEFAULT_MAX_OPERATIONS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    layout: { ...DEFAULT_LAYOUT },
  };
  const raw = storage.read(STORAGE_KEY);
  let saved = fallback;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<Saved>;
      saved = {
        script: typeof parsed.script === 'string' ? parsed.script : fallback.script,
        variables: typeof parsed.variables === 'string' ? parsed.variables : fallback.variables,
        maxOperations: Number.isInteger(parsed.maxOperations) ? (parsed.maxOperations as number) : fallback.maxOperations,
        timeoutMs: Number.isInteger(parsed.timeoutMs) ? (parsed.timeoutMs as number) : fallback.timeoutMs,
        layout: { ...DEFAULT_LAYOUT, ...(parsed.layout ?? {}) },
      };
    } catch {
      /* damaged entry: start again from the defaults */
    }
  }
  // A share link wins over the saved script, but is only stored once the visitor edits something.
  const shared = decodeShare(window.location.hash);
  if (shared) {
    saved = {
      ...saved,
      script: shared.script,
      variables: shared.variables ?? '{}',
      maxOperations: shared.maxOperations ?? DEFAULT_MAX_OPERATIONS,
      timeoutMs: shared.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    };
  }
  return saved;
}

const state = loadSaved();

function persist() {
  storage.write(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Layout changes must not store a script opened from a share link: only the layout part of the
 * saved entry is rewritten, until the visitor edits the content.
 */
function persistLayout() {
  const raw = storage.read(STORAGE_KEY);
  try {
    const saved = raw ? (JSON.parse(raw) as Partial<Saved>) : {};
    storage.write(STORAGE_KEY, JSON.stringify({ ...saved, layout: state.layout }));
  } catch {
    persist();
  }
}

// ---- Editors ---------------------------------------------------------------------------------

const theme = EditorView.theme({
  '&': { height: '100%', color: 'var(--pg-text)', backgroundColor: 'var(--pg-editor-bg)', fontSize: '0.875rem' },
  '&.cm-focused': { outline: '2px solid var(--pg-accent)', outlineOffset: '-2px' },
  '.cm-scroller': { fontFamily: 'var(--pg-font-mono)', lineHeight: '1.6', overflow: 'auto' },
  '.cm-content': { caretColor: 'var(--pg-text)', padding: '0.5rem 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--pg-text)' },
  '.cm-gutters': {
    backgroundColor: 'var(--pg-gutter-bg)',
    color: 'var(--pg-text-muted)',
    border: 'none',
    borderRight: '1px solid var(--pg-border)',
  },
  '.cm-activeLine': { backgroundColor: 'var(--pg-active-line)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--pg-active-line)', color: 'var(--pg-text)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--pg-selection)',
  },
  '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
    backgroundColor: 'var(--pg-bracket-match)',
    outline: '1px solid var(--pg-accent)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--pg-panel-bg)',
    color: 'var(--pg-text)',
    border: '1px solid var(--pg-border)',
    borderRadius: '0.35rem',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--pg-accent)',
    color: 'var(--pg-accent-contrast)',
  },
  '.cm-completionDetail': { color: 'var(--pg-text-muted)', fontStyle: 'normal', marginLeft: '0.75em' },
  '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionDetail': { color: 'inherit' },
  '.cm-completionInfo': { maxWidth: '24rem', padding: '0.4rem 0.6rem', fontSize: '0.8rem' },
  '.cm-diagnostic-error': { borderLeftColor: 'var(--pg-error)' },
});

/** Esc then Tab leaves the editor; Tab alone indents (CodeMirror's keyboard-trap escape hatch). */
const tabKeys = keymap.of([{ key: 'Escape', run: temporarilySetTabFocusMode }, indentWithTab]);

const variableNames = (): string[] => {
  try {
    const parsed = JSON.parse(variablesView.state.doc.toString());
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? Object.keys(parsed) : [];
  } catch {
    return [];
  }
};

const nativeCompletions: Completion[] = natives.map((entry) => ({
  label: entry.name,
  type: 'function',
  detail: entry.signature.slice(entry.name.length),
  info: entry.description,
  apply: snippet(entry.snippet),
  boost: -1,
}));
const keywordCompletions: Completion[] = kodiKeywords.map((word) => ({ label: word, type: 'keyword', boost: -2 }));

function completionSource(context: CompletionContext) {
  const word = context.matchBefore(/[A-Za-z_]\w*/);
  if (!word || (word.to - word.from < 2 && !context.explicit)) return null;
  const node = syntaxTree(context.state).resolveInner(context.pos, -1).name;
  if (/^(string|comment)$/.test(node)) return null;
  const before = context.state.sliceDoc(Math.max(0, word.from - 1), word.from);
  const variables: Completion[] = variableNames().map((name) => ({ label: name, type: 'variable', boost: 1 }));
  return {
    from: word.from,
    options: before === '.' ? nativeCompletions : [...variables, ...nativeCompletions, ...keywordCompletions],
    validFor: /^\w*$/,
  };
}

const baseExtensions = (): Extension[] => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightActiveLine(),
  drawSelection(),
  history(),
  bracketMatching(),
  closeBrackets(),
  indentOnInput(),
  indentUnit.of('  '),
  lintGutter(),
  theme,
  EditorView.contentAttributes.of({ spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
];

const runKey = {
  key: 'Mod-Enter',
  preventDefault: true,
  run: () => {
    run();
    return true;
  },
};

const scriptView = new EditorView({
  parent: $('[data-script-host]'),
  state: EditorState.create({
    doc: state.script,
    extensions: [
      ...baseExtensions(),
      kodiLanguage,
      kodiIndentation,
      kodiHighlighting,
      autocompletion({ override: [completionSource], icons: false }),
      keymap.of([runKey, ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap]),
      tabKeys,
      EditorView.contentAttributes.of({ 'aria-label': 'KodiScript source' }),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        state.script = update.state.doc.toString();
        persist();
        markCustom();
      }),
    ],
  }),
});

const variablesMessage = $<HTMLElement>('[data-variables-message]');

const variablesView: EditorView = new EditorView({
  parent: $('[data-variables-host]'),
  state: EditorState.create({
    doc: state.variables,
    extensions: [
      ...baseExtensions(),
      json(),
      kodiHighlighting,
      linter(jsonParseLinter()),
      keymap.of([runKey, ...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
      tabKeys,
      EditorView.contentAttributes.of({ 'aria-label': 'Script variables, as a JSON object' }),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        state.variables = update.state.doc.toString();
        persist();
        markCustom();
        checkVariables();
      }),
    ],
  }),
});

type Parsed = { ok: true; value: Record<string, unknown> } | { ok: false; message: string };

function parseVariables(): Parsed {
  const text = variablesView.state.doc.toString();
  if (!text.trim()) return { ok: true, value: {} };
  try {
    const value = JSON.parse(text);
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return { ok: false, message: 'Variables must be a JSON object, for example { "name": "Awa" }.' };
    }
    return { ok: true, value };
  } catch (error) {
    return { ok: false, message: `Variables are not valid JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
}

function checkVariables(): Parsed {
  const parsed = parseVariables();
  variablesMessage.hidden = parsed.ok;
  variablesMessage.textContent = parsed.ok ? '' : parsed.message;
  $('[data-tab="variables"]').toggleAttribute('data-invalid', !parsed.ok);
  return parsed;
}

// ---- Settings --------------------------------------------------------------------------------

const maxOperationsInput = $<HTMLInputElement>('[data-setting="maxOperations"]');
const timeoutInput = $<HTMLInputElement>('[data-setting="timeoutMs"]');
const settingsMessage = $<HTMLElement>('[data-settings-message]');

function showSettings() {
  maxOperationsInput.value = String(state.maxOperations);
  timeoutInput.value = String(state.timeoutMs);
}

function readSettings(save = false): string | null {
  const maxOperations = Number(maxOperationsInput.value);
  const timeoutMs = Number(timeoutInput.value);
  let problem: string | null = null;
  if (!Number.isInteger(maxOperations) || maxOperations < 1 || maxOperations > MAX_OPERATIONS_CEILING) {
    problem = `Max operations must be a whole number between 1 and ${MAX_OPERATIONS_CEILING.toLocaleString('en-US')}.`;
  } else if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > TIMEOUT_CEILING_MS) {
    problem = `Timeout must be a whole number of milliseconds between 1 and ${TIMEOUT_CEILING_MS.toLocaleString('en-US')}.`;
  }
  settingsMessage.hidden = problem === null;
  settingsMessage.textContent = problem ?? '';
  $('[data-tab="settings"]').toggleAttribute('data-invalid', problem !== null);
  if (problem === null) {
    state.maxOperations = maxOperations;
    state.timeoutMs = timeoutMs;
    if (save) persist();
  }
  return problem;
}

[maxOperationsInput, timeoutInput].forEach((input) => input.addEventListener('input', () => readSettings(true)));
$('[data-reset-settings]').addEventListener('click', () => {
  state.maxOperations = DEFAULT_MAX_OPERATIONS;
  state.timeoutMs = DEFAULT_TIMEOUT_MS;
  showSettings();
  readSettings(true);
});

// ---- Running ---------------------------------------------------------------------------------

const resultHost = $<HTMLElement>('[data-result]');
const statusChip = $<HTMLElement>('[data-status]');

function section(title: string, body: string | Node, options: { badge?: string; modifier?: string; muted?: boolean } = {}) {
  const block = document.createElement('section');
  block.className = `block ${options.modifier ?? ''}`.trim();
  const heading = document.createElement('h2');
  heading.textContent = title;
  if (options.badge) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = options.badge;
    heading.append(badge);
  }
  block.append(heading);
  if (typeof body === 'string') {
    const pre = document.createElement('pre');
    pre.textContent = body;
    if (options.muted) pre.className = 'muted';
    block.append(pre);
  } else block.append(body);
  return block;
}

function goToLine(line: number, column?: number) {
  const doc = scriptView.state.doc;
  const target = doc.line(Math.min(Math.max(line, 1), doc.lines));
  const position = target.from + Math.min(Math.max((column ?? 1) - 1, 0), target.length);
  scriptView.dispatch({ selection: { anchor: position }, scrollIntoView: true });
  scriptView.focus();
}

function markError(message: string) {
  const location = errorLocation(message);
  const diagnostics: Diagnostic[] = [];
  if (location && location.line >= 1 && location.line <= scriptView.state.doc.lines) {
    const line = scriptView.state.doc.line(location.line);
    const from = location.column ? Math.min(line.from + location.column - 1, line.to) : line.from;
    diagnostics.push({ from, to: location.column ? Math.min(from + 1, line.to) || line.to : line.to, severity: 'error', message });
  }
  scriptView.dispatch(setDiagnostics(scriptView.state, diagnostics));
  return location;
}

function setStatus(kind: 'ok' | 'error' | 'idle', text: string) {
  statusChip.dataset.kind = kind;
  statusChip.textContent = text;
}

const formatTime = (ms: number) => (ms < 1 ? '<1 ms' : ms < 100 ? `${ms.toFixed(1)} ms` : `${Math.round(ms)} ms`);

function showProblem(title: string, message: string, tab?: 'variables' | 'settings') {
  scriptView.dispatch(setDiagnostics(scriptView.state, []));
  resultHost.replaceChildren(section(title, message, { modifier: 'error' }));
  setStatus('error', 'Not run');
  if (tab) selectTab(tab);
}

function run() {
  const variables = checkVariables();
  if (!variables.ok) return showProblem('Variables', variables.message, 'variables');
  const problem = readSettings();
  if (problem) return showProblem('Settings', problem, 'settings');

  const started = performance.now();
  let result;
  try {
    result = KodiScript.builder(scriptView.state.doc.toString())
      .withVariables(variables.value)
      .silentPrint(true)
      .withMaxOperations(state.maxOperations)
      .withTimeout(state.timeoutMs)
      .execute();
  } catch (error) {
    result = {
      output: [] as string[],
      value: null as unknown,
      errors: [error instanceof Error ? error.message : String(error)],
      errorKind: 'runtime' as const,
    };
  }
  const elapsed = performance.now() - started;
  const blocks: HTMLElement[] = [];

  if (result.errorKind === 'none') {
    scriptView.dispatch(setDiagnostics(scriptView.state, []));
    const hasValue = result.value !== null && result.value !== undefined;
    blocks.push(
      section('Result', hasValue ? prettyPrint(result.value) : 'null', {
        badge: typeName(result.value),
        muted: !hasValue,
      }),
    );
    blocks.push(
      section(
        'Output',
        result.output.length ? result.output.join('\n') : 'Nothing printed. Use print(...) to write here.',
        { badge: result.output.length ? `${result.output.length} line${result.output.length > 1 ? 's' : ''}` : undefined, muted: result.output.length === 0 },
      ),
    );
    setStatus('ok', `Done in ${formatTime(elapsed)}`);
  } else {
    const titles: Record<string, string> = {
      parse: 'Syntax error',
      runtime: 'Runtime error',
      timeout: `Stopped: ${state.timeoutMs.toLocaleString('en-US')} ms time limit reached`,
      max_operations: `Stopped: ${state.maxOperations.toLocaleString('en-US')} operation limit reached`,
    };
    const body = document.createElement('div');
    for (const message of result.errors) {
      const location = markError(message);
      const pre = document.createElement('pre');
      pre.textContent = message;
      body.append(pre);
      if (location) {
        const go = document.createElement('button');
        go.type = 'button';
        go.className = 'link';
        go.textContent = `Line ${location.line}${location.column ? `, column ${location.column}` : ''}: go to line`;
        go.addEventListener('click', () => goToLine(location.line, location.column));
        body.append(go);
      }
    }
    blocks.push(section(titles[result.errorKind] ?? 'Error', body, { modifier: 'error' }));
    setStatus('error', `Failed in ${formatTime(elapsed)}`);
  }
  resultHost.replaceChildren(...blocks);
}

$('[data-run]').addEventListener('click', run);

// ---- Examples --------------------------------------------------------------------------------

const exampleSelect = $<HTMLSelectElement>('[data-example]');
let loadedExample = '';

function replaceDoc(view: EditorView, text: string) {
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, userEvent: 'input.example' });
}

function loadExample(id: string) {
  const example = examples.find((candidate) => candidate.id === id);
  if (!example) return;
  loadedExample = id;
  state.maxOperations = example.maxOperations ?? DEFAULT_MAX_OPERATIONS;
  state.timeoutMs = example.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  showSettings();
  readSettings(true);
  replaceDoc(scriptView, example.code);
  replaceDoc(variablesView, example.variables ?? '{}');
  exampleSelect.value = id;
  scriptView.dispatch({ selection: { anchor: 0 }, scrollIntoView: true });
  run();
}

/** The picker shows "Your script" as soon as the content no longer matches the loaded example. */
function markCustom() {
  const example = examples.find((candidate) => candidate.id === loadedExample);
  const same =
    example !== undefined &&
    scriptView.state.doc.toString() === example.code &&
    variablesView.state.doc.toString() === (example.variables ?? '{}');
  exampleSelect.value = same ? loadedExample : '';
}

exampleSelect.addEventListener('change', () => loadExample(exampleSelect.value));
loadedExample = examples.find((example) => example.code === state.script && (example.variables ?? '{}') === state.variables)?.id ?? '';
markCustom();

// ---- Share -----------------------------------------------------------------------------------

const toast = $<HTMLElement>('[data-toast]');
let toastTimer: number | undefined;

function notify(message: string) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.hidden = true), 3500);
}

$('[data-share]').addEventListener('click', async () => {
  const token = encodeShare({
    script: scriptView.state.doc.toString(),
    variables: variablesView.state.doc.toString(),
    maxOperations: state.maxOperations,
    timeoutMs: state.timeoutMs,
  });
  window.history.replaceState(null, '', `#${token}`);
  try {
    await navigator.clipboard.writeText(window.location.href);
    notify('Link copied. It holds the script, the variables, and the settings.');
  } catch {
    notify('The link is in the address bar: copy it from there.');
  }
});

// ---- Explorer --------------------------------------------------------------------------------

const explorerList = $<HTMLElement>('[data-explorer-list]');
const explorerSearch = $<HTMLInputElement>('[data-explorer-search]');
const explorerCount = $<HTMLElement>('[data-explorer-count]');

function buildExplorer() {
  const categories = new Map<string, NativeEntry[]>();
  for (const entry of natives) categories.set(entry.category, [...(categories.get(entry.category) ?? []), entry]);
  for (const [category, entries] of categories) {
    const details = document.createElement('details');
    details.dataset.category = category;
    const summary = document.createElement('summary');
    summary.textContent = category;
    const count = document.createElement('span');
    count.className = 'badge';
    count.textContent = String(entries.length);
    summary.append(count);
    const list = document.createElement('ul');
    for (const entry of entries) {
      const item = document.createElement('li');
      item.dataset.search = `${entry.name} ${entry.description} ${category}`.toLowerCase();
      const button = document.createElement('button');
      button.type = 'button';
      button.title = `${entry.signature}: ${entry.description}. Click to insert a call.`;
      const signature = document.createElement('span');
      signature.className = 'sig';
      signature.textContent = entry.signature;
      const description = document.createElement('span');
      description.className = 'desc';
      description.textContent = entry.description;
      button.append(signature, description);
      button.addEventListener('click', () => insertCall(entry));
      item.append(button);
      list.append(item);
    }
    details.append(summary, list);
    explorerList.append(details);
  }
}

function insertCall(entry: NativeEntry) {
  const { from, to } = scriptView.state.selection.main;
  snippet(entry.snippet)(scriptView, null, from, to);
  scriptView.focus();
}

function filterExplorer() {
  const query = explorerSearch.value.trim().toLowerCase();
  let shown = 0;
  for (const details of explorerList.querySelectorAll<HTMLDetailsElement>('details')) {
    let visible = 0;
    for (const item of details.querySelectorAll<HTMLElement>('li')) {
      const match = !query || (item.dataset.search ?? '').includes(query);
      item.hidden = !match;
      if (match) visible++;
    }
    details.hidden = visible === 0;
    if (query) details.open = visible > 0;
    shown += visible;
  }
  explorerCount.textContent = query ? `${shown} of ${natives.length} functions` : `${natives.length} functions`;
}

explorerSearch.addEventListener('input', filterExplorer);
explorerSearch.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && explorerSearch.value) {
    explorerSearch.value = '';
    filterExplorer();
  }
});
buildExplorer();
filterExplorer();

const explorerToggle = $<HTMLButtonElement>('[data-explorer-toggle]');

function applyLayout() {
  const { layout } = state;
  root.style.setProperty('--explorer-width', layout.explorerOpen ? `${layout.explorerWidth}px` : '0px');
  root.dataset.explorer = layout.explorerOpen ? 'open' : 'closed';
  explorerToggle.setAttribute('aria-expanded', String(layout.explorerOpen));
  root.style.setProperty('--editor-ratio', String(layout.editorRatio));
  root.style.setProperty('--bottom-height', `${layout.bottomHeight}px`);
}

explorerToggle.addEventListener('click', () => {
  state.layout.explorerOpen = !state.layout.explorerOpen;
  applyLayout();
  persistLayout();
  if (state.layout.explorerOpen) explorerSearch.focus();
});

// ---- Bottom tabs -----------------------------------------------------------------------------

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];

function selectTab(name: 'variables' | 'settings', focus = false, save = true) {
  state.layout.bottomTab = name;
  for (const tab of tabs) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $<HTMLElement>(`#pg-panel-${tab.dataset.tab}`).hidden = !selected;
    if (selected && focus) tab.focus();
  }
  if (save) persistLayout();
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => selectTab(tab.dataset.tab as 'variables' | 'settings'));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    selectTab(tab.dataset.tab === 'variables' ? 'settings' : 'variables', true);
  });
});

// ---- Resizable panes -------------------------------------------------------------------------

interface Resizer {
  element: HTMLElement;
  /** Pixels the pane grows when the pointer moves by `delta` pixels. */
  apply: (delta: number, start: number) => number;
  read: () => number;
  label: () => string;
}

const workspace = $<HTMLElement>('[data-workspace]');
const editorColumn = $<HTMLElement>('[data-editor-column]');

const resizers: Record<string, Resizer> = {
  explorer: {
    element: $('[data-sep="explorer"]'),
    read: () => state.layout.explorerWidth,
    apply: (delta, start) => {
      state.layout.explorerWidth = Math.round(Math.min(Math.max(start + delta, 200), 560));
      return state.layout.explorerWidth;
    },
    label: () => `${state.layout.explorerWidth}px`,
  },
  result: {
    element: $('[data-sep="result"]'),
    read: () => state.layout.editorRatio * 1000,
    apply: (delta, start) => {
      const available = workspace.clientWidth - (state.layout.explorerOpen ? state.layout.explorerWidth : 0) || 1;
      state.layout.editorRatio = Math.min(Math.max((start + (delta * 1000) / available) / 1000, 0.2), 0.8);
      return state.layout.editorRatio * 1000;
    },
    label: () => `${Math.round(state.layout.editorRatio * 100)}% of the width`,
  },
  bottom: {
    element: $('[data-sep="bottom"]'),
    read: () => state.layout.bottomHeight,
    apply: (delta, start) => {
      const max = Math.max(editorColumn.clientHeight - 140, 120);
      state.layout.bottomHeight = Math.round(Math.min(Math.max(start - delta, 90), max));
      return state.layout.bottomHeight;
    },
    label: () => `${state.layout.bottomHeight}px`,
  },
};

for (const [name, resizer] of Object.entries(resizers)) {
  const { element } = resizer;
  const vertical = name === 'bottom';
  const describe = () => {
    element.setAttribute('aria-valuenow', String(Math.round(name === 'result' ? state.layout.editorRatio * 100 : resizer.read())));
    element.setAttribute('aria-valuetext', resizer.label());
  };
  describe();

  element.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    element.dataset.dragging = '';
    const origin = vertical ? event.clientY : event.clientX;
    const start = resizer.read();
    const move = (moveEvent: PointerEvent) => {
      resizer.apply((vertical ? moveEvent.clientY : moveEvent.clientX) - origin, start);
      applyLayout();
      describe();
    };
    const stop = () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', stop);
      element.removeEventListener('pointercancel', stop);
      delete element.dataset.dragging;
      persistLayout();
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', stop);
    element.addEventListener('pointercancel', stop);
  });

  element.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 64 : 16;
    const keys = vertical ? { grow: 'ArrowUp', shrink: 'ArrowDown' } : { grow: 'ArrowRight', shrink: 'ArrowLeft' };
    if (event.key !== keys.grow && event.key !== keys.shrink) return;
    event.preventDefault();
    const delta = event.key === keys.grow ? step : -step;
    resizer.apply(vertical ? -delta : delta, resizer.read());
    applyLayout();
    describe();
    persistLayout();
  });
}

// ---- Theme -----------------------------------------------------------------------------------

const themeButton = $<HTMLButtonElement>('[data-theme-toggle]');
const themeOrder = ['', 'light', 'dark'] as const;
const themeNames = { '': 'Auto', light: 'Light', dark: 'Dark' } as const;

function currentThemeChoice(): (typeof themeOrder)[number] {
  const stored = storage.read(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : '';
}

function applyTheme(choice: (typeof themeOrder)[number]) {
  const resolved = choice || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = resolved;
  themeButton.setAttribute('aria-label', `Theme: ${themeNames[choice]}. Change theme`);
  themeButton.title = `Theme: ${themeNames[choice]}`;
  themeButton.dataset.choice = choice || 'auto';
}

themeButton.addEventListener('click', () => {
  const next = themeOrder[(themeOrder.indexOf(currentThemeChoice()) + 1) % themeOrder.length];
  storage.write(THEME_KEY, next);
  applyTheme(next);
});
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => applyTheme(currentThemeChoice()));
applyTheme(currentThemeChoice());

// ---- Start -----------------------------------------------------------------------------------

document.addEventListener('keydown', (event) => {
  if (!event.defaultPrevented && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});

showSettings();
readSettings();
applyLayout();
selectTab(state.layout.bottomTab, false, false);
checkVariables();
setStatus('idle', 'Ready');
$('[data-engine]').textContent = engineVersion;
run();
