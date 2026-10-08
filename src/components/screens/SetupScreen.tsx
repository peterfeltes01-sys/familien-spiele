"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Screen, Title } from "../ui";

const PLACEHOLDERS = ["Mama", "Papa", "Tochter 1", "Tochter 2"];
const EMOJIS = ["🦄", "🐳", "🐸", "🦁"];
const COLORS = ["bg-pink", "bg-sky", "bg-mint", "bg-sun"];

export function SetupScreen() {
  const { players, startEvening, renamePlayers, goTo, hasSavedEvening } = useStore();
  const [names, setNames] = useState<string[]>(
    players.length === 4 ? players.map((p) => p.name) : ["", "", "", ""],
  );

  const trimmed = names.map((n) => n.trim());
  const allFilled = trimmed.every(Boolean);
  const unique = new Set(trimmed.map((n) => n.toLowerCase())).size === 4;

  return (
    <Screen>
      <Title emoji="👨‍👩‍👧‍👧">Wer spielt mit?</Title>
      <Card className="flex flex-col gap-4">
        {names.map((n, i) => (
          <label key={i} className="flex items-center gap-3">
            <span className={`${COLORS[i]} flex size-16 shrink-0 items-center justify-center rounded-2xl text-4xl`}>
              {EMOJIS[i]}
            </span>
            <input
              value={n}
              maxLength={14}
              placeholder={PLACEHOLDERS[i]}
              onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))}
              className="min-h-16 w-full rounded-2xl border-4 border-ink/10 bg-cream px-4 text-2xl font-bold outline-none focus:border-grape"
            />
          </label>
        ))}
      </Card>
      {allFilled && !unique && (
        <p className="mt-3 text-center font-bold text-tomato">Bitte vier verschiedene Namen eingeben.</p>
      )}
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button
          tone="mint"
          disabled={!allFilled || !unique}
          onClick={() =>
            hasSavedEvening && players.length === 4 ? renamePlayers(trimmed) : startEvening(trimmed)
          }
        >
          Los geht’s! 🎉
        </Button>
        <Button tone="white" size="md" onClick={() => goTo(hasSavedEvening ? "select" : "start")}>
          Zurück
        </Button>
      </div>
    </Screen>
  );
}
