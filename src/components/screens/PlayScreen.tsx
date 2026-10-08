"use client";

import { useStore } from "@/lib/store";
import { getGame } from "@/games";

export function PlayScreen() {
  const { currentGameId, players, finishGame, leaveGame } = useStore();
  const game = currentGameId ? getGame(currentGameId) : undefined;
  if (!game) return null;
  const { Component } = game;

  return (
    <>
      <button
        onClick={() => {
          if (confirm("Spiel abbrechen? Die Punkte dieses Spiels gehen verloren.")) leaveGame();
        }}
        className="fixed left-4 top-4 z-30 min-h-12 rounded-full bg-white px-5 text-lg font-extrabold shadow-[0_4px_0_#d9d2ee] active:translate-y-0.5"
      >
        ✖ Abbrechen
      </button>
      <Component
        key={game.id}
        players={players}
        finish={(points) => finishGame(game.id, game.name, points)}
        quit={leaveGame}
      />
    </>
  );
}
