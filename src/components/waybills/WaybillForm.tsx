"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { type WaybillCreateInput } from "@/lib/validators/waybill";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useCreateWaybill } from "@/hooks/useWaybills";

export function WaybillForm() {
  const router = useRouter();
  const create = useCreateWaybill();

  // Загружаем списки машин и водителей для выпадающих меню
  const { data: vehicles, isLoading: loadVeh } = useVehicles();
  const { data: drivers, isLoading: loadDrv } = useDrivers();

  // Состояние формы. По умолчанию пустые.
  const [form, setForm] = useState<WaybillCreateInput>({
    vehicleId: 0,
    driverId: 0,
    waybillNumber: "",
    issueDate: new Date().toISOString().split("T")[0], // Сегодняшняя дата YYYY-MM-DD
    startMileage: 0,
    fuelIssued: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof WaybillCreateInput>(key: K, value: WaybillCreateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // При выборе машины автоматически подставляем её текущий пробег
  function handleVehicleChange(vehicleId: number) {
    const selected = vehicles?.find((v) => v.vehicleId === vehicleId);
    setForm((f) => ({
      ...f,
      vehicleId,
      startMileage: selected ? selected.mileage : 0, // Автоподстановка пробега!
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (form.vehicleId === 0) return setErrors({ vehicleId: "Выберите автомобиль" });
    if (form.driverId === 0) return setErrors({ driverId: "Выберите водителя" });

    try {
      await create.mutateAsync(form);
      router.push("/waybills");
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

      <Field label="Номер путевого листа" error={errors.waybillNumber}>
        <input
          type="text"
          value={form.waybillNumber}
          onChange={(e) => update("waybillNumber", e.target.value)}
          required
          placeholder="ПЛ-001"
          style={input}
        />
      </Field>

      <Field label="Дата выдачи" error={errors.issueDate}>
        <input
          type="date"
          value={form.issueDate}
          onChange={(e) => update("issueDate", e.target.value)}
          required
          style={input}
        />
      </Field>

      <Field label="Автомобиль" error={errors.vehicleId}>
        <select
          value={form.vehicleId}
          onChange={(e) => handleVehicleChange(Number(e.target.value))}
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
              {d.lastName} {d.firstName} ({d.licenseNumber})
            </option>
          ))}
        </select>
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Начальный пробег, км" error={errors.startMileage}>
            <input
              type="number"
              value={form.startMileage}
              onChange={(e) => update("startMileage", Number(e.target.value))}
              required
              min={0}
              style={input}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Выдано топлива, л" error={errors.fuelIssued}>
            <input
              type="number"
              value={form.fuelIssued}
              onChange={(e) => update("fuelIssued", Number(e.target.value))}
              required
              min={0}
              step="0.01"
              style={input}
            />
          </Field>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button type="submit" disabled={create.isPending} style={btnPrimary}>
          {create.isPending ? "Сохранение..." : "Выписать лист"}
        </button>
        <button type="button" onClick={() => router.push("/waybills")} style={btnSecondary}>
          Отмена
        </button>
      </div>
    </form>
  );
}

// --- Вспомогательные компоненты UI ---
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