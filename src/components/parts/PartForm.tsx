"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { type PartCreateInput } from "@/lib/validators/part";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useCategories, type PartDTO } from "@/hooks/useParts";

type Props = {
  initial?: PartDTO;
  onSubmit: (data: PartCreateInput) => Promise<unknown>;
  submitLabel: string;
};

export function PartForm({ initial, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const { data: suppliers, isLoading: loadSup } = useSuppliers();
  const { data: categories, isLoading: loadCats } = useCategories();

  const [form, setForm] = useState<PartCreateInput>({
    supplierId: initial?.supplierId ?? 0,
    categoryId: initial?.categoryId ?? null,
    partNumber: initial?.partNumber ?? "",
    partName: initial?.partName ?? "",
    quantity: initial?.quantity ?? 0,
    price: initial ? Number(initial.price) : 0,
    unit: initial?.unit ?? "шт",
    packSize: initial?.packSize ?? 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof PartCreateInput>(key: K, value: PartCreateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setLoading(true);

    if (form.supplierId === 0) {
      setErrors({ supplierId: "Выберите поставщика" });
      setLoading(false);
      return;
    }

    try {
      await onSubmit(form);
      router.push("/parts");
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

  if (loadSup || loadCats) return <p>Загрузка справочников...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      {serverError && <div style={errorBox}>{serverError}</div>}

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Поставщик" error={errors.supplierId}>
            <select value={form.supplierId} onChange={(e) => update("supplierId", Number(e.target.value))} required style={input}>
              <option value={0} disabled>— Выберите —</option>
              {suppliers?.map((s) => <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Категория" error={errors.categoryId}>
            <select 
              value={form.categoryId || ""} 
              onChange={(e) => update("categoryId", e.target.value ? Number(e.target.value) : null)} 
              style={input}
            >
              <option value="">— Без категории —</option>
              {categories?.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Артикул" error={errors.partNumber}>
        <input type="text" value={form.partNumber} onChange={(e) => update("partNumber", e.target.value)} required placeholder="FIL-123" style={{ ...input, fontFamily: "monospace" }} />
      </Field>

      <Field label="Название запчасти" error={errors.partName}>
        <input type="text" value={form.partName} onChange={(e) => update("partName", e.target.value)} required placeholder="Масляный фильтр" style={input} />
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Ед. измерения" error={errors.unit}>
            <select value={form.unit} onChange={(e) => update("unit", e.target.value)} style={input}>
              <option value="шт">Штука (шт)</option>
              <option value="л">Литр (л)</option>
              <option value="кг">Килограмм (кг)</option>
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Размер комплекта" error={errors.packSize}>
            <input type="number" value={form.packSize} onChange={(e) => update("packSize", Number(e.target.value))} required min={1} style={input} />
          </Field>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Начальное количество" error={errors.quantity}>
            <input type="number" value={form.quantity} onChange={(e) => update("quantity", Number(e.target.value))} required min={0} style={input} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Цена, BYN" error={errors.price}>
            <input type="number" value={form.price || ""} onChange={(e) => update("price", Number(e.target.value))} required min={0.01} step="0.01" style={input} />
          </Field>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Сохранение..." : submitLabel}
        </button>
        <button type="button" onClick={() => router.push("/parts")} style={btnSecondary}>Отмена</button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#374151" }}>{label}</label>
      {children}
      {error && <div style={{ color: "#d57272", fontSize: 12, marginTop: 2 }}>{error}</div>}
    </div>
  );
}

const input: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box", outline: "none" };
const errorBox: React.CSSProperties = { padding: "10px 12px", background: "#fee2e2", color: "#991b1b", borderRadius: 4, marginBottom: 14, fontSize: 14 };
const btnPrimary: React.CSSProperties = { padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 };
const btnSecondary: React.CSSProperties = { padding: "10px 20px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 };