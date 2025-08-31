import React, { useEffect, useRef } from "react";

export default function Hero({ phase }: { phase: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  // twinkling stars + simple phase shading
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      t: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random() * 0.5,
    }));

    function draw() {
      const w = canvas.width;
      const h = canvas.height;

      // sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0a1224");
      g.addColorStop(1, "#0b1020");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // stars
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "white";
      for (const s of stars) {
        const a = 0.4 + Math.sin(s.t) * 0.4;
        ctx.globalAlpha = a * s.s;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r * (w / 1200), 0, Math.PI * 2);
        ctx.fill();
        s.t += 0.01 + s.s * 0.01;
      }
      ctx.restore();

      // hero moon
      const mx = w * 0.5;
      const my = h * 0.65;
      const R = Math.min(w, h) * 0.18;

      // full disc
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(mx, my, R, 0, Math.PI * 2);
      ctx.fill();

      // limb (phase) using two arcs
      const k = Math.max(-1, Math.min(1, Math.cos(phase * 2 * Math.PI)));
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.ellipse(mx, my, Math.abs(k) * R, R, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // soft glow
      const glow = ctx.createRadialGradient(mx, my, R * 0.6, mx, my, R * 1.8);
      glow.addColorStop(0, "rgba(180,200,255,0.35)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mx, my, R * 1.8, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  return (
    <header className="hero">
      <canvas ref={ref} className="sky" />
      <div className="hero-copy">
        <h1>One sky. One moon. Many hearts.</h1>
        <p>
          Somewhere you can’t see them, strangers are looking up at the same
          moon. Each pulse you share becomes part of a constellation of
          feelings—proof that we’re never truly alone in the night.
        </p>
      </div>
    </header>
  );
}
