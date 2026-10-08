"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ff5c93", "#ffc52e", "#2ed1a0", "#3ba7ff", "#7c3aed", "#ff6240"];

export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * w,
      y: Math.random() * -h,
      r: 5 + Math.random() * 7,
      vy: 2 + Math.random() * 3.5,
      vx: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI,
      vr: -0.15 + Math.random() * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-40" />;
}
