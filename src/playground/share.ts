/** State carried by a share link: everything needed to reproduce a run. */
export interface SharedState {
  script: string;
  variables?: string;
  maxOperations?: number;
  timeoutMs?: number;
}

const PREFIX = 'share=';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(token: string): string {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

/** Hash fragment (without `#`) that reopens the given state. */
export function encodeShare(state: SharedState): string {
  const compact = { s: state.script, v: state.variables, o: state.maxOperations, t: state.timeoutMs };
  return PREFIX + toBase64Url(JSON.stringify(compact));
}

/** Reads a hash fragment produced by `encodeShare`; null when it is not a share link or is damaged. */
export function decodeShare(hash: string): SharedState | null {
  const fragment = hash.replace(/^#/, '');
  if (!fragment.startsWith(PREFIX)) return null;
  try {
    const raw = JSON.parse(fromBase64Url(fragment.slice(PREFIX.length)));
    if (typeof raw !== 'object' || raw === null || typeof raw.s !== 'string') return null;
    return {
      script: raw.s,
      variables: typeof raw.v === 'string' ? raw.v : undefined,
      maxOperations: typeof raw.o === 'number' ? raw.o : undefined,
      timeoutMs: typeof raw.t === 'number' ? raw.t : undefined,
    };
  } catch {
    return null;
  }
}
