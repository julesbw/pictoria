export function normalizeSupabaseUrl(value: string) {
  const url = new URL(value);

  return `${url.protocol}//${url.host}`;
}
