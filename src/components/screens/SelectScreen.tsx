"use client";

import { useStore } from "@/lib/store";
import { games } from "@/games";
import { Button, Screen } from "../ui";
import { ScoreList } from "../Scoreboard";

export function SelectScreen() {
  const { openGame, endEvening, goTo } = useStore();
  const main = games.filter((g) => g.kind === "main");
  const minis = games.filter((g) => g.kind === "mini");

  const card = (g: (typeof games)[number], big = false) => (
    <button
      key={g.id}
      disabled={!g.available}
      onClick={() => openGame(g.id)}
      className={`${g.color} ${
        big ? "p-7" : "p-5"
      } relative flex flex-col items-start gap-1 rounded-[2rem] text-left text-white shadow-[0_8px_0_rgba(0,0,0,0.18)] transition active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:active:translate-y-0`}
    >
      <span className={big ? "text-7xl" : "text-5xl"}>{g.emoji}</span>
      <span className={`${big ? "text-4xl" : "text-2xl"} font-black`}>{g.name}</span>
      <span className="text-base font-semibold opacity-90">{g.description}</span>
      {!g.available && (
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-ink">
          bald
        </span>
      )}
    </button>
  );

  return (
    <Screen>
      <h1 className="mb-4 text-center text-4xl font-black">Was spielen wir? 🎮</h1>
      <div className="mb-6">
        <ScoreList />
      </div>
      <div className="flex flex-col gap-5">
        {main.map((g) => card(g, true))}
        <div className="grid gap-5 sm:grid-cols-2">{minis.map((g) => card(g))}</div>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button
          tone="sun"
          onClick={() => {
            if (confirm("Abend beenden und Siegerehrung starten?")) endEvening();
          }}
        >
          🏁 Abend beenden
        </Button>
        <Button tone="white" size="md" onClick={() => goTo("setup")}>
          ✏️ Namen ändern
        </Button>
      </div>
    </Screen>
  );
}
