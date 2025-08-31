import { useEffect, useRef } from "react";

export default function Sky() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const ctx = c.getContext("2d")!;

    function resize() {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.2,
      s: 0.2 + Math.random() * 0.8
    }));

    let raf = 0;
    function tick(t: number) {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const st of stars) {
        const tw = (Math.sin(t * 0.001 * st.s) + 1) / 2;
        ctx.beginPath();
        ctx.arc(st.x * c.width, st.y * c.height, st.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.7 * tw})`;
        ctx.fill();
      }
      ctx.restore();
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="sky" aria-hidden="true" />;
}
