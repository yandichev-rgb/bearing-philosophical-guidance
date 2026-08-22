/**
 * Where email confirmation links should return a visitor.
 *
 * The editor preview host (id-preview--<id>.lovable.app) is only viewable by the
 * workspace, so a confirmation link built from it lands anyone else on an access
 * denied page. When we are on that host we rewrite to the stable public preview
 * address for the same project; everywhere else the current origin is correct.
 */
export function publicSiteOrigin(): string {
  if (typeof window === "undefined") return "";
  const { origin, hostname } = window.location;
  const gated = /^id-preview--(.+)\.lovable\.app$/.exec(hostname);
  if (gated?.[1]) return `https://project--${gated[1]}-dev.lovable.app`;
  return origin;
}

/** An absolute URL on the public site for the given path. */
export function publicSiteUrl(path: string): string {
  const base = publicSiteOrigin();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
