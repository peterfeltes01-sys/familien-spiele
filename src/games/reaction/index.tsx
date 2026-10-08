"use client";

import { useEffect, useRef, useState } from "react";
import type { GameModule, GameProps } from "../types";
import type { PointsAward } from "@/lib/types";
import { Button, Screen, Card } from "@/components/ui";
import { beep, unlockAudio } from "@/lib/sound";
import { vibrate } from "@/lib/util";

const ROUNDS = 5;
const MIN_WAIT = 2000;
const MAX_WAIT = 7000;
/** So lange nach dem Startsignal werden noch Tipps gewertet. */
const GO_WINDOW = 3000;

type Phase = "ready" | "waiting" | "go" | "result" | "summary";

type RoundResult = {
  winner: number | null;
  times: (number | null)[]; // ms pro Spieler, null = nicht getippt
  early: boolean[];
};

function ReactionGame({ players, finish }: GameProps) {
  const n = players.length;
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [results, setResults] = useState<RoundResult[]>([]);
  // Rundendaten liegen in Refs, damit Timeouts immer den aktuellen Stand sehen.
  const [, rerender] = useState(0);
  const roundData = useRef({
    ready: Array<boolean>(n).fill(false),
    early: Array<boolean>(n).fill(false),
    times: Array<number | null>(n).fill(null),
  });
  const { ready, early, times } = roundData.current;

  const goAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const endRound = () => {
    clearTimers();
    const { times: t, early: e } = roundData.current;
    let winner: number | null = null;
    t.forEach((ms, i) => {
      if (ms !== null && (winner === null || ms < (t[winner] as number))) winner = i;
    });
    setResults((r) => [...r, { winner, times: [...t], early: [...e] }]);
    setPhase("result");
  };

  const startWaiting = () => {
    setPhase("waiting");
    const wait = MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT);
    timers.current.push(
      setTimeout(() => {
        goAt.current = performance.now();
        setPhase("go");
        beep(880, 300);
        vibrate(80);
        timers.current.push(setTimeout(endRound, GO_WINDOW));
      }, wait),
    );
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS) {
      setPhase("summary");
      return;
    }
    setRound(round + 1);
    roundData.current = {
      ready: Array<boolean>(n).fill(false),
      early: Array<boolean>(n).fill(false),
      times: Array<number | null>(n).fill(null),
    };
    setPhase("ready");
  };

  const onTap = (i: number, now: number) => {
    unlockAudio();
    if (phase === "ready") {
      if (ready[i]) return;
      ready[i] = true;
      rerender((c) => c + 1);
      if (ready.every(Boolean)) startWaiting();
    } else if (phase === "waiting") {
      if (early[i]) return;
      early[i] = true;
      vibrate(40);
      rerender((c) => c + 1);
      if (early.every(Boolean)) endRound();
    } else if (phase === "go") {
      if (early[i] || times[i] !== null) return;
      times[i] = Math.max(0, Math.round(now - goAt.current));
      rerender((c) => c + 1);
      if (times.every((v, k) => v !== null || early[k])) endRound();
    }
  };

  if (phase === "summary") {
    const wins = players.map((_, i) => results.filter((r) => r.winner === i).length);
    const points: PointsAward = Object.fromEntries(players.map((p, i) => [p.id, wins[i]]));
    const best = players.map((_, i) => {
      const ts = results.map((r) => r.times[i]).filter((v): v is number => v !== null);
      return ts.length ? Math.min(...ts) : null;
    });
    return (
      <Screen>
        <div className="mb-2 text-center text-7xl">⚡</div>
        <h1 className="mb-4 text-center text-4xl font-black">Geschafft!</h1>
        <Card className="flex flex-col gap-3">
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 text-xl font-bold">
              <span className={`${p.color} flex size-12 items-center justify-center rounded-2xl text-3xl`}>{p.emoji}</span>
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-base opacity-70">{best[i] !== null ? `Bestzeit ${best[i]} ms` : "–"}</span>
              <span className={`w-14 text-right text-2xl font-black ${wins[i] ? "text-mint" : "opacity-30"}`}>+{wins[i]}</span>
            </div>
          ))}
        </Card>
        <p className="mt-3 text-center text-base font-semibold opacity-70">1 Punkt pro gewonnener Runde</p>
        <Button tone="mint" className="mt-auto" onClick={() => finish(points)}>
          Punkte gutschreiben 🏁
        </Button>
      </Screen>
    );
  }

  const last = results[results.length - 1];
  const showResult = phase === "result" && last;

  const field = (i: number) => {
    const p = players[i];
    let bg = "bg-ink/80";
    let big = "";
    let small = "";
    if (phase === "ready") {
      bg = ready[i] ? "bg-mint" : p.color;
      big = ready[i] ? "✅ Bereit!" : "Tippen = bereit";
    } else if (phase === "waiting") {
      bg = early[i] ? "bg-tomato" : "bg-ink/80";
      big = early[i] ? "Zu früh! ✋" : "Warten …";
    } else if (phase === "go") {
      bg = early[i] ? "bg-tomato" : "bg-[#22c55e]";
      big = early[i] ? "Zu früh! ✋" : times[i] !== null ? `${times[i]} ms` : "JETZT!";
    } else if (showResult) {
      const isWinner = last.winner === i;
      bg = isWinner ? "bg-sun" : last.early[i] ? "bg-tomato" : "bg-ink/70";
      big = last.early[i] ? "Zu früh! ✋" : last.times[i] !== null ? `${last.times[i]} ms` : "zu langsam";
      if (isWinner) small = "🏆 Rundensieger";
    }
    const textColor = showResult && last.winner === i ? "text-ink" : "text-white";
    return (
      <div
        key={p.id}
        role="button"
        onPointerDown={(e) => onTap(i, e.timeStamp)}
        className={`${bg} ${textColor} ${i < 2 ? "rotate-180" : ""} flex touch-none select-none flex-col items-center justify-center gap-1 rounded-[2rem] text-center shadow-[0_6px_0_rgba(0,0,0,0.18)]`}
      >
        <span className="text-5xl">{p.emoji}</span>
        <span className="text-2xl font-black">{p.name}</span>
        <span className="text-3xl font-black sm:text-4xl">{big}</span>
        {small && <span className="text-lg font-extrabold">{small}</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-cream px-3 pb-3 pt-16">
      <div className="relative grid flex-1 grid-cols-2 grid-rows-2 gap-3">
        {players.map((_, i) => field(i))}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {showResult ? (
            <Button tone="grape" className="pointer-events-auto" onClick={nextRound}>
              {round + 1 >= ROUNDS ? "Ergebnis ▶️" : "Weiter ▶️"}
            </Button>
          ) : (
            <span className="rounded-full bg-white px-5 py-2 text-xl font-black shadow-[0_4px_0_#d9d2ee]">
              Runde {round + 1}/{ROUNDS}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const reaction: GameModule = {
  id: "reaction",
  name: "Reaktion",
  emoji: "⚡",
  description: "Wer tippt zuerst auf Grün?",
  kind: "mini",
  color: "bg-mint",
  available: true,
  rules: [
    "Legt das Tablet flach auf den Tisch. Jeder Spieler hat ein Feld vor sich.",
    "Tippt auf euer Feld, wenn ihr bereit seid. Sind alle bereit, heißt es warten.",
    "Nach 2 bis 7 Sekunden werden alle Felder grün und es piept. Wer zuerst sein Feld tippt, gewinnt die Runde.",
    "Wer zu früh tippt, ist für die Runde raus. Es gibt 5 Runden, jede gewonnene Runde bringt 1 Punkt.",
  ],
  Component: ReactionGame,
};
