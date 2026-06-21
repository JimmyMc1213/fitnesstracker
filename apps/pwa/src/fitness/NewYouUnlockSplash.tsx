import { useEffect, useMemo, useRef, useState } from "react";

const GOLD = "#c9a876";
const GOLD_HI = "#ecd8ac";
const GOLD_DEEP = "#9c8050";
const RAY_COUNT = 9;
const PARTICLE_COUNT = 14;
const DURATION = 2700;
const START_DELAY = 160;

type Props = {
  headline?: string;
  onFinish?: () => void;
};

function lerp(keys: number[], values: number[], t: number): number {
  if (t <= keys[0]) return values[0];
  if (t >= keys[keys.length - 1]) return values[values.length - 1];

  for (let i = 0; i < keys.length - 1; i += 1) {
    if (t >= keys[i] && t <= keys[i + 1]) {
      const span = keys[i + 1] - keys[i];
      if (span === 0) return values[i + 1];
      const local = (t - keys[i]) / span;
      return values[i] + (values[i + 1] - values[i]) * local;
    }
  }

  return values[values.length - 1];
}

function clampLerp(keys: number[], values: number[], t: number): number {
  const clamped = Math.max(keys[0], Math.min(keys[keys.length - 1], t));
  return lerp(keys, values, clamped);
}

export function NewYouUnlockSplash({ headline = "New You", onFinish }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const [size, setSize] = useState({ w: 390, h: 844 });

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        const d = 60 + Math.random() * 130;
        return {
          tx: Math.cos(a) * d,
          ty: Math.sin(a) * d - 18,
          r: 1.6 + Math.random() * 2.4,
          color: i % 3 ? GOLD : GOLD_HI,
        };
      }),
    [],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncSize = () => {
      setSize({ w: root.clientWidth, h: root.clientHeight });
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const { w: W, h: H } = size;
    const CX = W / 2;
    const CY = H * 0.4;

    const glow = root.querySelector<SVGCircleElement>("[data-unlock-glow]");
    const raysGroup = root.querySelector<SVGGElement>("[data-unlock-rays]");
    const burst1 = root.querySelector<SVGCircleElement>("[data-unlock-burst='1']");
    const burst2 = root.querySelector<SVGCircleElement>("[data-unlock-burst='2']");
    const shackle = root.querySelector<SVGGElement>("[data-unlock-shackle]");
    const body = root.querySelector<SVGGElement>("[data-unlock-body]");
    const copy = root.querySelector<HTMLElement>("[data-unlock-copy]");
    const particleEls = Array.from(root.querySelectorAll<SVGCircleElement>("[data-unlock-particle]"));

    let raf = 0;
    const start = performance.now() + START_DELAY;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.max(0, Math.min(1, elapsed / DURATION));

      if (glow) {
        glow.setAttribute("r", String(lerp([0, 0.05, 0.5, 0.66, 1], [W * 0.18, W * 0.18, W * 0.34, W * 0.42, W * 0.4], p)));
        glow.setAttribute("opacity", String(lerp([0, 0.05, 0.5, 0.66, 1], [0, 0, 0.55, 1, 0.78], p)));
      }

      if (raysGroup) {
        const s = lerp([0, 0.5, 0.62, 0.78, 1], [0.15, 0.15, 1, 1.2, 1.2], p);
        raysGroup.setAttribute(
          "transform",
          `translate(${CX} ${CY}) scale(${s}) translate(${-CX} ${-CY})`,
        );
        raysGroup.setAttribute(
          "opacity",
          String(lerp([0, 0.5, 0.62, 0.78, 0.9, 1], [0, 0, 0.85, 0.4, 0, 0], p)),
        );
      }

      if (burst1) {
        burst1.setAttribute("r", String(lerp([0, 0.55, 0.82, 1], [20, 20, 130, 130], p)));
        burst1.setAttribute("opacity", String(clampLerp([0.53, 0.6, 0.82], [0, 0.9, 0], p)));
      }

      if (burst2) {
        burst2.setAttribute("r", String(lerp([0, 0.58, 0.86, 1], [20, 20, 130, 130], p)));
        burst2.setAttribute("opacity", String(clampLerp([0.56, 0.63, 0.86], [0, 0.6, 0], p)));
      }

      if (shackle) {
        const lift = clampLerp([0, 0.42, 0.53, 0.6, 1], [0, 0, -26, -22, -22], p);
        const rot = clampLerp([0, 0.55, 0.66, 0.72, 1], [0, 0, 35, 32, 32], p);
        shackle.setAttribute("transform", `translate(0 ${lift}) rotate(${rot} 136 100)`);
      }

      if (body) {
        const s = lerp([0, 0.08, 0.12, 0.16, 0.55, 0.62, 0.68, 1], [0.55, 1, 0.965, 1, 1, 1.04, 1, 1], p);
        body.setAttribute("opacity", String(clampLerp([0, 0.08], [0, 1], p)));
        body.setAttribute("transform", `translate(100 154) scale(${s}) translate(-100 -154)`);
      }

      particleEls.forEach((el, i) => {
        const data = particles[i];
        if (!data) return;
        const t = clampLerp([0, 0.55, 0.85, 1], [0, 0, 1, 1], p);
        const op = clampLerp([0.5, 0.58, 0.82, 0.92], [0, 1, 0.6, 0], p);
        el.setAttribute("cx", String(CX + data.tx * t));
        el.setAttribute("cy", String(CY + data.ty * t));
        el.setAttribute("opacity", String(op));
      });

      if (copy) {
        copy.style.opacity = String(clampLerp([0.6, 0.78], [0, 1], p));
        copy.style.transform = `translateY(${clampLerp([0.6, 0.78], [18, 0], p)}px)`;
      }

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onFinishRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [particles, size]);

  const { w: W, h: H } = size;
  const CX = W / 2;
  const CY = H * 0.4;
  const SCALE = 0.78;
  const RAY_LEN = Math.min(W, H) * 0.34;
  const lockTransform = `translate(${CX - 100 * SCALE} ${CY - 120 * SCALE}) scale(${SCALE})`;

  const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
    const a = ((Math.PI * 2) / RAY_COUNT) * i - Math.PI / 2;
    return { x2: CX + Math.cos(a) * RAY_LEN, y2: CY + Math.sin(a) * RAY_LEN };
  });

  return (
    <div ref={rootRef} className="new-you-unlock-splash">
      <svg className="new-you-unlock-splash__svg" width={W} height={H} aria-hidden>
        <defs>
          <radialGradient id="unlockGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={GOLD} stopOpacity="1" />
            <stop offset="66%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="unlockBody" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={GOLD_HI} />
            <stop offset="0.45" stopColor={GOLD} />
            <stop offset="1" stopColor={GOLD_DEEP} />
          </linearGradient>
        </defs>

        <circle data-unlock-glow cx={CX} cy={CY} fill="url(#unlockGlow)" r={W * 0.18} opacity={0} />

        <g data-unlock-rays opacity={0}>
          {rays.map((r, i) => (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={r.x2}
              y2={r.y2}
              stroke={GOLD_HI}
              strokeWidth={2.5}
              strokeOpacity={0.55}
              strokeLinecap="round"
            />
          ))}
        </g>

        <circle
          data-unlock-burst="1"
          cx={CX}
          cy={CY}
          fill="none"
          stroke={GOLD}
          strokeWidth={1.5}
          r={20}
          opacity={0}
        />
        <circle
          data-unlock-burst="2"
          cx={CX}
          cy={CY}
          fill="none"
          stroke={GOLD_HI}
          strokeWidth={1}
          r={20}
          opacity={0}
        />

        {particles.map((pt, i) => (
          <circle
            key={i}
            data-unlock-particle
            cx={CX}
            cy={CY}
            r={pt.r}
            fill={pt.color}
            opacity={0}
          />
        ))}

        <g transform={lockTransform}>
          <g data-unlock-shackle>
            <path
              d="M64 102 V72 a36 36 0 0 1 72 0 V102"
              fill="none"
              stroke={GOLD}
              strokeWidth={15}
              strokeLinecap="round"
            />
          </g>
          <g data-unlock-body opacity={0}>
            <rect x={44} y={100} width={112} height={108} rx={24} fill="url(#unlockBody)" />
            <circle cx={100} cy={143} r={13} fill="#0a0a0b" />
            <path d="M95 152 h10 l-2.5 26 h-5 z" fill="#0a0a0b" />
          </g>
        </g>
      </svg>

      <div className="new-you-unlock-splash__copy" data-unlock-copy style={{ top: `${H * 0.6}px` }}>
        <div className="new-you-unlock-splash__kicker-row">
          <span className="new-you-unlock-splash__kicker-line" />
          <span className="new-you-unlock-splash__kicker">MEMBERSHIP UNLOCKED</span>
          <span className="new-you-unlock-splash__kicker-line" />
        </div>
        <p className="new-you-unlock-splash__welcome">Welcome to</p>
        <p className="new-you-unlock-splash__headline">{headline}</p>
      </div>
    </div>
  );
}
