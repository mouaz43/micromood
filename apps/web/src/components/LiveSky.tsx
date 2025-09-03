import { useEffect, useRef } from 'react';

export default function LiveSky() {
  const ref = useRef<HTMLCanvasElement|null>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; };
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const stars = Array.from({ length: 320 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.5 + Math.random()*1.4, p: Math.random()
    }));

    let raf = 0;
    const loop = (t: number) => {
      ctx.fillStyle = '#070c16';
      ctx.fillRect(0,0,c.width,c.height);
      const T = t*0.001;
      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5+0.5*Math.sin(T*2 + s.p*6.283));
        ctx.beginPath();
        ctx.arc(s.x*c.width, s.y*c.height, s.r*dpr, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas className="live-sky" ref={ref} aria-hidden="true" />;
}
