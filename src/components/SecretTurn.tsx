"use client";

import { useState, type ReactNode } from "react";
import type { Player } from "@/lib/types";
import { Button } from "./ui";

/**
 * Übergabebildschirm: "Gib das Gerät an [Name]" -> Tippen zum Aufdecken -> Tippen zum Verbergen.
 * `children` bekommt `done` und ruft es auf, wenn der Spieler fertig ist (z. B. nach einer Wahl).
 * Mit `hideButton` erscheint unter dem Geheimnis zusätzlich der Button "Verbergen".
 */
export function SecretTurn({
  player,
  hint,
  hideButton = false,
  onDone,
  children,
}: {
  player: Player;
  hint?: string;
  hideButton?: boolean;
  onDone: () => void;
  children: (done: () => void) => ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className={`${player.color} mx-auto flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 text-center text-white shadow-[0_8px_0_rgba(0,0,0,0.18)] active:translate-y-1`}
      >
        <span className="animate-pop text-8xl">{player.emoji}</span>
        <span className="text-2xl font-bold opacity-90">Gib das Gerät an</span>
        <span className="text-5xl font-black sm:text-6xl">{player.name}</span>
        {hint && <span className="text-lg font-semibold opacity-90">{hint}</span>}
        <span className="mt-6 rounded-full bg-white/25 px-6 py-3 text-xl font-extrabold">
          👆 Tippen zum Aufdecken
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className={`${player.color} self-center rounded-full px-5 py-2 text-lg font-extrabold text-white`}>
        {player.emoji} {player.name}
      </div>
      {children(onDone)}
      {hideButton && (
        <Button tone="white" className="mt-auto" onClick={onDone}>
          🙈 Verbergen
        </Button>
      )}
    </div>
  );
}
