"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { type SupplierCreateInput } from "@/lib/validators/supplier";
import type { SupplierDTO } from "@/hooks/useSuppliers";

type Props = {
  initial?: SupplierDTO;
  onSubmit: (data: SupplierCreateInput) => Promise<unknown>;
  submitLabel: string;
};

export function SupplierForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<SupplierCreateInput>({
    supplierName: initial?.supplierName ?? "",
    inn: initial?.inn ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof SupplierCreateInput>(key: K, value: SupplierCreateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setLoading(true);

    try {
      await onSubmit(form);
      router.push("/suppliers");
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

      <Field label="Название организации" error={errors.supplierName}>
        <input
          type="text"
          value={form.supplierName}
          onChange={(e) => update("supplierName", e.target.value)}
          required
          placeholder="ООО АвтоДеталь"
          style={input}
        />
      </Field>

      <Field label="УНП (9 цифр)" error={errors.inn}>
        <input
          type="text"
          value={form.inn}
          onChange={(e) => update("inn", e.target.value)}
          required
          maxLength={9}
          placeholder="190123456"
          style={{ ...input, fontFamily: "monospace" }}
        />
      </Field>

      <Field label="Телефон" error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
          placeholder="+375 (29) 111-22-33"
          style={input}
        />
      </Field>

      <Field label="Email (необязательно)" error={errors.email}>
        <input
          type="email"
          value={form.email ?? ""}
          onChange={(e) => update("email", e.target.value)}
          placeholder="info@autodetal.by"
          style={input}
        />
      </Field>

      <Field label="Адрес" error={errors.address}>
        <input
          type="text"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          required
          placeholder="г. Минск, ул. Автомобилистов, 10"
          style={input}
        />
      </Field>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Сохранение..." : submitLabel}
        </button>
        <button type="button" onClick={() => router.push("/suppliers")} style={btnSecondary}>
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