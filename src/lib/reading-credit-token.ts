/**
 * The browser's pointer to a purchased single reading. It is only a pointer:
 * whether the purchase is paid, and whether it has been used, is decided on the
 * server. Losing it loses the pointer, not the payment record.
 */

const KEY = "bearing.reading-credit";
const SESSION_KEY = "bearing.session-id";

export function readCreditToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(KEY) ?? undefined;
}

export function storeCreditToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, token);
}

export function clearCreditToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** A random, non identifying id used only to group experiment events. */
export function analyticsSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
