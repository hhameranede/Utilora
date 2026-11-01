/**
 * Locale-independent search normalization shared by all discovery surfaces.
 */
function collectSearchText(value: unknown, output: string[]): void {
  if (typeof value === 'string' || typeof value === 'number') {
    output.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectSearchText(item, output));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectSearchText(item, output));
  }
}

export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function matchesSearch(query: string, ...searchableValues: unknown[]): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  const searchableText: string[] = [];
  searchableValues.forEach((value) => collectSearchText(value, searchableText));
  const haystack = normalizeSearchText(searchableText.join(' '));
  return normalizedQuery.split(/\s+/).filter(Boolean).every((token) => haystack.includes(token));
}
