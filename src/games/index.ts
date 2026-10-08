import type { GameModule } from "./types";
import { marathon } from "./marathon";
import { majority } from "./majority";
import { impostor } from "./impostor";
import { reaction } from "./reaction";
import { timing } from "./timing";

/**
 * Registry aller Spiele. Neues Spiel: Modul anlegen (GameModule) und hier eintragen.
 * Reihenfolge = Reihenfolge auf der Auswahlseite.
 */
export const games: GameModule[] = [
  marathon,
  majority,
  reaction,
  timing,
  impostor,
];

export const getGame = (id: string) => games.find((g) => g.id === id);
