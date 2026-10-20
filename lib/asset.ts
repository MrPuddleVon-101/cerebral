/**
 * Base path helper.
 *
 * On GitHub Pages a project site is served from `/<repo>`, not the domain
 * root. `next/link` applies `basePath` on its own, but in the App Router
 * `next/image` does not, and neither do raw `<img>` tags or `new Image()`
 * loads. Every asset URL in this codebase goes through `asset()` so the one
 * environment variable covers all of them.
 *
 * The value is inlined at build time and cannot change without rebuilding.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  return `${basePath}${path}`;
}
