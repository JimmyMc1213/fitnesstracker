import type { CoachTask, HomeCoachPlan } from "./coachEngine";
import { PrimaryButton } from "./shared";
import { coachTaskCtaLabel, coachTaskHasAction } from "./coachTaskActions";

type Props = {
  plan: HomeCoachPlan;
  onTaskAction: (task: CoachTask) => void;
};

export function TodaysCoachPlanCard({ plan, onTaskAction }: Props) {
  const primaryActionIndex = plan.tasks.findIndex((task) => coachTaskHasAction(task));

  return (
    <div
      className="card"
      style={{
        padding: 16,
        marginTop: 18,
        borderColor: "var(--sheet-panel-border)",
        background: "linear-gradient(180deg, rgba(74,222,128,0.04) 0%, transparent 52%)",
      }}
    >
      <div style={{ marginBottom: plan.subline ? 6 : 12 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(74,222,128,0.85)",
          }}
        >
          Today&apos;s plan
        </div>
        {plan.subline ? (
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-ghost)", fontWeight: 500 }}>
            {plan.subline}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {plan.tasks.map((task, index) => (
          <CoachTaskRow
            key={`${task.kind}-${index}`}
            task={task}
            isPrimaryAction={index === primaryActionIndex}
            onAction={() => onTaskAction(task)}
          />
        ))}
      </div>

      {plan.insightStrip ? (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "0.5px solid var(--divider-subtle)",
            fontSize: 11,
            lineHeight: 1.45,
            color: "var(--text-faint-soft)",
            fontWeight: 500,
          }}
        >
          {plan.insightStrip}
        </div>
      ) : null}
    </div>
  );
}

function CoachTaskRow({
  task,
  isPrimaryAction,
  onAction,
}: {
  task: CoachTask;
  isPrimaryAction: boolean;
  onAction: () => void;
}) {
  const ctaLabel = coachTaskCtaLabel(task);
  const showCta = ctaLabel !== null;
  const completed = task.completed;

  return (
    <div
      style={{
        opacity: completed ? 0.55 : 1,
        ...(isPrimaryAction && showCta && !completed
          ? {
              padding: 12,
              borderRadius: 12,
              border: "0.5px solid rgba(74,222,128,0.22)",
              background: "rgba(74,222,128,0.06)",
            }
          : undefined),
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--text-primary)",
          textDecoration: completed ? "line-through" : "none",
        }}
      >
        {task.label}
      </div>
      {task.rationale ? (
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, lineHeight: 1.4 }}>
          {task.rationale}
        </div>
      ) : null}

      {showCta && !completed ? (
        isPrimaryAction ? (
          <PrimaryButton
            block
            onClick={onAction}
            aria-label={`${ctaLabel}: ${task.label}`}
            style={{ marginTop: 12, padding: 14, fontSize: 14 }}
          >
            {ctaLabel}
          </PrimaryButton>
        ) : (
          <button
            type="button"
            className="tap"
            onClick={onAction}
            aria-label={`${ctaLabel}: ${task.label}`}
            style={{
              marginTop: 10,
              padding: 0,
              border: "none",
              background: "none",
              color: "var(--text-muted-soft)",
              fontSize: 12,
              fontWeight: 600,
              textAlign: "left",
            }}
          >
            {ctaLabel} →
          </button>
        )
      ) : null}
    </div>
  );
}
