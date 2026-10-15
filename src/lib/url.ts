/** Renvoie l'URL si elle est en http(s), sinon null (bloque javascript:, data:, etc.). */
export function safeHttpUrl(raw?: string | null): string | null {
  const v = raw?.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch { return null; }
}
