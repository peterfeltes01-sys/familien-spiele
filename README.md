# familien-spiele
Eine Familien-Spiele-App für euch vier, als Web-App im Browser. Das Hauptspiel verzahnt Stadt-Land-Fluss, Tabu und Activity


## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Aufbau: `src/lib` (Spielstand/localStorage), `src/components` (UI, Übergabebildschirm `SecretTurn`, Rangliste, Konfetti),
`src/games` (ein Ordner pro Spiel, Registry in `src/games/index.ts`, Schnittstelle `GameModule` in `src/games/types.ts`).

Stand: Grundgerüst und alle fünf Spiele (Begriffs-Marathon, Mehrheit gewinnt, Der Hochstapler, Reaktion, Timing).
