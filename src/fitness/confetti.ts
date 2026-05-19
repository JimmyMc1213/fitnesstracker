type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rot: number;
  spin: number;
  life: number;
};

const COLORS = ["#0A84FF", "#34C759", "#FFD60A", "#FF9F0A", "#BF5AF2", "#FF375F"];

/** Lightweight canvas confetti burst (no dependencies). */
export function fireConfetti(durationMs = 3200): () => void {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const c = ctx;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = window.innerWidth;
  let h = window.innerHeight;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:400;width:100%;height:100%;";
  document.body.appendChild(canvas);
  resize();

  const particles: Particle[] = [];
  const count = Math.min(160, Math.floor((w * h) / 4500));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: w * (0.2 + Math.random() * 0.6),
      y: h * 0.35 + Math.random() * h * 0.1,
      vx: (Math.random() - 0.5) * 9,
      vy: -6 - Math.random() * 10,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.25,
      life: 0.85 + Math.random() * 0.4,
    });
  }

  const start = performance.now();
  let raf = 0;

  function frame(now: number) {
    const t = (now - start) / durationMs;
    if (t >= 1) {
      canvas.remove();
      return;
    }
    c.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.vy += 0.22;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      const alpha = Math.max(0, p.life * (1 - t * 1.1));
      if (alpha <= 0) continue;
      c.save();
      c.globalAlpha = alpha;
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      c.restore();
    }
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.remove();
  };
}
