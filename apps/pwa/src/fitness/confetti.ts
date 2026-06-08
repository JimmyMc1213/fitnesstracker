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

const FUTURE_YOU_CONFETTI_COLORS = ["#c9a876", "#d4b88a", "#b89566", "#e8d4b8", "#f5ead8", "#ffffff"];

export type ConfettiOrigin = {
  x: number;
  y: number;
  width: number;
};

export function shouldCelebrateFutureYouReady(
  previousStatus: string,
  nextStatus: string,
): boolean {
  return nextStatus === "ready" && previousStatus !== "ready";
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function mountConfettiCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; resize: () => void } | null {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx = context;

  canvas.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9998;width:100%;height:100%;";
  document.body.appendChild(canvas);

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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  return { canvas, ctx, resize };
}

/** Subtle gold confetti that pops from the Future You pill and drifts down the page. */
export function fireFutureYouReadyConfetti(origin: ConfettiOrigin, durationMs = 2400): () => void {
  if (prefersReducedMotion()) return () => {};

  const mounted = mountConfettiCanvas();
  if (!mounted) return () => {};
  const { canvas, ctx, resize } = mounted;

  let w = window.innerWidth;
  let h = window.innerHeight;
  const refreshBounds = () => {
    w = window.innerWidth;
    h = window.innerHeight;
  };
  refreshBounds();

  const particles: Particle[] = [];
  const count = 32;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: origin.x + (Math.random() - 0.5) * origin.width * 1.35,
      y: origin.y + Math.random() * 10,
      vx: (Math.random() - 0.5) * 4.5,
      vy: -2.5 - Math.random() * 4,
      w: 3 + Math.random() * 4,
      h: 2 + Math.random() * 3,
      color: FUTURE_YOU_CONFETTI_COLORS[Math.floor(Math.random() * FUTURE_YOU_CONFETTI_COLORS.length)]!,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.18,
      life: 0.7 + Math.random() * 0.35,
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
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.vy += 0.18;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      const alpha = Math.max(0, p.life * (1 - t * 1.05));
      if (alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => {
    resize();
    refreshBounds();
  };
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.remove();
  };
}

/** Gold and white confetti falling from the top (plan-only success landing). */
export function firePlanOnlySuccessConfetti(durationMs = 3400): () => void {
  if (prefersReducedMotion()) return () => {};
  const mounted = mountConfettiCanvas();
  if (!mounted) return () => {};
  const { canvas, ctx: c, resize } = mounted;

  let w = window.innerWidth;
  let h = window.innerHeight;

  const colors = ["#c9a876", "#d4b88a", "#e8d4b8", "#ffffff", "#f5f5f5"];
  const particles: Particle[] = [];
  const count = Math.min(110, Math.floor((w * h) / 6500));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: -16 - Math.random() * 64,
      vx: (Math.random() - 0.5) * 4.2,
      vy: 1.6 + Math.random() * 3.4,
      w: 2 + Math.random() * 2.5,
      h: 1.5 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.16,
      life: 0.8 + Math.random() * 0.3,
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
      p.vy += 0.12;
      p.vx *= 0.996;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      const alpha = Math.max(0, p.life * (1 - t * 1.08));
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

  const onResize = () => {
    resize();
    w = window.innerWidth;
    h = window.innerHeight;
  };
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.remove();
  };
}

/** Gold confetti falling from the top (Future You success landing). */
export function fireFutureYouSuccessConfetti(durationMs = 3800): () => void {
  if (prefersReducedMotion()) return () => {};
  const mounted = mountConfettiCanvas();
  if (!mounted) return () => {};
  const { canvas, ctx: c, resize } = mounted;

  let w = window.innerWidth;
  let h = window.innerHeight;

  const particles: Particle[] = [];
  const count = Math.min(120, Math.floor((w * h) / 5500));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: -10 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 4,
      w: 4 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      color: FUTURE_YOU_CONFETTI_COLORS[Math.floor(Math.random() * FUTURE_YOU_CONFETTI_COLORS.length)]!,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
      life: 0.85 + Math.random() * 0.35,
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
      p.vy += 0.14;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      const alpha = Math.max(0, p.life * (1 - t * 1.05));
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

  const onResize = () => {
    resize();
    w = window.innerWidth;
    h = window.innerHeight;
  };
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.remove();
  };
}

/** Lightweight canvas confetti burst (no dependencies). */
export function fireConfetti(durationMs = 3200): () => void {
  if (prefersReducedMotion()) return () => {};
  const mounted = mountConfettiCanvas();
  if (!mounted) return () => {};
  const { canvas, ctx: c, resize } = mounted;

  let w = window.innerWidth;
  let h = window.innerHeight;

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

  const onResize = () => {
    resize();
    w = window.innerWidth;
    h = window.innerHeight;
  };
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    canvas.remove();
  };
}
