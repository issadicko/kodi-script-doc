/**
 * SDK versions shown in the install commands and in the SDK table. Update them on each release:
 * `Install.astro` and the SDK overview read them from here.
 * The TypeScript SDK that powers the Playground comes from package.json, not from here.
 */
export const versions = {
  go: 'v0.3.0',
  kotlin: '0.4.0',
  typescript: '0.4.0',
  dart: '^0.4.0',
  php: '^0.2.0',
} as const;

export type Sdk = keyof typeof versions;
