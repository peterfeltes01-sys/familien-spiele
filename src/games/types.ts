import type { ComponentType } from "react";
import type { Player, PointsAward } from "@/lib/types";

/** Was jedes Spiel von der App bekommt. */
export type GameProps = {
  players: Player[];
  /** Spiel ist fertig: Punkte (Spieler-ID -> Punkte) werden gutgeschrieben. */
  finish: (points: PointsAward) => void;
  /** Spiel abbrechen, keine Punkte. */
  quit: () => void;
};

/** Einheitliche Schnittstelle: ein neues Spiel = ein Modul + Eintrag in games/index.ts. */
export type GameModule = {
  id: string;
  name: string;
  emoji: string;
  /** Kurzbeschreibung für die Spielkarte */
  description: string;
  /** Regeln, ein Absatz pro Eintrag */
  rules: string[];
  /** Tailwind-Klassen für die Karte, z. B. "bg-pink" */
  color: string;
  kind: "main" | "mini";
  /** false = Karte wird als "bald verfügbar" angezeigt */
  available: boolean;
  Component: ComponentType<GameProps>;
};
