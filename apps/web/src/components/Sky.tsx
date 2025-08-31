import { useEffect, useRef } from "react";

export default function Sky() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.max(1, devicePixelRatio || 1);

    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
    };
    resize(); addEventListener("resize", resize);

    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.3,
      s: 0.25 + Math.random() * 0.9,
    }));

    let raf = 0;
    const loop = (t: number) => {
      ctx.fillStyle = "#070c16"; ctx.fillRect(0,0,c.width,c.height);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const st of stars) {
        const a = (Math.sin(t * 0.001 * st.s) + 1) / 2;
        ctx.beginPath();
        ctx.arc(st.x * c.width, st.y * c.height, st.r * dpr, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${0.25 + a*0.7})`; ctx.fill();
      }
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return <canvas className="sky" ref={ref} aria-hidden="true" />;
}
