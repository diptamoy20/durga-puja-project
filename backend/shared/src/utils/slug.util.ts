/**
 * URL-safe slug, matching Laravel's `Str::slug()` closely enough that existing
 * article and webinar slugs keep resolving after the migration.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    // Strip combining marks so "Kolkatā" becomes "Kolkata".
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Appends a numeric suffix until the slug is unique.
 * `exists` is supplied by the caller so this stays database-agnostic.
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const slug = slugify(base) || 'item';

  if (!(await exists(slug))) return slug;

  for (let suffix = 2; suffix < 500; suffix += 1) {
    const candidate = `${slug}-${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  // Fall back to a timestamp rather than looping forever.
  return `${slug}-${Date.now()}`;
}

/** Sequential, human-readable reference numbers (e.g. DIA-2026-000123). */
export function formatReferenceNo(prefix: string, sequence: number, year = new Date().getFullYear()): string {
  return `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
}
