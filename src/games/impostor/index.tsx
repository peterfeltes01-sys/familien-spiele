"use client";

import { useState } from "react";
import type { GameModule, GameProps } from "../types";
import type { Player, PointsAward } from "@/lib/types";
import { Button, Card, Screen } from "@/components/ui";
import { SecretTurn } from "@/components/SecretTurn";
import { pick, shuffle, takeUnseen } from "@/lib/util";
import { WORD_PAIRS } from "./words";

type Phase = "reveal" | "hint" | "vote" | "result" | "guess" | "summary";

function setup(players: Player[]) {
  const [[word, decoy]] = takeUnseen("impostor", WORD_PAIRS, 1);
  // Antwortmöglichkeiten fürs Raten: echtes Wort, Tarnwort und zwei andere Wörter
  const others = shuffle(WORD_PAIRS.map((p) => p[0]).filter((w) => w !== word && w !== decoy)).slice(0, 2);
  return {
    word,
    decoy,
    impostor: Math.floor(Math.random() * players.length),
    starter: Math.floor(Math.random() * players.length),
    options: shuffle([word, decoy, ...others]),
  };
}

function ImpostorGame({ players, finish }: GameProps) {
  const [round] = useState(() => setup(players));
  const { word, decoy, impostor, starter, options } = round;

  const [phase, setPhase] = useState<Phase>("reveal");
  const [turn, setTurn] = useState(0);
  const [votes, setVotes] = useState<number[]>([]); // votes[i] = Index, den Spieler i gewählt hat
  const [guess, setGuess] = useState<string | null>(null);

  const n = players.length;
  const nameOf = (i: number) => players[i].name;

  const tally = players.map((_, i) => votes.filter((v) => v === i).length);
  const maxVotes = Math.max(0, ...tally);
  // Entlarvt nur bei eindeutiger Mehrheit; bei Gleichstand kommt der Hochstapler davon.
  const caught = votes.length === n && tally[impostor] === maxVotes && tally.filter((t) => t === maxVotes).length === 1;
  const guessedRight = guess === word;

  const computePoints = (): PointsAward => {
    const pts: PointsAward = Object.fromEntries(players.map((p) => [p.id, 0]));
    if (caught) {
      players.forEach((p, i) => {
        if (votes[i] === impostor) pts[p.id] += 1;
      });
      if (guessedRight) pts[players[impostor].id] += 1;
    } else {
      pts[players[impostor].id] += 2;
    }
    return pts;
  };

  if (phase === "reveal") {
    const player = players[turn];
    const isImpostor = turn === impostor;
    return (
      <Screen>
        <SecretTurn
          key={turn}
          player={player}
          hideButton
          hint="Schau dir dein Wort an – niemand schaut mit!"
          onDone={() => (turn + 1 < n ? setTurn(turn + 1) : (setTurn(0), setPhase("hint")))}
        >
          {() =>
            isImpostor ? (
              <Card className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <div className="text-8xl">🕵️</div>
                <h2 className="text-4xl font-black text-tomato">Du bist der Hochstapler!</h2>
                <p className="text-xl font-semibold opacity-70">
                  Tu so, als würdest du das Wort kennen. Zur Tarnung ein ähnliches Wort:
                </p>
                <p className="text-5xl font-black">{decoy}</p>
              </Card>
            ) : (
              <Card className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <p className="text-xl font-semibold opacity-70">Das geheime Wort ist:</p>
                <p className="text-6xl font-black text-grape">{word}</p>
                <p className="text-lg font-semibold opacity-70">Einer von euch kennt es nicht …</p>
              </Card>
            )
          }
        </SecretTurn>
      </Screen>
    );
  }

  if (phase === "hint") {
    const order = Array.from({ length: n }, (_, k) => (starter + k) % n);
    return (
      <Screen>
        <div className="mb-4 text-center text-7xl">🗣️</div>
        <h1 className="mb-6 text-center text-3xl font-black sm:text-4xl">
          Beschreibt jetzt reihum das Wort mit einem Satz
        </h1>
        <Card className="flex flex-col gap-3">
          <p className="text-center text-xl font-bold opacity-70">
            {nameOf(starter)} beginnt – Reihenfolge:
          </p>
          {order.map((i, k) => (
            <div key={i} className={`${players[i].color} flex items-center gap-3 rounded-2xl px-4 py-3 text-xl font-extrabold text-white`}>
              <span className="w-6">{k + 1}.</span>
              <span className="text-3xl">{players[i].emoji}</span>
              <span>{players[i].name}</span>
            </div>
          ))}
        </Card>
        <p className="mt-4 text-center text-lg font-semibold opacity-70">
          Nicht zu genau, sonst erkennt der Hochstapler das Wort!
        </p>
        <Button tone="mint" className="mt-auto" onClick={() => setPhase("vote")}>
          Weiter zur Abstimmung 🗳️
        </Button>
      </Screen>
    );
  }

  if (phase === "vote") {
    const player = players[turn];
    return (
      <Screen>
        <SecretTurn
          key={turn}
          player={player}
          hint="Stimme geheim ab – niemand schaut mit!"
          onDone={() => {}}
        >
          {() => (
            <>
              <h2 className="text-center text-3xl font-black">Wer ist der Hochstapler? 🕵️</h2>
              <div className="flex flex-1 flex-col gap-4">
                {players.map((p, i) =>
                  i === turn ? null : (
                    <Button
                      key={p.id}
                      tone="white"
                      className="flex flex-1 items-center justify-center gap-3 text-3xl"
                      onClick={() => {
                        setVotes([...votes, i]);
                        if (turn + 1 < n) setTurn(turn + 1);
                        else setPhase("result");
                      }}
                    >
                      <span className={`${p.color} flex size-14 items-center justify-center rounded-2xl text-4xl`}>{p.emoji}</span>
                      {p.name}
                    </Button>
                  ),
                )}
              </div>
            </>
          )}
        </SecretTurn>
      </Screen>
    );
  }

  if (phase === "result") {
    return (
      <Screen>
        <div className="mb-2 text-center text-7xl">{caught ? "🎯" : "😎"}</div>
        <h1 className="mb-1 text-center text-3xl font-black sm:text-4xl">
          {caught ? "Hochstapler entlarvt!" : "Der Hochstapler kommt davon!"}
        </h1>
        <p className="mb-4 text-center text-xl font-bold">
          Der Hochstapler war <span className="text-tomato">{players[impostor].emoji} {nameOf(impostor)}</span>
        </p>
        <Card className="flex flex-col gap-3">
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 text-xl font-bold">
              <span className={`${p.color} flex size-12 items-center justify-center rounded-2xl text-3xl`}>{p.emoji}</span>
              <span className="flex-1 truncate">
                {p.name} {i === impostor && "🕵️"}
              </span>
              <span className="text-base opacity-70">
                {tally[i]} {tally[i] === 1 ? "Stimme" : "Stimmen"}
              </span>
            </div>
          ))}
          <hr className="border-ink/10" />
          {players.map((p, i) => (
            <p key={p.id} className="text-base font-semibold opacity-70">
              {p.name} → {nameOf(votes[i])}
              {votes[i] === impostor && " ✅"}
            </p>
          ))}
        </Card>
        {!caught && tally.filter((t) => t === maxVotes).length > 1 && (
          <p className="mt-3 text-center font-bold opacity-70">Gleichstand – das zählt nicht als Entlarvung.</p>
        )}
        <Button tone="mint" className="mt-auto" onClick={() => setPhase(caught ? "guess" : "summary")}>
          {caught ? "Bonus: Wort raten 🎁" : "Weiter ▶️"}
        </Button>
      </Screen>
    );
  }

  if (phase === "guess") {
    return (
      <Screen>
        <h1 className="mb-2 text-center text-3xl font-black">
          {players[impostor].emoji} {nameOf(impostor)}, rate das echte Wort!
        </h1>
        <p className="mb-5 text-center text-lg font-semibold opacity-70">Triffst du, bekommst du 1 Punkt.</p>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          {options.map((o, i) => (
            <Button
              key={o}
              tone={(["pink", "sky", "sun", "mint"] as const)[i % 4]}
              className="text-3xl"
              onClick={() => {
                setGuess(o);
                setPhase("summary");
              }}
            >
              {o}
            </Button>
          ))}
        </div>
      </Screen>
    );
  }

  // summary
  const pts = computePoints();
  return (
    <Screen>
      <p className="mb-2 text-center text-xl font-semibold opacity-70">Das Wort war</p>
      <h1 className="mb-1 text-center text-5xl font-black text-grape">{word}</h1>
      <p className="mb-4 text-center text-lg font-semibold opacity-70">(Tarnwort: {decoy})</p>
      {caught && (
        <p className="mb-4 text-center text-xl font-extrabold">
          {guessedRight ? `🎉 ${nameOf(impostor)} hat „${guess}“ richtig geraten!` : `❌ ${nameOf(impostor)} hat „${guess}“ geraten – leider falsch.`}
        </p>
      )}
      <Card className="flex flex-col gap-3">
        <h2 className="text-center text-2xl font-black">Punkte</h2>
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-3 text-xl font-bold">
            <span className={`${p.color} flex size-12 items-center justify-center rounded-2xl text-3xl`}>{p.emoji}</span>
            <span className="flex-1 truncate">{p.name}</span>
            <span className={`text-2xl font-black ${pts[p.id] ? "text-mint" : "opacity-30"}`}>+{pts[p.id]}</span>
          </div>
        ))}
      </Card>
      <Button tone="mint" className="mt-auto" onClick={() => finish(pts)}>
        Punkte gutschreiben 🏁
      </Button>
    </Screen>
  );
}

export const impostor: GameModule = {
  id: "impostor",
  name: "Der Hochstapler",
  emoji: "🕵️",
  description: "Einer kennt das Wort nicht. Wer ist es?",
  kind: "mini",
  color: "bg-tomato",
  available: true,
  rules: [
    "Alle sehen nacheinander geheim dasselbe Wort – außer einem zufälligen Spieler: Der ist der Hochstapler und sieht nur ein ähnliches Tarnwort.",
    "Dann beschreibt jeder reihum das Wort mit einem Satz (mündlich am Tisch). Der Hochstapler muss unauffällig mitbluffen.",
    "Danach stimmt jeder geheim ab, wer der Hochstapler ist. Bei Gleichstand kommt er davon.",
    "Entlarvt: Jeder, der richtig getippt hat, bekommt 1 Punkt. Der Hochstapler darf dann das echte Wort raten (4 Antworten) und bekommt bei Treffer 1 Punkt.",
    "Nicht entlarvt: Der Hochstapler bekommt 2 Punkte.",
  ],
  Component: ImpostorGame,
};
