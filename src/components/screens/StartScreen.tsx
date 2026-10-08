"use client";

import { useStore } from "@/lib/store";
import { Button, Screen } from "../ui";

export function StartScreen() {
  const { hasSavedEvening, players, goTo, resetAll } = useStore();
  return (
    <Screen className="items-center justify-center text-center">
      <div className="mb-4 animate-wiggle text-8xl">🎲</div>
      <h1 className="mb-2 text-5xl font-black sm:text-6xl">Familien-Spiele</h1>
      <p className="mb-10 text-xl font-semibold opacity-70">Ein Gerät. Vier Spieler. Viel Spaß!</p>
      <div className="flex w-full max-w-md flex-col gap-4">
        {hasSavedEvening && (
          <Button tone="mint" onClick={() => goTo("select")}>
            ▶️ Weiterspielen
            <span className="block text-base font-bold opacity-70">
              {players.map((p) => p.name).join(", ")}
            </span>
          </Button>
        )}
        <Button
          tone={hasSavedEvening ? "white" : "grape"}
          onClick={() => {
            if (hasSavedEvening && !confirm("Der gespeicherte Abend wird gelöscht. Neuen Abend starten?")) return;
            resetAll();
            goTo("setup");
          }}
        >
          ✨ Neuer Abend
        </Button>
      </div>
    </Screen>
  );
}
