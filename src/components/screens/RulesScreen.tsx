"use client";

import { useStore } from "@/lib/store";
import { getGame } from "@/games";
import { Button, Card, Screen } from "../ui";

export function RulesScreen() {
  const { currentGameId, startGame, leaveGame } = useStore();
  const game = currentGameId ? getGame(currentGameId) : undefined;
  if (!game) return null;

  return (
    <Screen>
      <div className="mb-4 text-center">
        <div className="text-7xl">{game.emoji}</div>
        <h1 className="text-4xl font-black">{game.name}</h1>
      </div>
      <Card className="flex flex-col gap-4 text-xl font-semibold">
        {game.rules.map((r, i) => (
          <p key={i} className="flex gap-3">
            <span className="font-black text-grape">{i + 1}.</span>
            <span>{r}</span>
          </p>
        ))}
      </Card>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button tone="mint" onClick={startGame}>
          Los geht’s! 🚀
        </Button>
        <Button tone="white" size="md" onClick={leaveGame}>
          Zurück zur Auswahl
        </Button>
      </div>
    </Screen>
  );
}
