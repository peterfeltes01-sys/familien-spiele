"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";
import { Button, Card, Screen } from "@/components/ui";
import { shuffle } from "@/lib/util";
import { DEFAULT_SETTINGS, TEAM_STYLE, type Pair, type Settings } from "./state";

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: number; text: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-lg font-extrabold">{label}</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-14 flex-1 rounded-2xl text-xl font-extrabold ${
              o.value === value ? "bg-grape text-white" : "bg-cream text-ink"
            }`}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Setup({
  players,
  onStart,
}: {
  players: Player[];
  onStart: (teams: [Pair, Pair], settings: Settings) => void;
}) {
  const [teamOf, setTeamOf] = useState<number[]>(() => shuffle([0, 0, 1, 1]));
  const [selected, setSelected] = useState<number | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const tap = (i: number) => {
    if (selected === null) return setSelected(i);
    if (selected === i) return setSelected(null);
    if (teamOf[selected] !== teamOf[i]) {
      const next = [...teamOf];
      [next[selected], next[i]] = [next[i], next[selected]];
      setTeamOf(next);
      setSelected(null);
    } else setSelected(i);
  };

  const members = (t: number) => players.map((_, i) => i).filter((i) => teamOf[i] === t);

  return (
    <Screen>
      <h1 className="mb-4 text-center text-4xl font-black">🏃 Teams &amp; Einstellungen</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((t) => (
          <div key={t} className={`${TEAM_STYLE[t].bg} rounded-[2rem] p-4 text-white shadow-[0_6px_0_rgba(0,0,0,0.18)]`}>
            <p className="mb-2 text-center text-2xl font-black">
              {TEAM_STYLE[t].emoji} Team {t + 1}
            </p>
            <div className="flex flex-col gap-2">
              {members(t).map((i) => (
                <button
                  key={i}
                  onClick={() => tap(i)}
                  className={`flex min-h-16 items-center gap-3 rounded-2xl bg-white px-4 text-xl font-extrabold text-ink ${
                    selected === i ? "ring-8 ring-sun" : ""
                  }`}
                >
                  <span className="text-3xl">{players[i].emoji}</span>
                  {players[i].name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-base font-semibold opacity-70">
        Tippe zwei Spieler aus verschiedenen Teams nacheinander an, um sie zu tauschen.
      </p>
      <Button tone="white" size="md" className="mt-2 self-center" onClick={() => { setTeamOf(shuffle([0, 0, 1, 1])); setSelected(null); }}>
        🎲 Neu auslosen
      </Button>

      <Card className="mt-6 flex flex-col gap-5">
        <Choice
          label="Zeit pro Zug"
          value={settings.turnSeconds}
          onChange={(v) => setSettings({ ...settings, turnSeconds: v })}
          options={[30, 45, 60, 90].map((v) => ({ value: v, text: `${v} s` }))}
        />
        <Choice
          label="Begriffe im Stapel"
          value={settings.collectRounds}
          onChange={(v) => setSettings({ ...settings, collectRounds: v })}
          options={[5, 6, 7].map((v) => ({ value: v, text: `${v * players.length}` }))}
        />
      </Card>

      <Button
        tone="mint"
        className="mt-auto"
        onClick={() => onStart([members(0) as unknown as Pair, members(1) as unknown as Pair], settings)}
      >
        Begriffe sammeln ✍️
      </Button>
    </Screen>
  );
}
