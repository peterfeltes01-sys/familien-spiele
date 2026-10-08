"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameModule, GameProps } from "../types";
import type { PointsAward } from "@/lib/types";
import { Button, Card, Screen } from "@/components/ui";
import { Setup } from "./Setup";
import { Collect } from "./Collect";
import { PlayPhase } from "./Play";
import {
  TEAM_STYLE,
  buildPrompts,
  clearSaved,
  loadSaved,
  newPlay,
  saveState,
  DEFAULT_SETTINGS,
  type MState,
  type Play,
} from "./state";

const FRESH: MState = {
  stage: "setup",
  teams: [[0, 1], [2, 3]],
  settings: DEFAULT_SETTINGS,
  prompts: [],
  terms: [],
  play: null,
};

function MarathonGame({ players, finish }: GameProps) {
  // Der Spielstand wird pro Spielergruppe gespeichert, damit ein Neuladen nicht alles löscht.
  const sig = useMemo(() => players.map((p) => p.name).join("|"), [players]);
  const [saved, setSaved] = useState(() => loadSaved(sig));
  const [state, setState] = useState<MState>(FRESH);

  useEffect(() => {
    if (!saved && state.stage !== "setup") saveState(sig, state);
  }, [state, saved, sig]);

  if (saved) {
    return (
      <Screen className="items-center justify-center text-center">
        <div className="text-8xl">💾</div>
        <h1 className="my-4 text-4xl font-black">Angefangenes Spiel gefunden</h1>
        <div className="flex w-full max-w-md flex-col gap-4">
          <Button tone="mint" onClick={() => { setState(saved); setSaved(null); }}>
            ▶️ Fortsetzen
          </Button>
          <Button tone="white" onClick={() => { clearSaved(); setSaved(null); }}>
            ✨ Neu starten
          </Button>
        </div>
      </Screen>
    );
  }

  const setPlay = (fn: (p: Play) => Play) =>
    setState((s) => (s.play ? { ...s, play: fn(s.play) } : s));

  if (state.stage === "setup") {
    return (
      <Setup
        players={players}
        onStart={(teams, settings) =>
          setState({ ...FRESH, stage: "collect", teams, settings, prompts: buildPrompts(settings.collectRounds) })
        }
      />
    );
  }

  if (state.stage === "collect") {
    return (
      <Collect
        players={players}
        prompts={state.prompts}
        terms={state.terms}
        onAdd={(term) =>
          setState((s) => {
            const terms = [...s.terms, term];
            return terms.length >= s.prompts.length * players.length
              ? { ...s, terms, stage: "play", play: newPlay(terms) }
              : { ...s, terms };
          })
        }
      />
    );
  }

  if (state.stage === "play" && state.play) {
    return (
      <PlayPhase
        players={players}
        teams={state.teams}
        settings={state.settings}
        terms={state.terms}
        play={state.play}
        setPlay={setPlay}
        onDone={() => setState((s) => ({ ...s, stage: "done" }))}
      />
    );
  }

  // Ergebnis
  const pts = state.play?.teamPoints ?? [0, 0];
  const winner = pts[0] === pts[1] ? null : pts[0] > pts[1] ? 0 : 1;
  const award = (): PointsAward => {
    const out: PointsAward = {};
    state.teams.forEach((team, t) => team.forEach((i) => (out[players[i].id] = pts[t])));
    return out;
  };
  return (
    <Screen>
      <div className="mb-2 text-center text-7xl">🏆</div>
      <h1 className="mb-1 text-center text-4xl font-black">
        {winner === null ? "Unentschieden!" : `Team ${winner + 1} gewinnt!`}
      </h1>
      <p className="mb-5 text-center text-lg font-semibold opacity-70">Jeder erratene Begriff zählt für beide im Team.</p>
      <Card className="flex flex-col gap-4">
        {[0, 1].map((t) => (
          <div key={t} className={`${TEAM_STYLE[t].bg} rounded-3xl p-4 text-white ${winner === t ? "ring-8 ring-sun" : ""}`}>
            <div className="flex items-center justify-between text-2xl font-black">
              <span>{TEAM_STYLE[t].emoji} Team {t + 1}</span>
              <span className="text-4xl">{pts[t]}</span>
            </div>
            <p className="mt-1 text-lg font-semibold opacity-90">{state.teams[t].map((i) => `${players[i].emoji} ${players[i].name}`).join("  ")}</p>
          </div>
        ))}
      </Card>
      <Button
        tone="mint"
        className="mt-auto"
        onClick={() => {
          clearSaved();
          finish(award());
        }}
      >
        Punkte gutschreiben 🏁
      </Button>
    </Screen>
  );
}

export const marathon: GameModule = {
  id: "marathon",
  name: "Begriffs-Marathon",
  emoji: "🏃",
  description: "Stadt-Land-Fluss, Tabu und Activity in drei Runden – im Team.",
  kind: "main",
  color: "bg-grape",
  available: true,
  rules: [
    "Zwei Teams mit je zwei Spielern. Ihr könnt sie auslosen oder selbst tauschen.",
    "Phase 1: Zu einer Kategorie und einem Buchstaben (z. B. „Film mit M“) gibt jeder heimlich einen Begriff ein. Das Gerät geht reihum, bis der Stapel voll ist.",
    "Phase 2: Dieselben Begriffe kommen in drei Runden dran – erst mit Worten erklären, dann nur mit EINEM Wort, zuletzt nur mit Pantomime.",
    "Die Teams wechseln sich ab, im Team wechselt der Erklärer. Pro Zug läuft die Zeit; „Richtig“ gibt 1 Punkt fürs Team, „Überspringen“ schiebt den Begriff nach hinten.",
    "Eine Runde endet, wenn alle Begriffe erraten sind. Jeder erratene Begriff zählt für beide Spieler des Teams.",
  ],
  Component: MarathonGame,
};
