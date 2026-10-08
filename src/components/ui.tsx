"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

const tones = {
  grape: "bg-grape text-white shadow-[0_6px_0_#5b21b6]",
  pink: "bg-pink text-white shadow-[0_6px_0_#d93673]",
  mint: "bg-mint text-ink shadow-[0_6px_0_#119c75]",
  sun: "bg-sun text-ink shadow-[0_6px_0_#d29a00]",
  sky: "bg-sky text-white shadow-[0_6px_0_#1f7fd1]",
  tomato: "bg-tomato text-white shadow-[0_6px_0_#c93c1e]",
  white: "bg-white text-ink shadow-[0_6px_0_#d9d2ee]",
} as const;

export type Tone = keyof typeof tones;

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  size?: "md" | "lg";
};

export function Button({ tone = "grape", size = "lg", className = "", ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`${tones[tone]} ${
        size === "lg" ? "min-h-16 px-8 text-2xl" : "min-h-12 px-5 text-lg"
      } rounded-3xl font-extrabold transition active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:active:translate-y-0 ${className}`}
    />
  );
}

export function Screen({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 pb-8 pt-20 ${className}`}>
      {children}
    </main>
  );
}

export function Title({ children, emoji }: { children: ReactNode; emoji?: string }) {
  return (
    <h1 className="mb-6 text-center text-4xl font-black tracking-tight sm:text-5xl">
      {emoji && <span className="mr-2 inline-block animate-wiggle">{emoji}</span>}
      {children}
    </h1>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[2rem] bg-white p-6 shadow-[0_8px_0_#e4dcf7] ${className}`}>
      {children}
    </div>
  );
}
