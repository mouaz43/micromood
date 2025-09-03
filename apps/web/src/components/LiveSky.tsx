import React, { useEffect, useRef } from 'react';

export default function LiveSky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const dpr = window.devicePixelRatio || 1;
    const ctx = c.getContext('2d')!;
    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
    };
    resize();
    let raf = 0;
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.5 + 0.2,
      p: Math.random()
    }));
    const loop = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, c.width, c.height);
      const t = performance.now() / 1000;
      for (const st of stars) {
        const tw = (Math.sin(t * 2 + st.p * 6.28) + 1) * 0.5;
        ctx.globalAlpha = 0.3 + 0.7 * tw;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(st.x * c.width, st.y * c.height, st.s * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} className="live-sky" />;
}
