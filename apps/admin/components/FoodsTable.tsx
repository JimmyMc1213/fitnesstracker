"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CommunityFood } from "../lib/types";
import { numberWithCommas } from "../lib/format";
import { useToast } from "./Toast";
import { deleteFoods, updateFood } from "../app/(protected)/actions";

type Filter = "all" | "verified" | "unverified";

export function FoodsTable({ foods }: { foods: CommunityFood[] }) {
  const router = useRouter();
  const { flash } = useToast();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<CommunityFood | null>(null);

  const view = useMemo(() => {
    if (filter === "verified") return foods.filter((f) => f.brand !== "unverified");
    if (filter === "unverified") return foods.filter((f) => f.brand === "unverified");
    return foods;
  }, [foods, filter]);

  const unverifiedCount = foods.filter((f) => f.brand === "unverified").length;

  function toggle(barcode: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(barcode)) next.delete(barcode);
      else next.add(barcode);
      return next;
    });
  }

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
    <>
      <div className="filterbar">
        <button className={filter === "all" ? "fbtn on" : "fbtn"} onClick={() => setFilter("all")}>
          All foods
        </button>
        <button className={filter === "verified" ? "fbtn on" : "fbtn"} onClick={() => setFilter("verified")}>
          Verified
        </button>
        <button className={filter === "unverified" ? "fbtn on" : "fbtn"} onClick={() => setFilter("unverified")}>
          Unverified · {unverifiedCount}
        </button>
        <button
          className="btn sm danger"
          style={{ marginLeft: "auto" }}
          disabled={pending || selected.size === 0}
          onClick={() => {
            if (confirm(`Delete ${selected.size} selected food(s)?`)) {
              run(() => deleteFoods([...selected]), () => setSelected(new Set()));
            }
          }}
        >
          <i className="ph ph-trash" />
          Bulk delete{selected.size ? ` (${selected.size})` : ""}
        </button>
      </div>

      <div className="card tblwrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 34 }}></th>
              <th>Food</th>
              <th>Calories</th>
              <th>Macros</th>
              <th>Serving</th>
              <th>Added by</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {view.map((f) => (
              <tr key={f.barcode}>
                <td onClick={() => toggle(f.barcode)} style={{ cursor: "pointer" }}>
                  <i
                    className={selected.has(f.barcode) ? "ph-fill ph-check-square" : "ph ph-square"}
                    style={{ color: selected.has(f.barcode) ? "var(--gold2)" : "#c9c6bc", fontSize: 17 }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 700, letterSpacing: "-0.01em" }}>{f.name}</div>
                  <div className="uid">
                    {f.barcode} · {f.brand ?? "—"}
                  </div>
                </td>
                <td className="mono">{numberWithCommas(f.cal)}</td>
                <td className="mono muted" style={{ fontSize: 12 }}>
                  {f.protein}p · {f.carbs}c · {f.fat}f
                </td>
                <td className="muted" style={{ fontSize: 12 }}>
                  {f.servingLabel}
                </td>
                <td className="uid">{f.submittedBy ?? "—"}</td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn sm" onClick={() => setEditing(f)}>
                      <i className="ph ph-pencil-simple" />
                    </button>
                    <button
                      className="btn sm danger"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`Delete "${f.name}"?`)) run(() => deleteFoods([f.barcode]));
                      }}
                    >
                      <i className="ph ph-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td colSpan={7} className="muted" style={{ textAlign: "center", padding: 24 }}>
                  No foods match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="tblfoot">
          <span>community_foods · {numberWithCommas(foods.length)} entries</span>
        </div>
      </div>

      {editing && (
        <EditModal
          food={editing}
          pending={pending}
          onClose={() => setEditing(null)}
          onSave={(fields) => run(() => updateFood(editing.barcode, fields), () => setEditing(null))}
        />
      )}
    </>
  );
}

function EditModal({
  food,
  pending,
  onClose,
  onSave,
}: {
  food: CommunityFood;
  pending: boolean;
  onClose: () => void;
  onSave: (fields: { name: string; brand: string; cal: number; protein: number; carbs: number; fat: number }) => void;
}) {
  const [name, setName] = useState(food.name);
  const [brand, setBrand] = useState(food.brand ?? "");
  const [cal, setCal] = useState(String(food.cal));
  const [protein, setProtein] = useState(String(food.protein));
  const [carbs, setCarbs] = useState(String(food.carbs));
  const [fat, setFat] = useState(String(food.fat));

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,14,10,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 24 }}
      onClick={onClose}
    >
      <div className="card pad" style={{ width: "100%", maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="sect" style={{ marginBottom: 14 }}>
          Edit food · <span className="mono lab">{food.barcode}</span>
        </div>
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ fontFamily: "inherit" }} />
        </div>
        <div className="field">
          <label>Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} style={{ fontFamily: "inherit" }} />
        </div>
        <div className="row" style={{ gap: 10 }}>
          {[
            ["Calories", cal, setCal],
            ["Protein", protein, setProtein],
            ["Carbs", carbs, setCarbs],
            ["Fat", fat, setFat],
          ].map(([label, val, setter]) => (
            <div className="field" style={{ flex: 1 }} key={label as string}>
              <label>{label as string}</label>
              <input
                type="number"
                value={val as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn dark"
            disabled={pending}
            onClick={() =>
              onSave({
                name,
                brand,
                cal: Number(cal) || 0,
                protein: Number(protein) || 0,
                carbs: Number(carbs) || 0,
                fat: Number(fat) || 0,
              })
            }
          >
            <i className="ph ph-floppy-disk" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
