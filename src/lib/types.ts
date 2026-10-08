export type Player = {
  id: string;
  name: string;
  color: string; // Tailwind-Hintergrundklasse
  emoji: string;
};

/** Punkte, die ein Spiel vergibt: Spieler-ID -> Punkte */
export type PointsAward = Record<string, number>;

export type HistoryEntry = {
  gameId: string;
  gameName: string;
  points: PointsAward;
  at: number;
};

export type Screen = "start" | "setup" | "select" | "rules" | "playing" | "final";

export type AppState = {
  screen: Screen;
  players: Player[];
  scores: Record<string, number>;
  history: HistoryEntry[];
  currentGameId: string | null;
};
