"use client";

import type { GameProps } from "./types";
import { Button, Screen } from "@/components/ui";

/** Platzhalter, bis ein Spiel implementiert ist. */
export function ComingSoon({ quit }: GameProps) {
  return (
    <Screen className="items-center justify-center text-center">
      <div className="text-8xl">🚧</div>
      <h1 className="my-4 text-4xl font-black">Kommt bald!</h1>
      <Button tone="white" onClick={quit}>
        Zurück
      </Button>
    </Screen>
  );
}
