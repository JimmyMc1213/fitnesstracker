"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PROVIDERS, type ProviderState } from "../lib/integrations/types";
import { useToast } from "./Toast";
import { saveIntegration, testIntegration, toggleIntegration } from "../app/(protected)/actions";

export function IntegrationsPanel({ states }: { states: ProviderState[] }) {
  const stateById = new Map(states.map((s) => [s.id, s]));

  return (
    <>
      <div className="jsonbar" style={{ background: "#eaeff6", borderColor: "#cfdcec", color: "#3f6193" }}>
        <i className="ph ph-shield-check" />
        Credentials live in the service-role-only <b>&nbsp;admin_integrations&nbsp;</b> table. Rotate keys here — never
        shipped to the browser, no redeploy to apply.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {PROVIDERS.map((def) => (
          <ProviderCard key={def.id} def={def} state={stateById.get(def.id)} />
        ))}
      </div>
    </>
  );
}

function ProviderCard({
  def,
  state,
}: {
  def: (typeof PROVIDERS)[number];
  state: ProviderState | undefined;
}) {
  const router = useRouter();
  const { flash } = useToast();
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(Boolean(state?.enabled));
  const [values, setValues] = useState<Record<string, string>>({});

  const configured = new Set(state?.configuredFields ?? []);
  const isStub = Boolean(def.stub);
  const allConfigured = !isStub && def.fields.every((f) => configured.has(f.key) || values[f.key]?.trim());

  function run(fn: () => Promise<{ ok: boolean; message: string }>, onOk?: () => void) {
    startTransition(async () => {
      const res = await fn();
      flash(res.message);
      if (res.ok) {
        onOk?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="card integ-card">
      <div className="integ-top">
        <div className="bigchip">
          <i className={def.icon} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row spread">
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>{def.name}</div>
            {!isStub && (
              <button
                className={enabled ? "toggle on" : "toggle"}
                disabled={pending}
                onClick={() => {
                  const next = !enabled;
                  setEnabled(next);
                  run(() => toggleIntegration(def.id, next));
                }}
              />
            )}
          </div>
          <div className="lab" style={{ fontSize: 11, marginTop: 2 }}>
            {def.depth}
          </div>
        </div>
      </div>

      <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        {def.desc}
      </div>

      {def.fields.map((f) => (
        <div className="field" style={{ marginBottom: 0 }} key={f.key}>
          <label>{f.label}</label>
          <input
            type={f.secret ? "password" : "text"}
            placeholder={configured.has(f.key) ? "•••••••••• (saved)" : "Not set"}
            value={values[f.key] ?? ""}
            disabled={isStub}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        </div>
      ))}

      <div className="divider" />

      <div className="row spread">
        <span className={isStub ? "chip cgray" : allConfigured && enabled ? "chip cgreen" : "chip cgray"}>
          {isStub ? "Stubbed" : allConfigured && enabled ? "Connected" : "Not connected"}
        </span>
        <div className="row" style={{ gap: 8 }}>
          {isStub ? (
            <button className="btn sm" disabled>
              Coming soon
            </button>
          ) : (
            <>
              <button className="btn sm" disabled={pending} onClick={() => run(() => testIntegration(def.id))}>
                <i className="ph ph-pulse" />
                Test
              </button>
              <button
                className="btn dark sm"
                disabled={pending}
                onClick={() => run(() => saveIntegration(def.id, values, enabled), () => setValues({}))}
              >
                <i className="ph ph-floppy-disk" />
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
