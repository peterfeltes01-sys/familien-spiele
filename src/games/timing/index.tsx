"use client";

import { useRef, useState } from "react";
import type { GameModule, GameProps } from "../types";
import type { PointsAward } from "@/lib/types";
import { Button, Card, Screen } from "@/components/ui";
import { shuffle } from "@/lib/util";

const ROUNDS = 3;
/** Mögliche Zielzeiten in Sekunden – einfach ergänzen. */
const TARGETS = [7, 10, 12, 15, 17, 20, 23, 25, 30];
/** Stopp-Tipps direkt nach dem Start werden ignoriert (versehentliches Doppeltippen). */
const LOCK_MS = 500;

type Phase = "intro" | "running" | "result" | "summary";

const seconds = (ms: number) => (ms / 1000).toFixed(2).replace(".", ",");
const signed = (ms: number) => `${ms >= 0 ? "+" : "−"}${seconds(Math.abs(ms))} s`;

function TimingGame({ players, finish }: GameProps) {
  const n = players.length;
  const [targets] = useState(() => shuffle(TARGETS).slice(0, ROUNDS));
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState(0); // Position in der Reihenfolge dieser Runde
  const [phase, setPhase] = useState<Phase>("intro");
  const [measured, setMeasured] = useState<number[]>([]); // gestoppte Zeit in ms, nach Spieler-Index
  const [rounds, setRounds] = useState<{ target: number; times: number[] }[]>([]);
  const startedAt = useRef(0);

  const target = targets[round];
  // Startspieler wechselt pro Runde
  const playerIdx = (round + turn) % n;
  const player = players[playerIdx];

  const stop = (now: number) => {
    const elapsed = now - startedAt.current;
    if (elapsed < LOCK_MS) return;
    const m = [...measured];
    m[playerIdx] = elapsed;
    if (turn + 1 < n) {
      setMeasured(m);
      setTurn(turn + 1);
      setPhase("intro");
    } else {
      setMeasured(m);
      setRounds((r) => [...r, { target, times: m }]);
      setPhase("result");
    }
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS) return setPhase("summary");
    setRound(round + 1);
    setTurn(0);
    setMeasured([]);
    setPhase("intro");
  };

  const winnersOf = (r: { target: number; times: number[] }) => {
    const dev = r.times.map((t) => Math.abs(t - r.target * 1000));
    const best = Math.min(...dev);
    return dev.map((d) => d === best);
  };

  if (phase === "intro") {
    return (
      <Screen>
        <p className="mb-3 text-center text-xl font-extrabold opacity-60">
          Runde {round + 1} von {ROUNDS}
        </p>
        <div className={`${player.color} flex flex-1 flex-col items-center justify-center gap-3 rounded-[2.5rem] p-8 text-center text-white shadow-[0_8px_0_rgba(0,0,0,0.18)]`}>
          <span className="text-8xl">{player.emoji}</span>
          <span className="text-5xl font-black">{player.name}</span>
          <span className="mt-4 text-2xl font-bold opacity-90">Deine Zielzeit</span>
          <span className="text-8xl font-black">{target} s</span>
          <span className="text-lg font-semibold opacity-90">
            Tippe Start und dann Stopp, wenn du glaubst, dass die Zeit um ist. Nicht laut zählen!
          </span>
        </div>
        <Button
          tone="mint"
          className="mt-6 touch-none"
          onPointerDown={(e) => {
            startedAt.current = e.timeStamp;
            setPhase("running");
          }}
        >
          ▶️ Start
        </Button>
      </Screen>
    );
  }

  if (phase === "running") {
    return (
      <Screen>
        <div className={`${player.color} flex flex-1 flex-col items-center justify-center gap-4 rounded-[2.5rem] p-8 text-center text-white shadow-[0_8px_0_rgba(0,0,0,0.18)]`}>
          <span className="animate-wiggle text-8xl">🤫</span>
          <span className="text-4xl font-black">{player.name}, die Zeit läuft …</span>
          <span className="text-2xl font-bold opacity-90">Ziel: {target} Sekunden</span>
        </div>
        <Button tone="tomato" className="mt-6 touch-none py-10 text-4xl" onPointerDown={(e) => stop(e.timeStamp)}>
          ⏹️ Stopp
        </Button>
      </Screen>
    );
  }

  if (phase === "result") {
    const r = rounds[rounds.length - 1];
    const win = winnersOf(r);
    const order = players.map((_, i) => i).sort((a, b) => Math.abs(r.times[a] - r.target * 1000) - Math.abs(r.times[b] - r.target * 1000));
    return (
      <Screen>
        <p className="mb-1 text-center text-xl font-extrabold opacity-60">
          Auflösung · Runde {round + 1} von {ROUNDS}
        </p>
        <h1 className="mb-4 text-center text-4xl font-black">Zielzeit: {r.target} s ⏱️</h1>
        <Card className="flex flex-col gap-3">
          {order.map((i) => (
            <div key={players[i].id} className={`flex items-center gap-3 rounded-2xl text-xl font-bold ${win[i] ? "bg-sun/30 p-2" : "p-2"}`}>
              <span className={`${players[i].color} flex size-12 items-center justify-center rounded-2xl text-3xl`}>{players[i].emoji}</span>
              <span className="flex-1 truncate">{players[i].name} {win[i] && "🏆"}</span>
              <span className="text-lg">{seconds(r.times[i])} s</span>
              <span className={`w-28 text-right text-lg font-black ${win[i] ? "text-mint" : "opacity-60"}`}>{signed(r.times[i] - r.target * 1000)}</span>
            </div>
          ))}
        </Card>
        <Button tone="mint" className="mt-auto" onClick={nextRound}>
          {round + 1 >= ROUNDS ? "Ergebnis ▶️" : "Nächste Runde ▶️"}
        </Button>
      </Screen>
    );
  }

  // summary
  const wins = players.map((_, i) => rounds.filter((r) => winnersOf(r)[i]).length);
  const points: PointsAward = Object.fromEntries(players.map((p, i) => [p.id, wins[i]]));
  return (
    <Screen>
      <div className="mb-2 text-center text-7xl">⏱️</div>
      <h1 className="mb-4 text-center text-4xl font-black">Geschafft!</h1>
      <Card className="flex flex-col gap-3">
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 text-xl font-bold">
            <span className={`${p.color} flex size-12 items-center justify-center rounded-2xl text-3xl`}>{p.emoji}</span>
            <span className="flex-1 truncate">{p.name}</span>
            <span className={`w-14 text-right text-2xl font-black ${wins[i] ? "text-mint" : "opacity-30"}`}>+{wins[i]}</span>
          </div>
        ))}
      </Card>
      <p className="mt-3 text-center text-base font-semibold opacity-70">1 Punkt pro Runde für die kleinste Abweichung</p>
      <Button tone="mint" className="mt-auto" onClick={() => finish(points)}>
        Punkte gutschreiben 🏁
      </Button>
    </Screen>
  );
}

export const timing: GameModule = {
  id: "timing",
  name: "Timing",
  emoji: "⏱️",
  description: "Triff die Zielzeit ohne Uhr.",
  kind: "mini",
  color: "bg-sun",
  available: true,
  rules: [
    `Die App nennt eine Zielzeit, zum Beispiel 17 Sekunden. Es gibt ${ROUNDS} Runden mit verschiedenen Zielzeiten.`,
    "Reihum tippt jeder auf Start. Der Timer ist unsichtbar. Tippe auf Stopp, wenn du glaubst, dass die Zeit um ist.",
    "Zählen im Kopf ist erlaubt, laut zählen oder auf eine Uhr schauen nicht!",
    "Erst am Ende jeder Runde werden alle Zeiten aufgedeckt. Wer am nächsten dran ist, bekommt 1 Punkt.",
  ],
  Component: TimingGame,
};
