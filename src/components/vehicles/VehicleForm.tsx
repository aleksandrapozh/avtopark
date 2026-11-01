"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import {
  VEHICLE_STATUSES,
  VEHICLE_STATUS_LABELS,
  type VehicleCreateInput,
} from "@/lib/validators/vehicle";
import type { VehicleDTO } from "@/hooks/useVehicles";

type Props = {
  initial?: VehicleDTO;
  onSubmit: (data: VehicleCreateInput) => Promise<unknown>;
  submitLabel: string;
};

export function VehicleForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<VehicleCreateInput>({
    licensePlate: initial?.licensePlate ?? "",
    brandModel: initial?.brandModel ?? "",
    vin: initial?.vin ?? "",
    year: initial?.year ?? new Date().getFullYear(),
    mileage: initial?.mileage ?? 0,
    status: (initial?.status as VehicleCreateInput["status"]) ?? "available",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof VehicleCreateInput>(
    key: K,
    value: VehicleCreateInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setLoading(true);

    try {
      await onSubmit(form);
      router.push("/vehicles");
      router.refresh();
    } catch (err) {
      // Ошибки Zod приходят как HttpError с массивом issues
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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      {serverError && (
        <div style={errorBox}>{serverError}</div>
      )}

      <Field label="Госномер" error={errors.licensePlate}>
        <input
          type="text"
          value={form.licensePlate}
          onChange={(e) => update("licensePlate", e.target.value.toUpperCase())}
          required
          placeholder="1234 АВ-7"
          style={{ ...input, textTransform: "uppercase" }}
        />
      </Field>

      <Field label="Марка и модель" error={errors.brandModel}>
        <input
          type="text"
          value={form.brandModel}
          onChange={(e) => update("brandModel", e.target.value)}
          required
          placeholder="ГАЗель Next"
          style={input}
        />
      </Field>

      <Field label="VIN (17 символов)" error={errors.vin}>
        <input
          type="text"
          value={form.vin}
          onChange={(e) => update("vin", e.target.value.toUpperCase())}
          required
          maxLength={17}
          placeholder="Y4KBS517XMA012345"
          style={{ ...input, fontFamily: "monospace" }}
        />
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Год выпуска" error={errors.year}>
            <input
              type="number"
              value={form.year}
              onChange={(e) => update("year", Number(e.target.value))}
              required
              min={1950}
              max={new Date().getFullYear() + 1}
              style={input}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Пробег, км" error={errors.mileage}>
            <input
              type="number"
              value={form.mileage}
              onChange={(e) => update("mileage", Number(e.target.value))}
              required
              min={0}
              style={input}
            />
          </Field>
        </div>
      </div>

      <Field label="Статус" error={errors.status}>
        <select
          value={form.status}
          onChange={(e) =>
            update("status", e.target.value as VehicleCreateInput["status"])
          }
          style={input}
        >
          {VEHICLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {VEHICLE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "wait" : "pointer",
            fontSize: 14,
          }}
        >
          {loading ? "Сохранение..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/vehicles")}
          style={{
            padding: "10px 20px",
            background: "#e5e7eb",
            color: "#111827",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

// Мелкие UI-хелперы для формы
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#374151" }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ color: "crimson", fontSize: 12, marginTop: 2 }}>{error}</div>
      )}
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 14,
  boxSizing: "border-box",
};

const errorBox: React.CSSProperties = {
  padding: "10px 12px",
  background: "#fee2e2",
  color: "#991b1b",
  borderRadius: 4,
  marginBottom: 14,
  fontSize: 14,
};