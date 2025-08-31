import React, { useEffect, useRef } from "react";

// soft star field + drifting noise
export default function Sky() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const dpr = window.devicePixelRatio || 1;
    const ctx = c.getContext("2d")!;
    let w=innerWidth, h=innerHeight;
    const resize = () => {
      w = innerWidth; h = innerHeight;
      c.width = w*dpr; c.height = h*dpr; c.style.width = w+"px"; c.style.height = h+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    // make stars
    const stars = Array.from({length: 160}, () => ({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.4+0.4, a: Math.random()*0.6+0.2
    }));

    let t=0, raf=0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t+=0.0025;
      ctx.clearRect(0,0,w,h);

      // subtle blue haze
      const g = ctx.createRadialGradient(w*0.8, -h*0.2, 0, w*0.8, -h*0.2, Math.max(w,h)*1.0);
      g.addColorStop(0, "rgba(60,100,220,0.10)");
      g.addColorStop(1, "rgba(5,7,15,0.0)");
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

      // stars
      for (const s of stars) {
        const twinkle = 0.5 + 0.5*Math.sin(t*3 + s.x*0.03 + s.y*0.02);
        ctx.globalAlpha = s.a * (0.6 + 0.4*twinkle);
        ctx.fillStyle = "#e7f3ff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    loop();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas className="sky-root" ref={ref} />;
}
