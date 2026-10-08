"use client";

import { useStore } from "@/lib/store";
import { Button, Screen } from "../ui";
import { Confetti } from "../Confetti";
import { rank } from "../Scoreboard";

export function FinalScreen() {
  const { players, scores, goTo, resetAll } = useStore();
  const ranked = rank(players, scores) as typeof players;
  const top = scores[ranked[0]?.id] ?? 0;
  const winners = ranked.filter((p) => (scores[p.id] ?? 0) === top);
  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <Screen className="items-center text-center">
      <Confetti />
      <div className="text-8xl">🏆</div>
      <h1 className="mb-1 text-4xl font-black">Siegerehrung</h1>
      <p className="mb-8 text-2xl font-extrabold text-grape">
        {winners.length > 1
          ? `Unentschieden: ${winners.map((w) => w.name).join(" & ")}!`
          : `${winners[0]?.name} gewinnt den Abend!`}
      </p>
      <ul className="flex w-full flex-col gap-4">
        {ranked.map((p, i) => (
          <li
            key={p.id}
            style={{ animationDelay: `${(ranked.length - i) * 250}ms` }}
            className={`${p.color} animate-pop flex items-center gap-3 rounded-3xl px-5 text-white shadow-[0_6px_0_rgba(0,0,0,0.18)] ${
              i === 0 ? "py-7 text-3xl" : "py-4 text-xl"
            } font-black`}
          >
            <span className="text-4xl">{medals[i]}</span>
            <span className="text-4xl">{p.emoji}</span>
            <span className="flex-1 truncate text-left">{p.name}</span>
            <span className="rounded-full bg-white/30 px-4 py-1">{scores[p.id] ?? 0}</span>
          </li>
        ))}
      </ul>
      <div className="relative z-50 mt-10 flex w-full flex-col gap-3">
        <Button tone="mint" onClick={() => goTo("select")}>
          Noch eine Runde ▶️
        </Button>
        <Button
          tone="white"
          size="md"
          onClick={() => {
            if (confirm("Abend wirklich löschen?")) resetAll();
          }}
        >
          Neuer Abend
        </Button>
      </div>
    </Screen>
  );
}
