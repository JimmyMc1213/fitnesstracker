import { useEffect, useMemo, useState } from "react";

import {
  closeAfterMotion,
  FullScreenOverlay,
  MOTION_DURATIONS,
  ScreenTransition,
  type NavDirection,
} from "./motion";
import {
  IconChart,
  IconCheck,
  IconChevL,
  IconChevR,
  IconDumbbell,
  IconMoon,
  IconPlus,
  IconScale,
  IconX,
} from "./icons";
import { LineChart, PrimaryButton } from "./shared";
import {
  SUNDAY_CHECK_IN_STEPS,
  type SundayCheckInCommitmentOption,
  type SundayCheckInData,
  type SundayCheckInMetric,
} from "./sundayCheckIn";
import { formatWeightFromLbs, weightUnitLabel } from "./unitPreferences";
import {
  COACH_CARD_BG,
  COACH_CARD_BORDER,
  coachMajorTitleStyle,
  workoutFieldInputStyle,
} from "./workoutUiTokens";
import type { UnitPreferences, WeekFocusCommitment } from "./types";

type Props = {
  open: boolean;
  data: SundayCheckInData | null;
  unitPreferences: UnitPreferences;
  onClose: () => void;
  onComplete: (commitments: WeekFocusCommitment[]) => void;
  onPresentChange?: (present: boolean) => void;
};

const GOLD = "var(--ob-gold)";
const GOLD_ON = "var(--ob-gold-on)";
const GOLD_SOFT = "rgba(201, 168, 118, 0.9)";
const GOLD_SHADOW = "rgba(201, 168, 118, 0.22)";
const GOLD_BORDER_20 = "rgba(201, 168, 118, 0.2)";
const GOLD_FILL_14 = "rgba(201, 168, 118, 0.14)";
const GOLD_BORDER_45 = "rgba(201, 168, 118, 0.45)";
const GOLD_FILL_08 = "rgba(201, 168, 118, 0.08)";
const SUCCESS_GREEN = "#22c55e";
const WARNING_AMBER = "#fbbf24";
const DANGER_RED = "#ef4444";

const METRIC_ICON_COLORS: Record<SundayCheckInMetric["icon"], string> = {
  workout: GOLD_SOFT,
  protein: "#fb923c",
  weight: "#4ade80",
  mobility: "#2dd4bf",
  sleep: "#a78bfa",
  weighIn: "#94a3b8",
};

export function SundayWeeklyCheckInFlow({
  open,
  data,
  unitPreferences,
  onClose,
  onComplete,
  onPresentChange,
}: Props) {
  const [closing, setClosing] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<NavDirection>("forward");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customCommitments, setCustomCommitments] = useState<SundayCheckInCommitmentOption[]>([]);
  const [lockedIn, setLockedIn] = useState(false);

  const commitmentOptions = useMemo(
    () => (data ? [...data.commitmentOptions, ...customCommitments] : []),
    [data, customCommitments],
  );

  const visible = open && data != null && !closing;

  useEffect(() => {
    if (!open) {
      setClosing(false);
      setStep(0);
      setDirection("forward");
      setSelectedIds(new Set());
      setCustomCommitments([]);
      setLockedIn(false);
    }
  }, [open]);

  useEffect(() => {
    onPresentChange?.(visible);
  }, [visible, onPresentChange]);

  const panelData = data;

  function finishClose() {
    setClosing(true);
    closeAfterMotion(() => {
      onClose();
      setClosing(false);
    }, MOTION_DURATIONS.dismiss);
  }

  function goForward() {
    if (!panelData) return;
    if (step >= SUNDAY_CHECK_IN_STEPS - 1) return;
    setDirection("forward");
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step <= 0) {
      finishClose();
      return;
    }
    setDirection("back");
    setStep((s) => s - 1);
  }

  function toggleCommitment(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= 3) return prev;
      next.add(id);
      return next;
    });
  }

  function addCustomCommitment(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const option: SundayCheckInCommitmentOption = {
      id: `custom-${Date.now()}`,
      title: trimmed,
      subtitle: "",
    };
    setCustomCommitments((prev) => [...prev, option]);
    setSelectedIds((prev) => {
      if (prev.size >= 3) return prev;
      const next = new Set(prev);
      next.add(option.id);
      return next;
    });
  }

  function handleLockIn() {
    if (!panelData || selectedIds.size === 0) return;
    setLockedIn(true);
  }

  function handleDone() {
    if (!panelData) return;
    const commitments: WeekFocusCommitment[] = commitmentOptions
      .filter((o) => selectedIds.has(o.id))
      .map((o) => ({ id: o.id, title: o.title, subtitle: o.subtitle }));
    onComplete(commitments);
  }

  function handleSkipCommitments() {
    onComplete([]);
  }

  if (!panelData && !closing) return null;

  return (
    <FullScreenOverlay open={visible && panelData != null} zIndex={300} motionVariant="dismiss">
      {panelData ? (
        <div
          className="screen sunday-check-in-flow"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <FlowHeader
            step={step}
            totalSteps={SUNDAY_CHECK_IN_STEPS}
            onBack={goBack}
            onClose={finishClose}
            showBack={step > 0}
          />

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              marginInline: -20,
            }}
          >
            <ScreenTransition activeKey={String(step)} variant="stack" direction={direction}>
              {(layerKey) => {
                const layerStep = Number(layerKey);
                return (
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      paddingBottom: 16,
                      paddingInline: 20,
                    }}
                  >
                    {layerStep === 0 ? <StepOverview data={panelData} unitPreferences={unitPreferences} /> : null}
                    {layerStep === 1 ? <StepBodyWeight data={panelData} unitPreferences={unitPreferences} /> : null}
                    {layerStep === 2 ? <StepCoachRead data={panelData} /> : null}
                    {layerStep === 3 ? (
                      <StepCommitments
                        data={panelData}
                        options={commitmentOptions}
                        selectedIds={selectedIds}
                        lockedIn={lockedIn}
                        displayName={panelData.displayName}
                        onToggle={toggleCommitment}
                        onAddCustom={addCustomCommitment}
                      />
                    ) : null}
                  </div>
                );
              }}
            </ScreenTransition>
          </div>

          <FlowFooter
            step={step}
            lockedIn={lockedIn}
            canContinue={step < 3 || selectedIds.size > 0}
            onContinue={step === 3 ? (lockedIn ? handleDone : handleLockIn) : goForward}
            onSkip={step === 3 && !lockedIn ? handleSkipCommitments : undefined}
            continueLabel={
              step === 3 ? (lockedIn ? "Done" : "Lock in & start week " + panelData.nextWeekNumber) : "Continue"
            }
          />
        </div>
      ) : null}
    </FullScreenOverlay>
  );
}

function FlowHeader({
  step,
  totalSteps,
  onBack,
  onClose,
  showBack,
}: {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onClose: () => void;
  showBack: boolean;
}) {
  return (
    <div style={{ paddingTop: 4, paddingBottom: 12, flexShrink: 0 }}>
      <div className="between" style={{ alignItems: "center", marginBottom: 14 }}>
        <button
          type="button"
          className="tap"
          onClick={showBack ? onBack : onClose}
          aria-label={showBack ? "Back" : "Close check-in"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "0.5px solid var(--border)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-secondary)",
            background: "var(--surface-1)",
          }}
        >
          {showBack ? <IconChevL size={16} stroke={2} /> : <IconX size={16} stroke={2} />}
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Sunday check-in</div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-ghost)",
            fontVariantNumeric: "tabular-nums",
            minWidth: 36,
            textAlign: "right",
          }}
        >
          {step + 1}/{totalSteps}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: i <= step ? GOLD : "var(--surface-2)",
              opacity: i <= step ? 1 : 0.65,
              transition: "background 0.25s ease, opacity 0.25s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FlowFooter({
  step,
  lockedIn,
  canContinue,
  onContinue,
  onSkip,
  continueLabel,
}: {
  step: number;
  lockedIn: boolean;
  canContinue: boolean;
  onContinue: () => void;
  onSkip?: () => void;
  continueLabel: string;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      <PrimaryButton
        block
        disabled={!canContinue}
        onClick={onContinue}
        style={{
          borderRadius: 999,
          padding: "15px 16px",
          fontSize: 15,
          background: canContinue ? GOLD : undefined,
          color: canContinue ? GOLD_ON : undefined,
          boxShadow: canContinue ? `0 8px 28px ${GOLD_SHADOW}` : undefined,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {step === 3 && !lockedIn ? <IconCheck size={16} stroke={2.5} /> : null}
          {continueLabel}
          {step < 3 ? <IconChevR size={16} stroke={2} /> : null}
        </span>
      </PrimaryButton>
      {onSkip ? (
        <button
          type="button"
          className="tap"
          onClick={onSkip}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Skip for now
        </button>
      ) : null}
    </div>
  );
}

function StepOverview({ data }: { data: SundayCheckInData; unitPreferences: UnitPreferences }) {
  return (
    <>
      <Eyebrow>{data.rangeLabelCaps}</Eyebrow>
      <FlowTitle>{data.headline}</FlowTitle>
      <FlowSubtitle>{data.summaryLine}</FlowSubtitle>
      {(data.multiWeekLines ?? []).length > 0 ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {(data.multiWeekLines ?? []).map((line) => (
            <p
              key={line}
              style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: "var(--text-soft)", fontWeight: 500 }}
            >
              {line}
            </p>
          ))}
        </div>
      ) : null}
      <StatusPill label={data.statusLabel} positive={data.onTrack} />

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {data.metrics.map((metric) => (
          <MetricTile key={metric.label} metric={metric} />
        ))}
      </div>

      {!data.hasFullRecap ? (
        <p style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.45, color: "var(--text-ghost)", fontWeight: 500 }}>
          Log your weight a few times next week for a full weight recap.
        </p>
      ) : null}
    </>
  );
}

function StepBodyWeight({ data, unitPreferences }: { data: SundayCheckInData; unitPreferences: UnitPreferences }) {
  const wUnit = unitPreferences.weightUnit;
  const chartValues = data.dailyWeights.map((d) => d.weightLbs).filter((v): v is number => v != null);
  const chartWidth = typeof window !== "undefined" ? Math.min(360, window.innerWidth - 72) : 320;

  const startLabel =
    data.weightStartLbs != null
      ? `${formatWeightFromLbs(data.weightStartLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "—";
  const endLabel =
    data.weightEndLbs != null
      ? `${formatWeightFromLbs(data.weightEndLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : "—";

  return (
    <>
      <Eyebrow>Body weight</Eyebrow>
      <FlowTitle>{data.weightHeadline}</FlowTitle>

      <div
        className="card"
        style={{
          marginTop: 18,
          padding: 16,
          background: "var(--surface-1)",
        }}
      >
        <div className="between" style={{ marginBottom: 12, gap: 10 }}>
          <WeightEndpoint label="Start of week" value={startLabel} />
          <IconChevR size={14} style={{ color: "var(--text-ghost)", flexShrink: 0 }} />
          <WeightEndpoint label="Today" value={endLabel} accent />
        </div>

        {chartValues.length >= 2 ? (
          <LineChart data={chartValues} width={chartWidth} height={140} stroke={GOLD} />
        ) : (
          <div
            style={{
              height: 120,
              display: "grid",
              placeItems: "center",
              color: "var(--text-ghost)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Log more weigh-ins to see the trend
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {data.weightDeltaLbs != null ? (
            <StatPill
              label={`${data.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(data.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`}
              tone="success"
            />
          ) : null}
          {data.weightWeeklyAvgDelta != null ? (
            <StatPill
              label={`${Math.abs(data.weightWeeklyAvgDelta).toFixed(1)} ${weightUnitLabel(wUnit)} / week avg`}
              tone="neutral"
            />
          ) : null}
          <StatPill label={`goal pace: ${data.goalPaceLabel}`} tone="neutral" />
        </div>
      </div>

      <SundayCoachNote insight={data.weightInsight} />
    </>
  );
}

function SundayCoachNote({ insight }: { insight: string }) {
  return (
    <div
      className="card"
      style={{
        marginTop: 14,
        padding: "14px 16px",
        borderColor: COACH_CARD_BORDER,
        background: COACH_CARD_BG,
      }}
    >
      <div style={coachMajorTitleStyle}>Coach</div>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1.5,
          color: "var(--text-soft)",
        }}
      >
        {insight}
      </p>
    </div>
  );
}

function StepCoachRead({ data }: { data: SundayCheckInData }) {
  return (
    <>
      <Eyebrow>Coach read</Eyebrow>
      <FlowTitle>Here's what stood out.</FlowTitle>

      <CoachSection title="Wins" tone="success" icon={<span aria-hidden>✅</span>}>
        {data.wins.map((item) => (
          <CoachBullet key={item.text} text={item.text} tone="success" />
        ))}
      </CoachSection>

      {data.watchItems.length > 0 ? (
        <CoachSection title="Worth watching" tone="danger" icon={<span aria-hidden>🚨</span>}>
          {data.watchItems.map((item) => (
            <CoachBullet key={item.text} text={item.text} tone="danger" />
          ))}
        </CoachSection>
      ) : null}

      <div
        className="card"
        style={{
          marginTop: 14,
          padding: 14,
          background: "var(--surface-1)",
        }}
      >
        <div className="between" style={{ marginBottom: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-ghost)",
            }}
          >
            Fuel update
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 999,
              border: "0.5px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            no change
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-soft)", fontWeight: 500 }}>
          {data.fuelUpdate.summary}
        </p>
      </div>
    </>
  );
}

function StepCommitments({
  data,
  options,
  selectedIds,
  lockedIn,
  displayName,
  onToggle,
  onAddCustom,
}: {
  data: SundayCheckInData;
  options: SundayCheckInCommitmentOption[];
  selectedIds: Set<string>;
  lockedIn: boolean;
  displayName: string;
  onToggle: (id: string) => void;
  onAddCustom: (title: string) => void;
}) {
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const atSelectionLimit = selectedIds.size >= 3;

  function submitCustom() {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setCustomDraft("");
    setCreatingCustom(false);
  }

  return (
    <>
      <Eyebrow>Week {data.nextWeekNumber} focus</Eyebrow>
      <FlowTitle>Pick 1–3 commitments.</FlowTitle>
      <FlowSubtitle>These pin to your Home as habits for week {data.nextWeekNumber}.</FlowSubtitle>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((option) => (
          <CommitmentOptionRow
            key={option.id}
            option={option}
            selected={selectedIds.has(option.id)}
            lockedIn={lockedIn}
            onToggle={() => onToggle(option.id)}
          />
        ))}

        {!lockedIn ? (
          creatingCustom ? (
            <div
              className="card"
              style={{
                padding: 14,
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
              }}
            >
              <label htmlFor="custom-commitment-input" style={{ display: "block", marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-ghost)",
                  }}
                >
                  Custom commitment
                </span>
              </label>
              <input
                id="custom-commitment-input"
                type="text"
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitCustom();
                }}
                placeholder="e.g. No phone after 9pm"
                maxLength={80}
                autoFocus
                style={workoutFieldInputStyle}
              />
              {atSelectionLimit ? (
                <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.4, color: "var(--text-ghost)", fontWeight: 500 }}>
                  Deselect one commitment to add this to your week.
                </p>
              ) : null}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="tap"
                  disabled={!customDraft.trim()}
                  onClick={submitCustom}
                  style={{
                    flex: 1,
                    padding: "11px 12px",
                    borderRadius: 999,
                    border: "none",
                    background: customDraft.trim() ? GOLD : "var(--surface-3)",
                    color: customDraft.trim() ? GOLD_ON : "var(--text-ghost)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Add commitment
                </button>
                <button
                  type="button"
                  className="tap"
                  onClick={() => {
                    setCreatingCustom(false);
                    setCustomDraft("");
                  }}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 999,
                    border: "0.5px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="tap"
              onClick={() => setCreatingCustom(true)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 14px",
                borderRadius: 14,
                border: "0.5px dashed var(--border-strong)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <IconPlus size={14} stroke={2.5} />
              Create custom commitment
            </button>
          )
        ) : null}
      </div>

      {lockedIn ? (
        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 16,
            background: "var(--surface-1)",
            borderColor: GOLD_BORDER_20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: GOLD_FILL_14,
                display: "grid",
                placeItems: "center",
                color: GOLD,
              }}
            >
              <IconCheck size={18} stroke={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                Week {data.nextWeekNumber} is live.
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
                {selectedIds.size} commitment{selectedIds.size === 1 ? "" : "s"} pinned
                {displayName.trim() ? `. See you tomorrow, ${displayName.trim()}.` : "."}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CommitmentOptionRow({
  option,
  selected,
  lockedIn,
  onToggle,
}: {
  option: SundayCheckInCommitmentOption;
  selected: boolean;
  lockedIn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="tap"
      disabled={lockedIn}
      onClick={onToggle}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 14px",
        borderRadius: 14,
        border: selected ? `0.5px solid ${GOLD_BORDER_45}` : "0.5px solid var(--border)",
        background: selected ? GOLD_FILL_08 : "var(--surface-1)",
        color: "inherit",
        opacity: lockedIn && !selected ? 0.55 : 1,
        transition: "border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: selected ? "none" : "0.5px solid var(--border-strong)",
            background: selected ? GOLD : "transparent",
            display: "grid",
            placeItems: "center",
            color: selected ? GOLD_ON : "var(--text-ghost)",
            flexShrink: 0,
            marginTop: 1,
            transition: "background 0.2s ease, border-color 0.2s ease",
          }}
        >
          {selected ? <IconCheck size={12} stroke={2.5} /> : null}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {option.title}
          </div>
          {option.subtitle ? (
            <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45, color: "var(--text-secondary)", fontWeight: 500 }}>
              {option.subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-ghost)",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function FlowTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: 0,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.15,
        color: "var(--text-primary)",
      }}
    >
      {children}
    </h2>
  );
}

function FlowSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.45, color: "var(--text-secondary)", fontWeight: 500 }}>
      {children}
    </p>
  );
}

function StatusPill({ label, positive }: { label: string; positive: boolean }) {
  const color = positive ? SUCCESS_GREEN : DANGER_RED;
  const bg = positive ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)";
  const border = positive ? "0.5px solid rgba(34, 197, 94, 0.22)" : "0.5px solid rgba(239, 68, 68, 0.22)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        padding: "8px 12px",
        borderRadius: 999,
        background: bg,
        border,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: color,
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function statToneColor(tone: SundayCheckInMetric["tone"]): string {
  switch (tone) {
    case "success":
      return SUCCESS_GREEN;
    case "warning":
      return WARNING_AMBER;
    case "danger":
      return DANGER_RED;
    case "accent":
      return GOLD_SOFT;
    default:
      return "var(--text-ghost)";
  }
}

function MetricTile({ metric }: { metric: SundayCheckInMetric }) {
  const statusColor = statToneColor(metric.tone);
  const iconColor = METRIC_ICON_COLORS[metric.icon];

  return (
    <div
      style={{
        padding: "12px 12px 11px",
        borderRadius: 12,
        background: "var(--surface-1)",
        border: "0.5px solid var(--divider-subtle)",
        minWidth: 0,
      }}
    >
      <div className="between" style={{ gap: 8, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-ghost)",
          }}
        >
          {metric.label}
        </span>
        <MetricIcon icon={metric.icon} color={iconColor} />
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-primary)",
        }}
      >
        {metric.value}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: statusColor }}>{metric.status}</div>
    </div>
  );
}

function MetricIcon({ icon, color }: { icon: SundayCheckInMetric["icon"]; color: string }) {
  const props = { size: 14, stroke: 2, style: { color } as const };
  switch (icon) {
    case "workout":
      return <IconDumbbell {...props} />;
    case "weight":
      return <IconChart {...props} />;
    case "weighIn":
      return <IconScale {...props} />;
    case "sleep":
      return <IconMoon {...props} />;
    default:
      return <IconCheck {...props} />;
  }
}

function WeightEndpoint({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-ghost)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 16,
          fontWeight: 800,
          color: accent ? GOLD : "var(--text-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatPill({ label, tone }: { label: string; tone: "success" | "neutral" }) {
  const dot = tone === "success" ? SUCCESS_GREEN : "var(--text-ghost)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-secondary)",
        padding: "6px 10px",
        borderRadius: 999,
        background: "var(--bg-primary)",
        border: "0.5px solid var(--border)",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }} />
      {label}
    </span>
  );
}

function coachToneColor(tone: "success" | "warning" | "danger"): string {
  if (tone === "success") return SUCCESS_GREEN;
  if (tone === "danger") return DANGER_RED;
  return WARNING_AMBER;
}

function CoachSection({
  title,
  tone,
  icon,
  children,
}: {
  title: string;
  tone: "success" | "warning" | "danger";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const color = coachToneColor(tone);
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function CoachBullet({ text, tone }: { text: string; tone: "success" | "warning" | "danger" }) {
  const dot = coachToneColor(tone);
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: "var(--surface-1)",
        border: "0.5px solid var(--divider-subtle)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 999, background: dot, marginTop: 6, flexShrink: 0 }} />
      <span style={{ fontSize: 13, lineHeight: 1.45, color: "var(--text-soft)", fontWeight: 500 }}>{text}</span>
    </div>
  );
}