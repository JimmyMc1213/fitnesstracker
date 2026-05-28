import { useMemo, useState } from "react";

import { IconSearch } from "./icons";
import { BottomSheet, bottomSheetPanelTheme } from "./motion";
import { PrimaryButton, SecondaryButton } from "./shared";
import type { WorkoutRoutineTemplate } from "./types";
import {
  buildRoutineTemplatesFromStarter,
  findWorkoutStarterTemplate,
  isMultiDayStarter,
  workoutStarterTemplatesByCategory,
  type WorkoutStarterTemplate,
} from "./workoutStarterTemplates";

type WorkoutStarterTemplatesSheetProps = {
  open: boolean;
  onClose: () => void;
  onAddDays: (templates: WorkoutRoutineTemplate[]) => void;
  onUseProgram: (templates: WorkoutRoutineTemplate[]) => void;
};

function TemplateCard({
  template,
  onClick,
}: {
  template: WorkoutStarterTemplate;
  onClick: () => void;
}) {
  const dayCount = template.days.length;
  const exercisePreview = template.days[0]?.exercises.slice(0, 3).map((e) => e.name) ?? [];
  const moreExercises = (template.days[0]?.exercises.length ?? 0) - exercisePreview.length;

  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 14,
        borderRadius: 14,
        border: "0.5px solid var(--border)",
        background: "var(--surface-2)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>{template.name}</div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-ghost)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            flexShrink: 0,
            paddingTop: 2,
          }}
        >
          {dayCount === 1 ? "1 day" : `${dayCount} days`}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted-soft)", lineHeight: 1.45, marginTop: 6, fontWeight: 500 }}>
        {template.description}
      </div>
      {exercisePreview.length > 0 ? (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-ghost)", fontWeight: 500, lineHeight: 1.5 }}>
          {exercisePreview.join(" · ")}
          {moreExercises > 0 ? ` · +${moreExercises} more` : null}
        </div>
      ) : null}
    </button>
  );
}

function TemplateDetail({
  template,
  onBack,
  onAddDays,
  onUseProgram,
}: {
  template: WorkoutStarterTemplate;
  onBack: () => void;
  onAddDays: (templates: WorkoutRoutineTemplate[]) => void;
  onUseProgram: (templates: WorkoutRoutineTemplate[]) => void;
}) {
  const built = useMemo(() => buildRoutineTemplatesFromStarter(template), [template]);
  const multiDay = isMultiDayStarter(template);

  return (
    <>
      <button
        type="button"
        className="tap"
        onClick={onBack}
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#6EB7FF",
          padding: "0 0 12px",
          marginBottom: 4,
        }}
      >
        ← All templates
      </button>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 6 }}>
        {template.name}
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        {template.description}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {built.map((day) => (
          <div
            key={day.id}
            style={{
              borderRadius: 12,
              border: "0.5px solid var(--border)",
              background: "var(--surface-1)",
              padding: 14,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>{day.name}</div>
            {day.focus.trim() ? (
              <div style={{ fontSize: 12, color: "var(--text-muted-soft)", marginBottom: 10, fontWeight: 500 }}>{day.focus}</div>
            ) : null}
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {day.exercises.map((ex) => (
                <li key={ex.id} style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 500 }}>
                  {ex.name}
                  <span style={{ color: "var(--text-ghost)", marginLeft: 6 }}>{ex.target}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {multiDay ? (
        <>
          <PrimaryButton block onClick={() => onUseProgram(built)} style={{ marginBottom: 10 }}>
            Use as my program
          </PrimaryButton>
          <SecondaryButton block onClick={() => onAddDays(built)}>
            Add all days to my workouts
          </SecondaryButton>
        </>
      ) : (
        <PrimaryButton block onClick={() => onAddDays(built)}>
          Add to my workouts
        </PrimaryButton>
      )}
    </>
  );
}

export function WorkoutStarterTemplatesSheet({
  open,
  onClose,
  onAddDays,
  onUseProgram,
}: WorkoutStarterTemplatesSheetProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? findWorkoutStarterTemplate(selectedId) : null;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = workoutStarterTemplatesByCategory();
    if (!q) return base;
    return base
      .map((group) => ({
        ...group,
        templates: group.templates.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.days.some((d) => d.focus.toLowerCase().includes(q) || d.exercises.some((e) => e.name.toLowerCase().includes(q))),
        ),
      }))
      .filter((group) => group.templates.length > 0);
  }, [query]);

  function reset() {
    setQuery("");
    setSelectedId(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleAddDays(templates: WorkoutRoutineTemplate[]) {
    onAddDays(templates);
    handleClose();
  }

  function handleUseProgram(templates: WorkoutRoutineTemplate[]) {
    onUseProgram(templates);
    handleClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      zIndex={1100}
      ariaLabelledBy="workout-templates-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(86vh, 620px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 16px 0", flexShrink: 0 }}>
        <div id="workout-templates-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 6 }}>
          Workout templates
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
          Pre-built routines you can add to your workouts or use as a full program.
        </p>
        {!selected ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              border: "0.5px solid var(--border)",
              background: "var(--surface-1)",
              marginBottom: 12,
            }}
          >
            <IconSearch size={18} stroke={1.75} style={{ color: "var(--text-ghost)", flexShrink: 0 }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              aria-label="Search workout templates"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        ) : null}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        {selected ? (
          <TemplateDetail
            template={selected}
            onBack={() => setSelectedId(null)}
            onAddDays={handleAddDays}
            onUseProgram={handleUseProgram}
          />
        ) : groups.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted-soft)", fontWeight: 500, textAlign: "center", padding: "24px 0" }}>
            No templates match your search.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.category} style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                  marginBottom: 10,
                }}
              >
                {group.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.templates.map((template) => (
                  <TemplateCard key={template.id} template={template} onClick={() => setSelectedId(template.id)} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </BottomSheet>
  );
}
