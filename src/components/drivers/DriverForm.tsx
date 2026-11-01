"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import {
  DRIVER_STATUSES,
  DRIVER_STATUS_LABELS,
  type DriverCreateInput,
} from "@/lib/validators/driver";
import type { DriverDTO } from "@/hooks/useDrivers";

type Props = {
  initial?: DriverDTO;
  onSubmit: (data: DriverCreateInput) => Promise<unknown>;
  submitLabel: string;
};

export function DriverForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<DriverCreateInput>({
    lastName: initial?.lastName ?? "",
    firstName: initial?.firstName ?? "",
    middleName: initial?.middleName ?? "",
    licenseNumber: initial?.licenseNumber ?? "",
    phone: initial?.phone ?? "",
    status: (initial?.status as DriverCreateInput["status"]) ?? "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof DriverCreateInput>(
    key: K,
    value: DriverCreateInput[K],
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
      router.push("/drivers");
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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      {serverError && <div style={errorBox}>{serverError}</div>}

      <Field label="Фамилия" error={errors.lastName}>
        <input
          type="text"
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          required
          style={input}
        />
      </Field>

      <Field label="Имя" error={errors.firstName}>
        <input
          type="text"
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          required
          style={input}
        />
      </Field>

      <Field label="Отчество (необязательно)" error={errors.middleName}>
        <input
          type="text"
          value={form.middleName ?? ""}
          onChange={(e) => update("middleName", e.target.value)}
          style={input}
        />
      </Field>

      <Field label="Номер водительского удостоверения" error={errors.licenseNumber}>
        <input
          type="text"
          value={form.licenseNumber}
          onChange={(e) => update("licenseNumber", e.target.value)}
          required
          placeholder="1234 567890"
          style={{ ...input, fontFamily: "monospace" }}
        />
      </Field>

      <Field label="Телефон" error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
          placeholder="+375 (29) 123-45-67"
          style={input}
        />
      </Field>

      <Field label="Статус" error={errors.status}>
        <select
          value={form.status}
          onChange={(e) =>
            update("status", e.target.value as DriverCreateInput["status"])
          }
          style={input}
        >
          {DRIVER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {DRIVER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Сохранение..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/drivers")}
          style={btnSecondary}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

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

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 20px",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
};