// Keep in sync with `basePath` in next.config.mjs.
export const BASE_PATH = "/better-taro75";

/**
 * Prefix a root-relative asset path (e.g. from /public) with the app base path.
 * `next/link` and `next/image` handle basePath automatically, but plain <img>
 * tags and manual URLs do not.
 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
