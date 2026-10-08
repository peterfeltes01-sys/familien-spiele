"use client";

import { useMemo, useState } from "react";
import type { GameModule, GameProps } from "../types";
import { Button, Card, Screen } from "@/components/ui";
import { SecretTurn } from "@/components/SecretTurn";
import { QUESTIONS } from "./questions";
import { takeUnseen } from "@/lib/util";
import type { PointsAward } from "@/lib/types";

const ROUNDS = 6;

type Choice = 0 | 1;

function MajorityGame({ players, finish }: GameProps) {
  // Fragen einmalig ziehen; zuvor gespielte Fragen werden bevorzugt vermieden.
  const questions = useMemo(() => takeUnseen("majority", QUESTIONS, ROUNDS), []);
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState(0); // wer gerade wählt
  const [votes, setVotes] = useState<Choice[]>([]);
  const [totals, setTotals] = useState<PointsAward>(() => Object.fromEntries(players.map((p) => [p.id, 0])));

  const q = questions[round];
  const voting = votes.length < players.length;

  if (voting) {
    const player = players[turn];
    return (
      <Screen>
        <p className="mb-3 text-center text-xl font-extrabold opacity-60">
          Frage {round + 1} von {ROUNDS}
        </p>
        <SecretTurn
          key={`${round}-${turn}`}
          player={player}
          hint="Wähle geheim – niemand schaut mit!"
          onDone={() => {}}
        >
          {() => (
            <>
              <h2 className="text-center text-3xl font-black">Was gefällt dir besser?</h2>
              <div className="flex flex-1 flex-col gap-5">
                {q.map((label, i) => (
                  <Button
                    key={i}
                    tone={i === 0 ? "pink" : "sky"}
                    className="flex-1 text-4xl"
                    onClick={() => {
                      setVotes((v) => [...v, i as Choice]);
                      setTurn((t) => (t + 1) % players.length);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </SecretTurn>
      </Screen>
    );
  }

  // Auflösung
  const countA = votes.filter((v) => v === 0).length;
  const countB = votes.length - countA;
  const tie = countA === countB;
  const winner: Choice | null = tie ? null : countA > countB ? 0 : 1;
  const winners = players.filter((_, i) => winner !== null && votes[i] === winner);
  const last = round === ROUNDS - 1;

  const next = () => {
    const merged = { ...totals };
    for (const p of winners) merged[p.id] += 1;
    if (last) {
      finish(merged);
      return;
    }
    setTotals(merged);
    setVotes([]);
    setTurn(0);
    setRound(round + 1);
  };

  return (
    <Screen>
      <p className="mb-3 text-center text-xl font-extrabold opacity-60">
        Auflösung · Frage {round + 1} von {ROUNDS}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {q.map((label, i) => (
          <div
            key={i}
            className={`${i === 0 ? "bg-pink" : "bg-sky"} rounded-3xl p-4 text-center text-white ${
              winner === i ? "ring-8 ring-sun" : winner === null ? "" : "opacity-50"
            }`}
          >
            <div className="text-2xl font-black">{label}</div>
            <div className="mt-1 text-6xl font-black">{i === 0 ? countA : countB}</div>
          </div>
        ))}
      </div>
      <Card className="mt-6 flex flex-col gap-3">
        <h2 className="text-center text-3xl font-black">
          {tie ? "🤝 Unentschieden – keine Punkte!" : "🎉 Mehrheit gewinnt!"}
        </h2>
        {players.map((p, i) => {
          const gets = winner !== null && votes[i] === winner;
          return (
            <div key={p.id} className="flex items-center gap-3 text-xl font-bold">
              <span className={`${p.color} flex size-12 items-center justify-center rounded-2xl text-3xl`}>
                {p.emoji}
              </span>
              <span className="flex-1 truncate">{p.name}</span>
              <span className="truncate text-base opacity-70">{q[votes[i]]}</span>
              <span className={`w-14 text-right text-2xl font-black ${gets ? "text-mint" : "opacity-30"}`}>
                {gets ? "+1" : "0"}
              </span>
            </div>
          );
        })}
      </Card>
      <Button tone="mint" className="mt-auto" onClick={next}>
        {last ? "Fertig – Punkte gutschreiben 🏁" : "Nächste Frage ▶️"}
      </Button>
    </Screen>
  );
}

export const majority: GameModule = {
  id: "majority",
  name: "Mehrheit gewinnt",
  emoji: "🗳️",
  description: "Berge oder Meer? Wer mit der Mehrheit stimmt, punktet.",
  kind: "mini",
  color: "bg-pink",
  available: true,
  rules: [
    `Es gibt ${ROUNDS} Fragen mit je zwei Antworten.`,
    "Das Gerät wird reihum weitergereicht. Jeder wählt geheim, was ihm besser gefällt.",
    "Danach wird aufgelöst: Wer mit der Mehrheit gestimmt hat, bekommt 1 Punkt.",
    "Bei 2 : 2 gibt es keine Punkte. Tipp: Überlegt, was die anderen wohl wählen!",
  ],
  Component: MajorityGame,
};
