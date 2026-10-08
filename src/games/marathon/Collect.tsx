"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";
import { Button, Screen } from "@/components/ui";
import { SecretTurn } from "@/components/SecretTurn";
import type { Prompt } from "./state";

const norm = (s: string) => s.trim().toLowerCase();

function TermInput({
  prompt,
  terms,
  onSubmit,
}: {
  prompt: Prompt;
  terms: string[];
  onSubmit: (term: string) => void;
}) {
  const [value, setValue] = useState("");
  const [warn, setWarn] = useState<"" | "dup" | "letter">("");
  const [confirmed, setConfirmed] = useState(false);

  const submit = () => {
    const t = value.trim();
    if (!t) return;
    if (terms.some((x) => norm(x) === norm(t))) return setWarn("dup");
    if (!confirmed && !norm(t).startsWith(prompt.letter.toLowerCase())) {
      setWarn("letter");
      setConfirmed(true);
      return;
    }
    onSubmit(t);
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="rounded-[2rem] bg-white p-6 text-center shadow-[0_8px_0_#e4dcf7]">
        <p className="text-xl font-bold opacity-70">Kategorie</p>
        <p className="text-4xl font-black text-grape">{prompt.category}</p>
        <p className="mt-3 text-xl font-bold opacity-70">mit dem Buchstaben</p>
        <p className="text-8xl font-black text-pink">{prompt.letter}</p>
      </div>
      <input
        autoFocus
        value={value}
        maxLength={30}
        placeholder="Dein Begriff …"
        onChange={(e) => {
          setValue(e.target.value);
          setWarn("");
          setConfirmed(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="min-h-16 w-full rounded-2xl border-4 border-ink/10 bg-white px-4 text-center text-3xl font-bold outline-none focus:border-grape"
      />
      {warn === "dup" && <p className="text-center font-bold text-tomato">Den gibt es schon im Stapel – nimm einen anderen!</p>}
      {warn === "letter" && (
        <p className="text-center font-bold text-tomato">Der Begriff beginnt nicht mit „{prompt.letter}“. Nochmal tippen, wenn es trotzdem passt.</p>
      )}
      <Button tone="mint" className="mt-auto" disabled={!value.trim()} onClick={submit}>
        {warn === "letter" ? "Trotzdem nehmen" : "Fertig ✅"}
      </Button>
    </div>
  );
}

/** Phase 1: Reihum gibt jeder geheim einen Begriff zur aktuellen Kategorie ein. */
export function Collect({
  players,
  prompts,
  terms,
  onAdd,
}: {
  players: Player[];
  prompts: Prompt[];
  terms: string[];
  onAdd: (term: string) => void;
}) {
  const n = players.length;
  const round = Math.floor(terms.length / n);
  const turn = terms.length % n;
  const prompt = prompts[round];

  return (
    <Screen>
      <p className="mb-3 text-center text-xl font-extrabold opacity-60">
        Begriffe sammeln · {terms.length} von {prompts.length * n}
      </p>
      <SecretTurn
        key={terms.length}
        player={players[turn]}
        hint={`Kategorie: ${prompt.category} mit ${prompt.letter}`}
        onDone={() => {}}
      >
        {() => <TermInput prompt={prompt} terms={terms} onSubmit={onAdd} />}
      </SecretTurn>
    </Screen>
  );
}
