// localStorage helpers. All access goes through here so we can detect when
// storage is unavailable (private browsing, Safari ITP, quota exceeded) and
// fall back gracefully.

const KEYS = {
  apiKey: "statesense:api_key",
  thumbs: "statesense:thumbs",
  dismissed: "statesense:dismissed"
} as const;

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__ss_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getApiKey(): string | null {
  if (!isStorageAvailable()) return null;
  return window.localStorage.getItem(KEYS.apiKey);
}

export function setApiKey(key: string): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(KEYS.apiKey, key);
    return true;
  } catch {
    return false;
  }
}

export function clearApiKey(): void {
  if (!isStorageAvailable()) return;
  window.localStorage.removeItem(KEYS.apiKey);
}

/** Looks like an Anthropic key shape. Doesn't verify against the API. */
export function looksLikeAnthropicKey(s: string): boolean {
  return /^sk-ant-[\w-]{20,}$/.test(s.trim());
}

type Thumb = "up" | "down";

export function getThumbs(): Record<string, Thumb> {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(KEYS.thumbs);
    return raw ? (JSON.parse(raw) as Record<string, Thumb>) : {};
  } catch {
    return {};
  }
}

export function setThumb(findingId: string, value: Thumb | null): void {
  if (!isStorageAvailable()) return;
  const map = getThumbs();
  if (value === null) {
    delete map[findingId];
  } else {
    map[findingId] = value;
  }
  try {
    window.localStorage.setItem(KEYS.thumbs, JSON.stringify(map));
  } catch {
    // Quota exceeded — ignore.
  }
}

export function getDismissed(): Set<string> {
  if (!isStorageAvailable()) return new Set();
  try {
    const raw = window.localStorage.getItem(KEYS.dismissed);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function setDismissed(ids: Set<string>): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(KEYS.dismissed, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}
