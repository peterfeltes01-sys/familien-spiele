"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "@/lib/types";
import { Button, Card, Screen } from "@/components/ui";
import { beep, unlockAudio } from "@/lib/sound";
import { shuffle, vibrate } from "@/lib/util";
import { ROUND_INFO, TEAM_STYLE, type Pair, type Play, type Settings } from "./state";

type Props = {
  players: Player[];
  teams: [Pair, Pair];
  settings: Settings;
  terms: string[];
  play: Play;
  setPlay: (fn: (p: Play) => Play) => void;
  onDone: () => void;
};

const teamLabel = (players: Player[], team: Pair) => team.map((i) => players[i].name).join(" & ");

function ScoreBar({ players, teams, play }: { players: Player[]; teams: [Pair, Pair]; play: Play }) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      {[0, 1].map((t) => (
        <div key={t} className={`${TEAM_STYLE[t].bg} flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-white`}>
          <span className="truncate text-sm font-bold">{teamLabel(players, teams[t])}</span>
          <span className="text-2xl font-black">{play.teamPoints[t]}</span>
        </div>
      ))}
    </div>
  );
}

function Turn({
  term,
  remaining,
  endsAt,
  canSkip,
  round,
  onCorrect,
  onSkip,
  onTimeUp,
}: {
  term: string;
  remaining: number;
  endsAt: number;
  canSkip: boolean;
  round: number;
  onCorrect: () => void;
  onSkip: () => void;
  onTimeUp: () => void;
}) {
  const total = useRef(Math.max(1, endsAt - Date.now()));
  const [left, setLeft] = useState(() => Math.max(0, endsAt - Date.now()));
  const timeUp = useRef(onTimeUp);
  timeUp.current = onTimeUp;

  useEffect(() => {
    let fired = false;
    const id = setInterval(() => {
      const l = endsAt - Date.now();
      setLeft(Math.max(0, l));
      if (l <= 0 && !fired) {
        fired = true;
        clearInterval(id);
        timeUp.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [endsAt]);

  const secs = Math.ceil(left / 1000);
  const urgent = secs <= 10;
  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-5 flex-1 overflow-hidden rounded-full bg-white">
          <div className={`h-full ${urgent ? "bg-tomato" : "bg-mint"}`} style={{ width: `${(left / total.current) * 100}%` }} />
        </div>
        <span className={`w-16 text-right text-4xl font-black ${urgent ? "text-tomato" : ""}`}>{secs}</span>
      </div>
      <p className="mb-3 text-center text-lg font-extrabold opacity-70">
        {ROUND_INFO[round].emoji} {ROUND_INFO[round].title} · noch {remaining} im Stapel
      </p>
      <div className="flex flex-1 items-center justify-center rounded-[2.5rem] bg-white p-6 text-center shadow-[0_8px_0_#e4dcf7]">
        <p className="break-words text-5xl font-black leading-tight text-grape sm:text-7xl">{term}</p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <Button tone="mint" className="py-8 text-4xl" onClick={onCorrect}>
          ✅ Richtig
        </Button>
        <Button tone="white" disabled={!canSkip} onClick={onSkip}>
          ⏭️ Überspringen
        </Button>
      </div>
    </>
  );
}

export function PlayPhase({ players, teams, settings, terms, play, setPlay, onDone }: Props) {
  const endsAt = useRef(0);
  const team = play.turnNo % 2;
  const members = teams[team];
  const explainer = players[members[play.teamTurns[team] % 2]];
  const partner = players[members[(play.teamTurns[team] + 1) % 2]];
  const info = ROUND_INFO[play.round];

  // Zug beenden: das Team ist dran gewesen, nächster Zug = anderes Team
  const finishTurn = (p: Play, patch: Partial<Play>): Play => {
    const tt: Pair = [...p.teamTurns] as Pair;
    tt[team] += 1;
    return { ...p, ...patch, teamTurns: tt, turnNo: p.turnNo + 1 };
  };

  if (play.phase === "roundIntro") {
    return (
      <Screen>
        <ScoreBar players={players} teams={teams} play={play} />
        <p className="text-center text-xl font-extrabold opacity-60">Runde {play.round + 1} von 3</p>
        <div className="my-4 text-center text-8xl">{info.emoji}</div>
        <h1 className="mb-4 text-center text-4xl font-black">{info.title}</h1>
        <Card className="text-center text-2xl font-semibold">{info.rule}</Card>
        <p className="mt-4 text-center text-lg font-semibold opacity-70">
          Alle {play.queue.length} Begriffe sind wieder im Stapel.
        </p>
        <Button tone="mint" className="mt-auto" onClick={() => setPlay((p) => ({ ...p, phase: "turnIntro" }))}>
          Los geht’s! 🚀
        </Button>
      </Screen>
    );
  }

  if (play.phase === "turnIntro") {
    return (
      <Screen>
        <ScoreBar players={players} teams={teams} play={play} />
        <div className={`${TEAM_STYLE[team].bg} flex flex-1 flex-col items-center justify-center gap-3 rounded-[2.5rem] p-8 text-center text-white shadow-[0_8px_0_rgba(0,0,0,0.18)]`}>
          <span className="text-xl font-bold opacity-90">
            {TEAM_STYLE[team].emoji} Team {team + 1} ist dran
          </span>
          <span className="text-7xl">{explainer.emoji}</span>
          <span className="text-2xl font-bold opacity-90">Gib das Gerät an</span>
          <span className="text-5xl font-black">{explainer.name}</span>
          <span className="text-xl font-semibold opacity-90">
            {partner.name} rät mit. Die anderen schauen weg!
          </span>
          <span className="mt-4 rounded-2xl bg-white/25 px-5 py-3 text-xl font-bold">
            {info.emoji} {info.title}
          </span>
        </div>
        <Button
          tone="mint"
          className="mt-5"
          onClick={() => {
            unlockAudio();
            endsAt.current = Date.now() + settings.turnSeconds * 1000;
            setPlay((p) => ({ ...p, phase: "turn", turnGuessed: 0 }));
          }}
        >
          ▶️ Start – {settings.turnSeconds} Sekunden
        </Button>
      </Screen>
    );
  }

  if (play.phase === "turn") {
    return (
      <Screen className="pt-16">
        <ScoreBar players={players} teams={teams} play={play} />
        <Turn
          term={play.queue[0]}
          remaining={play.queue.length}
          endsAt={endsAt.current}
          canSkip={play.queue.length > 1}
          round={play.round}
          onCorrect={() =>
            setPlay((p) => {
              const points: Pair = [...p.teamPoints] as Pair;
              points[team] += 1;
              const queue = p.queue.slice(1);
              const guessed = p.turnGuessed + 1;
              if (queue.length === 0) {
                return finishTurn({ ...p, teamPoints: points, turnGuessed: guessed }, { queue, teamPoints: points, turnGuessed: guessed, phase: "roundEnd" });
              }
              return { ...p, queue, teamPoints: points, turnGuessed: guessed };
            })
          }
          onSkip={() => setPlay((p) => ({ ...p, queue: [...p.queue.slice(1), p.queue[0]] }))}
          onTimeUp={() => {
            beep(660, 200);
            setTimeout(() => beep(660, 200), 300);
            setTimeout(() => beep(440, 600), 600);
            vibrate([200, 100, 200, 100, 500]);
            // Der gerade gezeigte Begriff wandert ans Ende des Stapels.
            setPlay((p) => finishTurn(p, { queue: [...p.queue.slice(1), p.queue[0]], phase: "turnEnd" }));
          }}
        />
      </Screen>
    );
  }

  if (play.phase === "turnEnd") {
    // finishTurn hat turnNo schon erhöht: das Team, das gerade gespielt hat, ist das andere.
    const justPlayed = (play.turnNo + 1) % 2;
    return (
      <Screen>
        <ScoreBar players={players} teams={teams} play={play} />
        <div className="my-6 text-center text-8xl">⏰</div>
        <h1 className="mb-2 text-center text-4xl font-black">Die Zeit ist um!</h1>
        <p className="mb-6 text-center text-2xl font-bold">
          {play.turnGuessed === 0 ? "Diesmal keinen erraten." : `${play.turnGuessed} ${play.turnGuessed === 1 ? "Begriff" : "Begriffe"} erraten – +${play.turnGuessed} für Team ${justPlayed + 1}!`}
        </p>
        <p className="text-center text-lg font-semibold opacity-70">Noch {play.queue.length} im Stapel.</p>
        <Button tone="mint" className="mt-auto" onClick={() => setPlay((p) => ({ ...p, phase: "turnIntro" }))}>
          Weiter ▶️
        </Button>
      </Screen>
    );
  }

  // roundEnd (nach finishTurn zeigt `team` schon auf das nächste Team – daher nur Rundenpunkte aus den Summen)
  const roundPts: Pair = [play.teamPoints[0] - play.roundStart[0], play.teamPoints[1] - play.roundStart[1]];
  const lastRound = play.round >= 2;
  return (
    <Screen>
      <div className="mb-2 text-center text-7xl">🎉</div>
      <h1 className="mb-1 text-center text-4xl font-black">Runde {play.round + 1} geschafft!</h1>
      <p className="mb-5 text-center text-lg font-semibold opacity-70">Alle Begriffe sind erraten.</p>
      <Card className="flex flex-col gap-3">
        {[0, 1].map((t) => (
          <div key={t} className="flex items-center gap-3 text-xl font-bold">
            <span className={`${TEAM_STYLE[t].bg} flex size-12 items-center justify-center rounded-2xl text-2xl`}>{TEAM_STYLE[t].emoji}</span>
            <span className="flex-1 truncate">{teamLabel(players, teams[t])}</span>
            <span className="text-mint">+{roundPts[t]}</span>
            <span className="w-12 text-right text-3xl font-black">{play.teamPoints[t]}</span>
          </div>
        ))}
      </Card>
      <Button
        tone="mint"
        className="mt-auto"
        onClick={() => {
          if (lastRound) return onDone();
          const queue = shuffle(terms);
          setPlay((p) => ({ ...p, round: p.round + 1, queue, phase: "roundIntro", roundStart: p.teamPoints, turnGuessed: 0 }));
        }}
      >
        {lastRound ? "Zum Ergebnis 🏆" : `Runde ${play.round + 2}: ${ROUND_INFO[play.round + 1].title} ▶️`}
      </Button>
    </Screen>
  );
}
