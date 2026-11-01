"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { FINE_STATUSES, FINE_STATUS_LABELS, type FineCreateInput } from "@/lib/validators/fine";
import { useVehicles } from "@/hooks/useVehicles";
import type { FineDTO } from "@/hooks/useFines";

type Props = {
  initial?: FineDTO;
  onSubmit: (data: FineCreateInput) => Promise<unknown>;
  submitLabel: string;
};

export function FineForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const { data: vehicles, isLoading: loadVeh } = useVehicles();

  // Подготовка даты для input type="datetime-local"
  let defaultDate = "";
  if (initial?.violationDate) {
    const d = new Date(initial.violationDate);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    defaultDate = d.toISOString().slice(0, 16);
  } else {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    defaultDate = now.toISOString().slice(0, 16);
  }

  const [form, setForm] = useState<FineCreateInput>({
    vehicleId: initial?.vehicleId ?? 0,
    violationDate: defaultDate,
    amount: initial ? Number(initial.amount) : 0,
    articleNumber: initial?.articleNumber ?? "",
    status: (initial?.status as FineCreateInput["status"]) ?? "unpaid",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FineCreateInput>(key: K, value: FineCreateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setLoading(true);

    if (form.vehicleId === 0) {
      setErrors({ vehicleId: "Выберите автомобиль" });
      setLoading(false);
      return;
    }

    try {
      await onSubmit(form);
      router.push("/fines");
      router.refresh();
    } catch (err) {
      if (err instanceof HttpError && Array.isArray(err.issues)) {
        const map: Record<string, string> = {};
        for (const issue of err.issues as { path: (string | number)[]; message: string }[]) {
          const key = String(issue.path[0]);
          if (!map[key]) map[key] = issue.message;
        }
        setErrors(map);
      } else if (err instanceof HttpError) {
        setServerError(err.message);
      } else {
        setServerError("Не удалось сохранить");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loadVeh) return <p>Загрузка...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      {serverError && <div style={errorBox}>{serverError}</div>}

      <Field label="Автомобиль" error={errors.vehicleId}>
        <select
          value={form.vehicleId}
          onChange={(e) => update("vehicleId", Number(e.target.value))}
          required
          style={input}
        >
          <option value={0} disabled>— Выберите машину —</option>
          {vehicles?.map((v) => (
            <option key={v.vehicleId} value={v.vehicleId}>
              {v.licensePlate} ({v.brandModel})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Дата и время нарушения" error={errors.violationDate}>
        <input
          type="datetime-local"
          value={form.violationDate}
          onChange={(e) => update("violationDate", e.target.value)}
          required
          style={input}
        />
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Сумма, руб." error={errors.amount}>
            <input
              type="number"
              value={form.amount || ""}
              onChange={(e) => update("amount", Number(e.target.value))}
              required
              min={0.01}
              step="0.01"
              style={input}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Статья КоАП" error={errors.articleNumber}>
            <input
              type="text"
              value={form.articleNumber}
              onChange={(e) => update("articleNumber", e.target.value)}
              required
              placeholder="12.9 ч.2"
              style={input}
            />
          </Field>
        </div>
      </div>

      <Field label="Статус" error={errors.status}>
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value as FineCreateInput["status"])}
          style={input}
        >
          {FINE_STATUSES.map((s) => (
            <option key={s} value={s}>{FINE_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </Field>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Сохранение..." : submitLabel}
        </button>
        <button type="button" onClick={() => router.push("/fines")} style={btnSecondary}>
          Отмена
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#374151" }}>{label}</label>
      {children}
      {error && <div style={{ color: "crimson", fontSize: 12, marginTop: 2 }}>{error}</div>}
    </div>
  );
}

const input: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" };
const errorBox: React.CSSProperties = { padding: "10px 12px", background: "#fee2e2", color: "#991b1b", borderRadius: 4, marginBottom: 14, fontSize: 14 };
const btnPrimary: React.CSSProperties = { padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: "10px 20px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 };