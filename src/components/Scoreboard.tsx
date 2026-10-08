"use client";

import { useStore } from "@/lib/store";
import { Button } from "./ui";

export function rank(players: { id: string }[], scores: Record<string, number>) {
  return [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
}

export function ScoreList() {
  const { players, scores } = useStore();
  const ranked = rank(players, scores) as typeof players;
  const medals = ["🥇", "🥈", "🥉", "4️⃣"];
  return (
    <ul className="flex flex-col gap-3">
      {ranked.map((p, i) => (
        <li
          key={p.id}
          className={`${p.color} flex items-center gap-3 rounded-3xl px-5 py-4 text-xl font-extrabold text-white`}
        >
          <span className="text-3xl">{medals[i]}</span>
          <span className="text-3xl">{p.emoji}</span>
          <span className="flex-1 truncate">{p.name}</span>
          <span className="rounded-full bg-white/30 px-4 py-1 text-2xl">{scores[p.id] ?? 0}</span>
        </li>
      ))}
    </ul>
  );
}

export function ScoreboardModal({ onClose }: { onClose: () => void }) {
  const { history } = useStore();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-3 sm:items-center">
      <div className="animate-pop max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-cream p-6">
        <h2 className="mb-4 text-center text-3xl font-black">🏆 Rangliste</h2>
        <ScoreList />
        {history.length > 0 && (
          <p className="mt-4 text-center text-sm font-semibold opacity-70">
            Gespielt: {history.map((h) => h.gameName).join(" · ")}
          </p>
        )}
        <Button tone="grape" className="mt-6 w-full" onClick={onClose}>
          Weiter
        </Button>
      </div>
    </div>
  );
}
