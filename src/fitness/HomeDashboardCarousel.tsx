import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import type { CoachContext, HomeCoachPlan } from "./coachEngine";
import { homePlanSubline } from "./homeGreeting";
import {
  estimateRoutineSessionSeconds,
  formatEstimatedSessionMinutes,
} from "./estimateSessionDuration";
import { IconFlame } from "./icons";
import { nextTrainingDayFrom } from "./trainingCalendar";
import { resolveCoachTaskNavigation } from "./coachTaskActions";
import { PrimaryButton, SecondaryButton } from "./shared";
import { STRETCH_BLOCKS } from "./stretchRoutine";
import { useAnimatedMacroProgress } from "./useAnimatedMacroProgress";
import type { AppState, MacroTotals, NavigateFn } from "./types";

type Props = {
  totals: MacroTotals;
  targets: MacroTotals;
  dateKey: string;
  isToday: boolean;
  label?: string;
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  onNavigate: NavigateFn;
};

const CAROUSEL_CARD_HEIGHT = 196;
const SLIDE_COUNT = 2;

function CarouselCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="card"
      style={{
        height: CAROUSEL_CARD_HEIGHT,
        borderRadius: 14,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        borderColor: "var(--border)",
        background: "var(--bg-secondary)",
      }}
    >
      {children}
    </div>
  );
}

function MiniRing({
  value,
  target,
  size = 72,
  stroke = 4,
  color = "var(--chart-stroke)",
  children,
}: {
  value: number;
  target: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const pct = target > 0 ? Math.min(1, Math.max(0, value / target)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--ring-track)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function CalorieHeroRing({ value, target }: { value: number; target: number }) {
  const { ringPct } = useAnimatedMacroProgress(value, target, true);
  const size = 72;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * ringPct;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--ring-track)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--chart-stroke)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "var(--text-secondary)",
        }}
      >
        <IconFlame size={20} stroke={1.8} />
      </div>
    </div>
  );
}

function TodayLabel() {
  return (
    <div
      style={{
        fontSize: 11,
        color: "var(--text-ghost)",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      TODAY
    </div>
  );
}

const REST_FOCUS_TAGS = [
  { icon: "💧", label: "Hydration" },
  { icon: "🥩", label: "Hit protein" },
  { icon: "😴", label: "8hrs sleep" },
] as const;

function RestDayFocusRow() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
      {REST_FOCUS_TAGS.map(({ icon, label }) => (
        <div
          key={label}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            minWidth: 0,
            padding: "6px 8px",
            borderRadius: 999,
            background: "var(--bg-primary)",
            border: "0.5px solid var(--border)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
          }}
        >
          <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>
            {icon}
          </span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function SplitSubline({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, textAlign: "center" }}>{text}</div>
  );
}

function MacroMiniBlock({
  value,
  target,
  label,
  color,
  size = 72,
  stroke = 4,
}: {
  value: number;
  target: number;
  label: string;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const valueSize = size >= 72 ? 11 : 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <MiniRing value={value} target={target} color={color} size={size} stroke={stroke}>
        <div style={{ fontSize: valueSize, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
          <span style={{ color }}>{Math.round(value)}</span>
          <span style={{ color: "var(--text-ghost)", fontWeight: 500 }}> / {target}g</span>
        </div>
      </MiniRing>
      <div style={{ fontSize: 10, color: "var(--text-ghost)", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function FuelSlide({
  totals,
  targets,
  label,
  kcalLeft,
  isToday,
  onNavigate,
}: {
  totals: MacroTotals;
  targets: MacroTotals;
  label: string;
  kcalLeft: number;
  isToday: boolean;
  onNavigate: NavigateFn;
}) {
  return (
    <CarouselCard>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <CalorieHeroRing value={totals.cal} target={targets.cal} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-whisper)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {kcalLeft.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginTop: 6 }}>
              kcal left
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 8,
            rowGap: 4,
            flexShrink: 0,
            marginLeft: 4,
          }}
        >
          <div style={{ gridColumn: "1 / -1", justifySelf: "center" }}>
            <MacroMiniBlock
              value={totals.p}
              target={targets.p}
              label="protein"
              color="var(--macro-protein)"
              size={72}
            />
          </div>
          <MacroMiniBlock
            value={totals.c}
            target={targets.c}
            label="carbs"
            color="var(--macro-carbs)"
            size={56}
            stroke={3}
          />
          <MacroMiniBlock
            value={totals.f}
            target={targets.f}
            label="fats"
            color="var(--macro-fat)"
            size={56}
            stroke={3}
          />
        </div>
      </div>

      {isToday ? (
        <button
          type="button"
          className="tap"
          onClick={() => onNavigate("nutrition")}
          style={{
            marginTop: 12,
            padding: 0,
            border: "none",
            background: "none",
            color: "var(--text-secondary)",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          + Log fuel →
        </button>
      ) : (
        <div style={{ marginTop: 12, height: 18 }} aria-hidden />
      )}
    </CarouselCard>
  );
}

function TrainingSlide({
  coachCtx,
  coachPlan,
  state,
  isToday,
  proteinLeft,
  onNavigate,
}: {
  coachCtx: CoachContext | null;
  coachPlan: HomeCoachPlan | null;
  state: AppState;
  isToday: boolean;
  proteinLeft: number;
  onNavigate: NavigateFn;
}) {
  const splitSubline = coachCtx ? homePlanSubline(state, coachCtx.now) : null;
  const template = coachCtx?.todayTemplate ?? null;
  const isTrainingDay = coachCtx?.isTrainingDay ?? false;
  const workoutDone = coachCtx?.workoutCompletedToday ?? false;

  const slideLayoutStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between" as const,
    gap: 12,
  };

  const titleStyle = {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "var(--text-primary)",
    lineHeight: 1.15,
  };

  const subtitleStyle = {
    fontSize: 13,
    color: "var(--text-secondary)",
    fontWeight: 500,
    marginTop: 6,
    lineHeight: 1.45,
  };

  if (isTrainingDay && template && !workoutDone) {
    const durationSec = estimateRoutineSessionSeconds(template);
    const durationLabel = formatEstimatedSessionMinutes(durationSec);
    const exerciseCount = template.exercises.length;
    const subtitleParts: string[] = [];
    if (durationLabel) subtitleParts.push(durationLabel);
    if (exerciseCount > 0) subtitleParts.push(`${exerciseCount} exercises`);

    return (
      <CarouselCard>
        <div style={slideLayoutStyle}>
          <div>
            {isToday ? <TodayLabel /> : null}
            <div style={titleStyle}>{template.name}</div>
            {subtitleParts.length > 0 ? (
              <div style={subtitleStyle}>{subtitleParts.join(" · ")}</div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isToday ? (
              <PrimaryButton block onClick={() => onNavigate("workout")} style={{ padding: 14, fontSize: 14 }}>
                Start workout
              </PrimaryButton>
            ) : null}
            <SplitSubline text={splitSubline} />
          </div>
        </div>
      </CarouselCard>
    );
  }

  if (isTrainingDay && template && workoutDone) {
    return (
      <CarouselCard>
        <div style={slideLayoutStyle}>
          <div>
            {isToday ? <TodayLabel /> : null}
            <div style={titleStyle}>Session complete</div>
            <div style={subtitleStyle}>{template.name} · logged today</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isToday ? (
              <SecondaryButton block onClick={() => onNavigate("workout")}>
                Review session →
              </SecondaryButton>
            ) : null}
            <SplitSubline text={splitSubline} />
          </div>
        </div>
      </CarouselCard>
    );
  }

  const nextSession = nextTrainingDayFrom(state.workoutTemplates, coachCtx?.now ?? new Date());
  const restTask = coachPlan?.tasks.find((t) => t.kind === "rest_day");
  const showStretchCta =
    isToday && STRETCH_BLOCKS.length > 0 && restTask != null && resolveCoachTaskNavigation(restTask) === "stretch";

  return (
    <CarouselCard>
      <div style={slideLayoutStyle}>
        <div>
          {isToday ? <TodayLabel /> : null}
          <div style={titleStyle}>Rest day</div>
          <div style={subtitleStyle}>
            {nextSession
              ? `Next session: ${nextSession.fullName} · ${nextSession.template.name}`
              : (restTask?.label ?? "Recovery keeps the habit chain alive.")}
          </div>
        </div>

        <RestDayFocusRow />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {showStretchCta ? (
            <SecondaryButton block onClick={() => onNavigate("stretch")}>
              Start stretch routine →
            </SecondaryButton>
          ) : isToday ? (
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, textAlign: "center", lineHeight: 1.45 }}>
              Focus on fuel today — {Math.round(proteinLeft)}g protein left
            </div>
          ) : null}
        </div>
      </div>
    </CarouselCard>
  );
}

export function HomeDashboardCarousel({
  totals,
  targets,
  dateKey: _dateKey,
  isToday,
  label = "Fuel · Today",
  coachCtx,
  coachPlan,
  state,
  onNavigate,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const kcalLeft = Math.max(0, targets.cal - totals.cal);
  const proteinLeft = Math.max(0, targets.p - totals.p);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const syncWidth = () => {
      const w = el.clientWidth;
      if (w > 0) setSlideWidth(w);
    };

    syncWidth();
    const ro = new ResizeObserver(syncWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth <= 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveSlide(Math.max(0, Math.min(SLIDE_COUNT - 1, idx)));
  }, []);

  function goToSlide(idx: number) {
    const el = scrollRef.current;
    if (!el || el.clientWidth <= 0) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
    setActiveSlide(idx);
  }

  const slideStyle = slideWidth > 0 ? { width: slideWidth } : undefined;

  return (
    <div style={{ marginTop: 18 }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="home-dashboard-carousel"
        style={{
          display: "flex",
          scrollSnapType: "x mandatory",
          marginLeft: -4,
          marginRight: -4,
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        <div className="home-dashboard-carousel__slide" style={slideStyle}>
          <FuelSlide
            totals={totals}
            targets={targets}
            label={label}
            kcalLeft={kcalLeft}
            isToday={isToday}
            onNavigate={onNavigate}
          />
        </div>
        <div className="home-dashboard-carousel__slide" style={slideStyle}>
          <TrainingSlide
            coachCtx={coachCtx}
            coachPlan={coachPlan}
            state={state}
            isToday={isToday}
            proteinLeft={proteinLeft}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Dashboard slides"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
        }}
      >
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={activeSlide === i}
            aria-label={`Slide ${i + 1} of ${SLIDE_COUNT}`}
            onClick={() => goToSlide(i)}
            className="tap"
            style={{
              width: activeSlide === i ? 18 : 6,
              height: 6,
              borderRadius: 999,
              border: "none",
              padding: 0,
              background: activeSlide === i ? "var(--accent)" : "var(--text-tertiary)",
              opacity: activeSlide === i ? 1 : 0.5,
              transition: "width 0.2s ease, opacity 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
