import type { GameModule } from "./types";
import { ComingSoon } from "./comingSoon";
import { majority } from "./majority";
import { impostor } from "./impostor";

/**
 * Registry aller Spiele. Neues Spiel: Modul anlegen (GameModule) und hier eintragen.
 * Reihenfolge = Reihenfolge auf der Auswahlseite.
 */
const planned = (m: Omit<GameModule, "available" | "Component" | "rules"> & { rules?: string[] }): GameModule => ({
  rules: ["Dieses Spiel ist noch in Arbeit."],
  ...m,
  available: false,
  Component: ComingSoon,
});

export const games: GameModule[] = [
  planned({
    id: "marathon",
    name: "Begriffs-Marathon",
    emoji: "🏃",
    description: "Stadt-Land-Fluss, Tabu und Activity in drei Runden – im Team.",
    kind: "main",
    color: "bg-grape",
  }),
  majority,
  planned({ id: "reaction", name: "Reaktion", emoji: "⚡", description: "Wer tippt zuerst auf Grün?", kind: "mini", color: "bg-mint" }),
  planned({ id: "timing", name: "Timing", emoji: "⏱️", description: "Triff die Zielzeit ohne Uhr.", kind: "mini", color: "bg-sun" }),
  impostor,
];

export const getGame = (id: string) => games.find((g) => g.id === id);
