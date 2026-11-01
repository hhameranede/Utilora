export interface TextMetrics {
  words: number;
  charactersTotal: number;
  charactersWithoutSpaces: number;
  letters: number;
  digits: number;
  spaces: number;
  punctuation: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function getTextMetrics(text: string): TextMetrics {
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’_-]*/gu) ?? [];
  const characters = Array.from(text);
  const charactersWithoutSpaces = characters.filter((char) => !/\s/u.test(char)).length;
  const letters = characters.filter((char) => /\p{L}/u.test(char)).length;
  const digits = characters.filter((char) => /\p{N}/u.test(char)).length;
  const spaces = characters.filter((char) => /\s/u.test(char)).length;
  const punctuation = characters.filter((char) => /\p{P}/u.test(char)).length;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/u).length : 0;

  return {
    words: words.length,
    charactersTotal: characters.length,
    charactersWithoutSpaces,
    letters,
    digits,
    spaces,
    punctuation,
    lines: text ? text.split(/\r?\n/u).length : 0,
    paragraphs,
    readingTimeMinutes: words.length ? Math.max(1, Math.ceil(words.length / 200)) : 0,
    speakingTimeMinutes: words.length ? Math.max(1, Math.ceil(words.length / 130)) : 0,
  };
}

export type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab';

export function convertTextCase(text: string, mode: CaseMode): string {
  if (mode === 'upper') return text.toLocaleUpperCase();
  if (mode === 'lower') return text.toLocaleLowerCase();
  if (mode === 'sentence') {
    const lower = text.toLocaleLowerCase();
    return lower.replace(/(^|[.!?؟。！؟]\s+)(\p{L})/gu, (_match, prefix: string, letter: string) => prefix + letter.toLocaleUpperCase());
  }

  const words = text.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
  if (mode === 'title') return text.toLocaleLowerCase().replace(/(^|[^\p{L}\p{M}\p{N}'’])(\p{L})/gu, (_m, p: string, c: string) => p + c.toLocaleUpperCase());

  const normalized = words.map((word) => word.toLocaleLowerCase());
  if (mode === 'snake') return normalized.join('_');
  if (mode === 'kebab') return normalized.join('-');
  return normalized.map((word, index) => index === 0 ? word : word[0].toLocaleUpperCase() + word.slice(1)).join('');
}

export interface DedupeOptions {
  caseSensitive: boolean;
  trimWhitespace: boolean;
  removeEmptyLines: boolean;
}

export function removeDuplicateTextLines(text: string, options: DedupeOptions): { text: string; duplicatesRemoved: number } {
  const seen = new Set<string>();
  const output: string[] = [];
  let duplicatesRemoved = 0;

  for (const originalLine of text.split(/\r?\n/u)) {
    const line = options.trimWhitespace ? originalLine.trim() : originalLine;
    if (options.removeEmptyLines && line.length === 0) continue;
    const key = options.caseSensitive ? line : line.toLocaleLowerCase();
    if (seen.has(key)) {
      duplicatesRemoved += 1;
      continue;
    }
    seen.add(key);
    output.push(line);
  }

  return { text: output.join('\n'), duplicatesRemoved };
}

export type SortMode = 'alphabetical-asc' | 'alphabetical-desc' | 'numeric' | 'length' | 'reverse';

export function sortTextLines(text: string, mode: SortMode, ignoreCase = true): string {
  const lines = text.split(/\r?\n/u);
  if (mode === 'reverse') return lines.reverse().join('\n');
  if (mode === 'length') return [...lines].sort((a, b) => a.length - b.length || a.localeCompare(b)).join('\n');
  if (mode === 'numeric') {
    return [...lines].sort((a, b) => {
      const left = Number(a.trim());
      const right = Number(b.trim());
      if (Number.isNaN(left) && Number.isNaN(right)) return a.localeCompare(b);
      if (Number.isNaN(left)) return 1;
      if (Number.isNaN(right)) return -1;
      return left - right;
    }).join('\n');
  }
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: ignoreCase ? 'base' : 'variant' });
  return [...lines].sort((a, b) => mode === 'alphabetical-desc' ? collator.compare(b, a) : collator.compare(a, b)).join('\n');
}

export interface DiffBlock {
  type: 'unchanged' | 'added' | 'removed';
  value: string;
}

export function createTextDiff(original: string, modified: string, granularity: 'lines' | 'words' | 'chars'): {
  blocks: DiffBlock[];
  additions: number;
  deletions: number;
} {
  const tokenize = (value: string): string[] => {
    if (granularity === 'chars') return Array.from(value);
    if (granularity === 'words') return value.split(/(\s+)/u).filter(Boolean);
    return value.split(/(\n)/u).filter(Boolean);
  };

  const left = tokenize(original);
  const right = tokenize(modified);
  const rows = left.length + 1;
  const cols = right.length + 1;
  if (rows * cols > 300_000) throw new Error('The comparison is too large. Please compare shorter text sections.');

  const table = new Uint32Array(rows * cols);
  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      const index = i * cols + j;
      table[index] = left[i] === right[j]
        ? 1 + table[(i + 1) * cols + j + 1]
        : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
    }
  }

  const raw: DiffBlock[] = [];
  let i = 0;
  let j = 0;
  let additions = 0;
  let deletions = 0;
  const push = (type: DiffBlock['type'], value: string) => {
    const previous = raw[raw.length - 1];
    if (previous?.type === type) previous.value += value;
    else raw.push({ type, value });
  };

  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      push('unchanged', left[i]);
      i += 1;
      j += 1;
    } else if (i < left.length && (j === right.length || table[(i + 1) * cols + j] >= table[i * cols + j + 1])) {
      push('removed', left[i]);
      deletions += 1;
      i += 1;
    } else {
      push('added', right[j]);
      additions += 1;
      j += 1;
    }
  }

  return { blocks: raw, additions, deletions };
}

export function processJson(text: string, mode: 'validate' | 'format' | 'minify', indent: 2 | 4): { output: string; valid: boolean } {
  const parsed: unknown = JSON.parse(text);
  return {
    output: mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent),
    valid: true,
  };
}

export function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function decodeBase64Utf8(value: string): string {
  const binary = atob(value.replace(/\s+/gu, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function transformUrl(value: string, mode: 'encode' | 'decode'): string {
  return mode === 'encode' ? encodeURIComponent(value) : decodeURIComponent(value);
}

export function generateUuid(version: 'v4' | 'v7'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  if (version === 'v7') {
    let timestamp = Date.now();
    for (let index = 5; index >= 0; index -= 1) {
      bytes[index] = timestamp & 0xff;
      timestamp = Math.floor(timestamp / 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
  } else {
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
  }
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

export async function generateDigest(value: string, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure Web Crypto is unavailable in this browser. Open UTILORA over HTTPS and try again.');
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
