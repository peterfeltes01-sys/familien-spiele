"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppState, Player, PointsAward, Screen } from "./types";

const STORAGE_KEY = "familien-spiele-v1";

const PLAYER_STYLES = [
  { color: "bg-pink", emoji: "🦄" },
  { color: "bg-sky", emoji: "🐳" },
  { color: "bg-mint", emoji: "🐸" },
  { color: "bg-sun", emoji: "🦁" },
];

const initialState: AppState = {
  screen: "start",
  players: [],
  scores: {},
  history: [],
  currentGameId: null,
};

type Store = AppState & {
  hydrated: boolean;
  hasSavedEvening: boolean;
  goTo: (screen: Screen) => void;
  startEvening: (names: string[]) => void;
  renamePlayers: (names: string[]) => void;
  openGame: (gameId: string) => void;
  startGame: () => void;
  finishGame: (gameId: string, gameName: string, points: PointsAward) => void;
  leaveGame: () => void;
  endEvening: () => void;
  resetAll: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AppState;
        // Ein laufendes Spiel ist nach Reload nicht wiederherstellbar -> zurück zur Auswahl.
        if (saved.screen === "playing" || saved.screen === "rules") saved.screen = "select";
        setState(saved);
      }
    } catch {
      /* kaputter Speicher -> frisch starten */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Speicher voll/gesperrt */
    }
  }, [state, hydrated]);

  const goTo = useCallback((screen: Screen) => setState((s) => ({ ...s, screen })), []);

  const buildPlayers = (names: string[], old: Player[] = []): Player[] =>
    names.map((name, i) => ({
      id: old[i]?.id ?? `p${i + 1}`,
      name: name.trim(),
      ...PLAYER_STYLES[i % PLAYER_STYLES.length],
    }));

  const startEvening = useCallback((names: string[]) => {
    const players = buildPlayers(names);
    setState({
      screen: "select",
      players,
      scores: Object.fromEntries(players.map((p) => [p.id, 0])),
      history: [],
      currentGameId: null,
    });
  }, []);

  const renamePlayers = useCallback((names: string[]) => {
    setState((s) => ({ ...s, players: buildPlayers(names, s.players), screen: "select" }));
  }, []);

  const openGame = useCallback(
    (gameId: string) => setState((s) => ({ ...s, currentGameId: gameId, screen: "rules" })),
    [],
  );
  const startGame = useCallback(() => setState((s) => ({ ...s, screen: "playing" })), []);

  const finishGame = useCallback((gameId: string, gameName: string, points: PointsAward) => {
    setState((s) => {
      const scores = { ...s.scores };
      for (const [id, pts] of Object.entries(points)) scores[id] = (scores[id] ?? 0) + pts;
      return {
        ...s,
        scores,
        history: [...s.history, { gameId, gameName, points, at: Date.now() }],
        currentGameId: null,
        screen: "select",
      };
    });
  }, []);

  const leaveGame = useCallback(
    () => setState((s) => ({ ...s, currentGameId: null, screen: "select" })),
    [],
  );
  const endEvening = useCallback(() => setState((s) => ({ ...s, screen: "final" })), []);
  const resetAll = useCallback(() => setState(initialState), []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      hasSavedEvening: state.players.length > 0,
      goTo,
      startEvening,
      renamePlayers,
      openGame,
      startGame,
      finishGame,
      leaveGame,
      endEvening,
      resetAll,
    }),
    [state, hydrated, goTo, startEvening, renamePlayers, openGame, startGame, finishGame, leaveGame, endEvening, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore außerhalb von StoreProvider");
  return v;
}
