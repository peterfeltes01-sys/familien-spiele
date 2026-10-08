"use client";

import { useState } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { ScoreboardModal } from "./Scoreboard";
import { StartScreen } from "./screens/StartScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { SelectScreen } from "./screens/SelectScreen";
import { RulesScreen } from "./screens/RulesScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { FinalScreen } from "./screens/FinalScreen";

function Router() {
  const { screen, hydrated, players } = useStore();
  const [showScores, setShowScores] = useState(false);

  if (!hydrated) return null;

  const canShowScores = players.length > 0 && screen !== "start" && screen !== "setup" && screen !== "final";

  return (
    <>
      {canShowScores && (
        <button
          onClick={() => setShowScores(true)}
          className="fixed right-4 top-4 z-30 min-h-12 rounded-full bg-white px-5 text-lg font-extrabold shadow-[0_4px_0_#d9d2ee] active:translate-y-0.5"
        >
          🏆 Rangliste
        </button>
      )}
      {showScores && <ScoreboardModal onClose={() => setShowScores(false)} />}
      {screen === "start" && <StartScreen />}
      {screen === "setup" && <SetupScreen />}
      {screen === "select" && <SelectScreen />}
      {screen === "rules" && <RulesScreen />}
      {screen === "playing" && <PlayScreen />}
      {screen === "final" && <FinalScreen />}
    </>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
