"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { AdminUserDetail } from "../lib/types";
import { buildAreaChart, formatDate, goalChip, initialsFromEmail, statusChip } from "../lib/format";
import { useToast } from "./Toast";
import {
  deleteUserAction,
  impersonateUser,
  overrideSubscription,
  saveUserPayload,
} from "../app/(protected)/actions";

type LatestFutureYou = {
  motivationId: string;
  status: string;
  revisedPrompt: string | null;
  sourceUrl: string | null;
  resultUrl: string | null;
  jobId: string;
} | null;

const TABS = ["overview", "workouts", "nutrition", "progress", "future-you", "raw-json", "subscription"] as const;
type Tab = (typeof TABS)[number];

function humanize(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.map((v) => humanize(v)).join(" · ");
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function FieldCell({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="fcell">
      <div className="fk">{k}</div>
      <div className="fv">{v}</div>
    </div>
  );
}

export function UserDetail({
  detail,
  futureYou,
}: {
  detail: AdminUserDetail;
  futureYou: LatestFutureYou;
}) {
  const router = useRouter();
  const { flash } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [pending, startTransition] = useTransition();
  const [showOverride, setShowOverride] = useState(false);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(detail.payload, null, 2));

  const profile = (detail.payload.onboardingProfile as Record<string, any>) ?? {};
  const units = (detail.payload.unitPreferences as Record<string, any>) ?? {};
  const targets = (detail.payload.nutritionTargets as Record<string, any>) ?? {};
  const status = statusChip(detail.status);
  const goal = goalChip(detail.goal);

  const weightSeries = useMemo(() => {
    const log = detail.payload.weightLog;
    if (!Array.isArray(log)) return [];
    return log
      .map((e: { weightLbs?: number; weight?: number; value?: number }) =>
        Number(e?.weightLbs ?? e?.weight ?? e?.value),
      )
      .filter((n) => Number.isFinite(n))
      .slice(-12);
  }, [detail.payload.weightLog]);

  const progressPics = useMemo(() => {
    const pics = detail.payload.progressPics;
    if (!Array.isArray(pics)) return [];
    return pics.slice(-8) as { id: string; dateKey: string; photoDataUrl: string }[];
  }, [detail.payload.progressPics]);

  const weightChart = buildAreaChart(weightSeries, 560, 110, { padTop: 14, padBottom: 14 });

  function runAction(fn: () => Promise<{ ok: boolean; message: string; data?: Record<string, unknown> }>, after?: (data?: Record<string, unknown>) => void) {
    startTransition(async () => {
      const res = await fn();
      flash(res.message);
      if (res.ok) {
        after?.(res.data);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button className="backlink" onClick={() => router.push("/users")}>
        <i className="ph ph-arrow-left" />
        All users
      </button>

      <div className="card uhead">
        <div className="uhav">{initialsFromEmail(detail.email)}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{detail.email}</div>
          <div className="row" style={{ gap: 8, marginTop: 7 }}>
            <span className="uid">{detail.id}</span>
            <span className={status.cls}>{status.label}</span>
            <span className={goal.cls}>{goal.label}</span>
          </div>
        </div>
        <div className="uactions">
          <button
            className="btn"
            disabled={pending}
            onClick={() =>
              runAction(
                () => impersonateUser(detail.id),
                (data) => {
                  const url = (data?.url as string) ?? null;
                  if (url) window.open(url, "_blank", "noopener");
                },
              )
            }
          >
            <i className="ph ph-user-switch" />
            Impersonate
          </button>
          <button className="btn" disabled={pending} onClick={() => setShowOverride((s) => !s)}>
            <i className="ph ph-crown-simple" />
            Override sub
          </button>
          <button
            className="btn danger"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete ${detail.email}? This removes their account and all fitness data.`)) {
                runAction(() => deleteUserAction(detail.id), () => router.push("/users"));
              }
            }}
          >
            <i className="ph ph-trash" />
            Delete
          </button>
        </div>
      </div>

      {showOverride && (
        <div className="card pad" style={{ marginBottom: 16, maxWidth: 420 }}>
          <div className="sect" style={{ marginBottom: 10 }}>
            Override subscription tier
          </div>
          <div className="row" style={{ gap: 8 }}>
            {(["free", "monthly", "annual"] as const).map((tier) => (
              <button
                key={tier}
                className="btn"
                disabled={pending}
                onClick={() =>
                  runAction(
                    () => overrideSubscription(detail.id, tier),
                    () => setShowOverride(false),
                  )
                }
              >
                {humanize(tier)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="utabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "utab on" : "utab"} onClick={() => setTab(t)}>
            {humanize(t.replace("-", " "))}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="fgrid">
            <FieldCell k="Theme" v={humanize(detail.payload.theme)} />
            <FieldCell k="Gender" v={humanize(profile.gender)} />
            <FieldCell k="Date of birth" v={profile.dateOfBirth ?? "—"} />
            <FieldCell k="Units" v={`${humanize(units.weight ?? "—")} / ${humanize(units.height ?? "—")}`} />
            <FieldCell k="Height (in)" v={profile.heightIn ?? "—"} />
            <FieldCell k="Start weight (lb)" v={profile.weightLbs ?? "—"} />
            <FieldCell k="Goal weight (lb)" v={profile.goalWeightLbs ?? "—"} />
            <FieldCell k="Pace" v={humanize(profile.pace)} />
            <FieldCell k="Motivation" v={humanize(futureYou?.motivationId)} />
            <FieldCell k="Experience" v={humanize(detail.payload.experienceLevel)} />
            <FieldCell k="Equipment" v={humanize(detail.payload.equipmentSetup)} />
            <FieldCell k="Session length" v={humanize(profile.sessionDuration)} />
            <FieldCell k="Training days" v={humanize(profile.trainingWeekdays)} />
            <FieldCell k="Style" v={humanize(profile.trainingStyle)} />
            <FieldCell k="Heard via" v={humanize(profile.referralSource)} />
          </div>

          <div className="grid2b">
            <div className="card">
              <div className="cardhd">
                <div>
                  <h3>Weight log</h3>
                  <div className="hsub">{weightSeries.length} entries</div>
                </div>
                <span className="chip cblue">
                  <i className="ph ph-trend-down" />
                  {humanize(detail.goal)}
                </span>
              </div>
              <div className="pad" style={{ paddingTop: 0 }}>
                {weightSeries.length >= 2 ? (
                  <svg viewBox="0 0 560 110" width="100%" height="110" preserveAspectRatio="none">
                    <line x1="0" y1="55" x2="560" y2="55" stroke="#F1EFE9" />
                    <polyline
                      points={weightChart.linePts}
                      fill="none"
                      stroke="#3F6193"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    No weight entries yet.
                  </p>
                )}
              </div>
            </div>
            <div className="card">
              <div className="cardhd">
                <div>
                  <h3>Nutrition targets</h3>
                  <div className="hsub">From onboarding plan</div>
                </div>
              </div>
              <div className="pad" style={{ paddingTop: 4 }}>
                {[
                  ["Calories", targets.kcal ? `${targets.kcal} kcal` : "—"],
                  ["Protein", targets.protein ? `${targets.protein} g` : "—"],
                  ["Carbs", targets.carbs ? `${targets.carbs} g` : "—"],
                  ["Fat", targets.fat ? `${targets.fat} g` : "—"],
                ].map(([k, v]) => (
                  <div className="row spread" style={{ padding: "8px 0", borderBottom: "1px solid var(--hair)" }} key={k}>
                    <span className="lab" style={{ fontSize: 13 }}>
                      {k}
                    </span>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "workouts" && (
        <div className="card pad">
          <div className="sect" style={{ marginBottom: 10 }}>
            Workout history
          </div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            Sessions, templates and PRs are stored in the synced payload. Use the Raw JSON tab to inspect{" "}
            <code className="mono">workoutHistory</code>, <code className="mono">exercisePersonalBests</code> and{" "}
            <code className="mono">workoutTemplates</code> for this user.
          </p>
        </div>
      )}

      {tab === "nutrition" && (
        <div className="card pad">
          <div className="sect" style={{ marginBottom: 10 }}>
            Nutrition
          </div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            Daily logs live under <code className="mono">nutritionLog</code> and <code className="mono">nutritionItemsByDay</code>{" "}
            in the payload. Targets: {targets.kcal ?? "—"} kcal · {targets.protein ?? "—"}g protein.
          </p>
        </div>
      )}

      {tab === "progress" && (
        <div className="card pad">
          <div className="sect" style={{ marginBottom: 12 }}>
            Progress photos
            {detail.payload.progressPicsLock ? (
              <span className="lab"> · PIN locked on device</span>
            ) : null}
          </div>
          {progressPics.length > 0 ? (
            <div className="gallery">
              {progressPics.map((pic) => (
                <div className="gcell" key={pic.id} style={{ overflow: "hidden" }}>
                  <img className="gimg" src={pic.photoDataUrl} alt={pic.dateKey} />
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>
              No progress photos in this user&apos;s synced payload.
            </p>
          )}
        </div>
      )}

      {tab === "future-you" && (
        <div className="card pad">
          <div className="row spread" style={{ marginBottom: 14 }}>
            <div className="sect">Future You · before / after</div>
            <span className={statusChip(futureYou?.status ?? "none").cls}>
              {futureYou ? statusChip(futureYou.status).label : "No job"}
            </span>
          </div>
          <div className="fy-compare">
            <div className="fy-half ph-img">
              <span className="fy-tag">Original selfie</span>
              {futureYou?.sourceUrl ? (
                <img className="gimg" src={futureYou.sourceUrl} alt="selfie" />
              ) : (
                <span>signed URL · selfie</span>
              )}
            </div>
            <div className="fy-half ph-img">
              <span className="fy-tag">Generated</span>
              {futureYou?.resultUrl ? (
                <img className="gimg" src={futureYou.resultUrl} alt="result" />
              ) : (
                <span>signed URL · result</span>
              )}
            </div>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <div className="chip cgray mono">motivation: {humanize(futureYou?.motivationId)}</div>
            <div className="chip cgray mono">job: {futureYou?.jobId ?? "—"}</div>
            {futureYou?.revisedPrompt ? <div className="chip cgray mono">prompt: {futureYou.revisedPrompt}</div> : null}
          </div>
        </div>
      )}

      {tab === "raw-json" && (
        <>
          <div className="jsonbar">
            <i className="ph ph-warning" />
            Saving bumps <b>&nbsp;updated_at_ms&nbsp;</b> so the server wins over the device on next sync. This is logged to the audit trail.
          </div>
          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
            <button className="btn dark" disabled={pending} onClick={() => runAction(() => saveUserPayload(detail.id, jsonText))}>
              <i className="ph ph-floppy-disk" />
              Save payload
            </button>
            <button className="btn" disabled={pending} onClick={() => setJsonText(JSON.stringify(detail.payload, null, 2))}>
              <i className="ph ph-arrow-counter-clockwise" />
              Revert
            </button>
            <span className="lab" style={{ fontSize: 12, alignSelf: "center" }}>
              fitness_user_data · updated_at_ms {detail.updatedAtMs || "—"}
            </span>
          </div>
          <textarea className="json" spellCheck={false} value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={22} />
        </>
      )}

      {tab === "subscription" && (
        <div className="card pad" style={{ maxWidth: 520 }}>
          <div className="row spread" style={{ marginBottom: 14 }}>
            <div className="sect">Subscription</div>
            <button className="btn sm gold" onClick={() => setShowOverride(true)}>
              <i className="ph ph-crown-simple" />
              Override tier
            </button>
          </div>
          {[
            ["Tier", detail.plan === "—" ? "Free" : detail.plan],
            ["Status", status.label],
            ["Entitlement", detail.subscription?.entitlement ?? "—"],
            ["Store", humanize(detail.subscription?.store)],
            ["Product", detail.subscription?.productId ?? "—"],
            ["Expires", formatDate(detail.subscription?.expiresAt)],
          ].map(([k, v]) => (
            <div className="row spread" style={{ padding: "11px 0", borderBottom: "1px solid var(--hair)" }} key={k}>
              <span className="lab" style={{ fontSize: 13 }}>
                {k}
              </span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
