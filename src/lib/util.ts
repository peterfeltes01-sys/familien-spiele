export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* nicht unterstützt */
  }
}

/** Merkt sich pro Schlüssel bereits gesehene Einträge, damit sich Fragen nicht wiederholen. */
export function takeUnseen<T>(key: string, items: readonly T[], count: number): T[] {
  const storageKey = `fs-seen-${key}`;
  let seen: number[] = [];
  try {
    seen = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
  } catch {
    seen = [];
  }
  let pool = items.map((_, i) => i).filter((i) => !seen.includes(i));
  if (pool.length < count) {
    seen = [];
    pool = items.map((_, i) => i);
  }
  const chosen = shuffle(pool).slice(0, count);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...seen, ...chosen]));
  } catch {
    /* ignorieren */
  }
  return chosen.map((i) => items[i]);
}
