"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { FUEL_TYPES, type RefuelingCreateInput } from "@/lib/validators/refueling";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useCreateRefueling } from "@/hooks/useRefuelings";

export function RefuelingForm() {
  const router = useRouter();
  const create = useCreateRefueling();

  const { data: vehicles, isLoading: loadVeh } = useVehicles();
  const { data: drivers, isLoading: loadDrv } = useDrivers();

  // Форматируем текущую дату и время для input type="datetime-local"
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDate = now.toISOString().slice(0, 16);

  const [form, setForm] = useState<RefuelingCreateInput>({
    vehicleId: 0,
    driverId: 0,
    refuelingDate: defaultDate,
    fuelType: "АИ-95",
    fuelAmount: 0,
    pricePerLiter: 0,
    totalCost: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Обновление простых полей
  function update<K extends keyof RefuelingCreateInput>(key: K, value: RefuelingCreateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Специальный обработчик для объема и цены, который сразу считает сумму
  function handleCalc(field: "fuelAmount" | "pricePerLiter", value: number) {
    setForm((f) => {
      const newForm = { ...f, [field]: value };
      // Округляем до 2 знаков после запятой
      newForm.totalCost = Number((newForm.fuelAmount * newForm.pricePerLiter).toFixed(2));
      return newForm;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (form.vehicleId === 0) return setErrors({ vehicleId: "Выберите автомобиль" });
    if (form.driverId === 0) return setErrors({ driverId: "Выберите водителя" });

    try {
      await create.mutateAsync(form);
      router.push("/refuelings");
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
    }
  }

  if (loadVeh || loadDrv) return <p>Загрузка справочников...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      {serverError && <div style={errorBox}>{serverError}</div>}

      <Field label="Дата и время заправки" error={errors.refuelingDate}>
        <input
          type="datetime-local"
          value={form.refuelingDate}
          onChange={(e) => update("refuelingDate", e.target.value)}
          required
          style={input}
        />
      </Field>

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

      <Field label="Водитель" error={errors.driverId}>
        <select
          value={form.driverId}
          onChange={(e) => update("driverId", Number(e.target.value))}
          required
          style={input}
        >
          <option value={0} disabled>— Выберите водителя —</option>
          {drivers?.map((d) => (
            <option key={d.driverId} value={d.driverId}>
              {d.lastName} {d.firstName}
            </option>
          ))}
        </select>
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Тип топлива" error={errors.fuelType}>
            <select
              value={form.fuelType}
              onChange={(e) => update("fuelType", e.target.value as any)}
              style={input}
            >
              {FUEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Объем, л" error={errors.fuelAmount}>
            <input
              type="number"
              value={form.fuelAmount || ""}
              onChange={(e) => handleCalc("fuelAmount", Number(e.target.value))}
              required
              min={0.01}
              step="0.01"
              style={input}
            />
          </Field>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Цена за литр, руб." error={errors.pricePerLiter}>
            <input
              type="number"
              value={form.pricePerLiter || ""}
              onChange={(e) => handleCalc("pricePerLiter", Number(e.target.value))}
              required
              min={0.01}
              step="0.01"
              style={input}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Итого (считается автоматически)" error={errors.totalCost}>
            <input
              type="number"
              value={form.totalCost || ""}
              readOnly
              style={{ ...input, background: "#f3f4f6", cursor: "not-allowed" }}
            />
          </Field>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={create.isPending} style={btnPrimary}>
          {create.isPending ? "Сохранение..." : "Добавить заправку"}
        </button>
        <button type="button" onClick={() => router.push("/refuelings")} style={btnSecondary}>
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