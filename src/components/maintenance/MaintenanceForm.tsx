"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { type MaintenanceCreateInput } from "@/lib/validators/maintenance";
import { useVehicles } from "@/hooks/useVehicles";
import { useParts } from "@/hooks/useParts";
import { useCreateMaintenance } from "@/hooks/useMaintenance";

export function MaintenanceForm() {
  const router = useRouter();
  const { data: vehicles, isLoading: loadVeh } = useVehicles();
  const { data: parts, isLoading: loadPrts } = useParts();

  const [form, setForm] = useState<MaintenanceCreateInput>({
    vehicleId: 0,
    partId: 0,
    maintenanceDate: new Date().toISOString().split("T")[0],
    workType: "",
    partsQuantity: 1,
    totalCost: 0,
    mechanicNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Хук для отправки
  const { mutateAsync } = useCreateMaintenance();

  function update<K extends keyof MaintenanceCreateInput>(key: K, value: MaintenanceCreateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Умный расчет стоимости: при выборе запчасти и количества
  function handlePartOrQtyChange(partId: number, qty: number) {
    const selectedPart = parts?.find(p => p.partId === partId);
    let cost = form.totalCost;
    
    if (selectedPart) {
      cost = Number(selectedPart.price) * qty;
    }
    
    setForm(f => ({ ...f, partId, partsQuantity: qty, totalCost: cost }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setLoading(true);

    if (form.vehicleId === 0) {
      setErrors({ vehicleId: "Выберите машину" });
      setLoading(false);
      return;
    }
    if (form.partId === 0) {
      setErrors({ partId: "Выберите запчасть" });
      setLoading(false);
      return;
    }

    try {
      await mutateAsync(form);
      router.push("/maintenance");
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
        setServerError(err.message); // Сюда попадут ошибки нехватки запчастей (409)
      } else {
        setServerError("Не удалось сохранить");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loadVeh || loadPrts) return <p>Загрузка...</p>;

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

      <Field label="Дата ремонта" error={errors.maintenanceDate}>
        <input
          type="date"
          value={form.maintenanceDate}
          onChange={(e) => update("maintenanceDate", e.target.value)}
          required
          style={input}
        />
      </Field>

      <Field label="Вид работ" error={errors.workType}>
        <input
          type="text"
          value={form.workType}
          onChange={(e) => update("workType", e.target.value)}
          required
          placeholder="Замена масляного фильтра"
          style={input}
        />
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 2 }}>
          <Field label="Используемая запчасть" error={errors.partId}>
            <select
              value={form.partId}
              onChange={(e) => handlePartOrQtyChange(Number(e.target.value), form.partsQuantity)}
              required
              style={input}
            >
              <option value={0} disabled>— Выберите деталь —</option>
              {parts?.map((p) => (
                <option key={p.partId} value={p.partId} disabled={p.quantity === 0}>
                  {p.partName} (на складе: {p.quantity})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Кол-во" error={errors.partsQuantity}>
            <input
              type="number"
              value={form.partsQuantity}
              onChange={(e) => handlePartOrQtyChange(form.partId, Number(e.target.value))}
              required
              min={1}
              style={input}
            />
          </Field>
        </div>
      </div>

      <Field label="Итоговая стоимость работ и деталей (руб.)" error={errors.totalCost}>
        <input
          type="number"
          value={form.totalCost || ""}
          onChange={(e) => update("totalCost", Number(e.target.value))}
          required
          min={0}
          step="0.01"
          style={input}
        />
      </Field>

      <Field label="Примечания механика" error={errors.mechanicNotes}>
        <textarea
          value={form.mechanicNotes || ""}
          onChange={(e) => update("mechanicNotes", e.target.value)}
          placeholder="Дополнительная информация о ремонте..."
          style={{ ...input, minHeight: 60 }}
        />
      </Field>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Сохранение..." : "Провести ремонт"}
        </button>
        <button type="button" onClick={() => router.push("/maintenance")} style={btnSecondary}>
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