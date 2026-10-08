import { shuffle } from "@/lib/util";
import { CATEGORIES, LETTERS } from "./categories";

export type Settings = { turnSeconds: number; collectRounds: number };
export type Prompt = { category: string; letter: string };
export type PlayPhase = "roundIntro" | "turnIntro" | "turn" | "turnEnd" | "roundEnd";
export type Pair = [number, number];

export type Play = {
  round: number; // 0..2
  phase: PlayPhase;
  queue: string[]; // vorne = aktueller Begriff
  turnNo: number; // fortlaufend über alle Runden, gerade = Team 0
  teamTurns: Pair; // wie oft jedes Team schon dran war (bestimmt den Erklärer)
  teamPoints: Pair; // Gesamtpunkte je Team
  roundStart: Pair; // Punktestand zu Rundenbeginn
  turnGuessed: number;
};

export type MState = {
  stage: "setup" | "collect" | "play" | "done";
  teams: [Pair, Pair]; // Spieler-Indizes pro Team
  settings: Settings;
  prompts: Prompt[]; // eine Kategorie + Buchstabe je Sammelrunde
  terms: string[];
  play: Play | null;
};

export const ROUND_INFO = [
  { emoji: "🗣️", title: "Erklären mit Worten", rule: "Erkläre den Begriff mit beliebigen Worten – nur der Begriff selbst (und Teile davon) darf nicht fallen." },
  { emoji: "☝️", title: "Nur ein Wort", rule: "Du darfst nur EIN einziges Wort als Hinweis sagen. Mehr nicht!" },
  { emoji: "🎭", title: "Pantomime", rule: "Keine Worte und keine Geräusche – nur Körpersprache." },
] as const;

export const TEAM_STYLE = [
  { bg: "bg-grape", emoji: "🔮" },
  { bg: "bg-tomato", emoji: "🔥" },
] as const;

export const DEFAULT_SETTINGS: Settings = { turnSeconds: 60, collectRounds: 6 };

export function buildPrompts(count: number): Prompt[] {
  const cats = shuffle(CATEGORIES).slice(0, count);
  const letters = shuffle(LETTERS).slice(0, count);
  return cats.map((category, i) => ({ category, letter: letters[i] }));
}

export function newPlay(terms: string[]): Play {
  return {
    round: 0,
    phase: "roundIntro",
    queue: shuffle(terms),
    turnNo: 0,
    teamTurns: [0, 0],
    teamPoints: [0, 0],
    roundStart: [0, 0],
    turnGuessed: 0,
  };
}

// ---- Speichern/Fortsetzen: ein Marathon dauert länger, ein Neuladen soll nicht alles löschen ----
const KEY = "fs-marathon";

export function saveState(sig: string, state: MState) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ sig, state }));
  } catch {
    /* Speicher voll/gesperrt */
  }
}

export function clearSaved() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignorieren */
  }
}

export function loadSaved(sig: string): MState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { sig: s, state } = JSON.parse(raw) as { sig: string; state: MState };
    if (s !== sig || state.stage === "setup") return null;
    // Eine laufende Zeit lässt sich nicht wiederherstellen -> zurück zur Übergabe.
    if (state.play?.phase === "turn") state.play.phase = "turnIntro";
    return state;
  } catch {
    return null;
  }
}
