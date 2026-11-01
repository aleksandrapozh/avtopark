"use client";

import { useState } from "react";
import { useCloseWaybill, type WaybillDTO } from "@/hooks/useWaybills";

type Props = {
  waybill: WaybillDTO;
  onClose: () => void;
};

export function CloseWaybillModal({ waybill, onClose }: Props) {
  const [endMileage, setEndMileage] = useState<number | "">(waybill.startMileage);
  const [error, setError] = useState<string | null>(null);
  const closeMutation = useCloseWaybill();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (endMileage === "" || endMileage < waybill.startMileage) {
      setError(`Пробег не может быть меньше начального (${waybill.startMileage})`);
      return;
    }

    closeMutation.mutate(
      { id: waybill.waybillId, data: { endMileage } },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Ошибка");
        },
      }
    );
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ marginTop: 0 }}>Закрытие рейса</h2>
        <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 16 }}>
          Путевой лист: <strong>{waybill.waybillNumber}</strong><br/>
          Автомобиль: {waybill.vehicle?.licensePlate ?? waybill.vehicleId}<br/>
          Начальный пробег: <strong>{waybill.startMileage}</strong> км
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Конечный пробег (км)
            </label>
            <input
              type="number"
              value={endMileage}
              onChange={(e) => setEndMileage(Number(e.target.value))}
              min={waybill.startMileage}
              required
              style={input}
              autoFocus
            />
            {error && <div style={{ color: "crimson", fontSize: 12, marginTop: 4 }}>{error}</div>}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnSecondary} disabled={closeMutation.isPending}>
              Отмена
            </button>
            <button type="submit" style={btnPrimary} disabled={closeMutation.isPending}>
              {closeMutation.isPending ? "Сохранение..." : "Закрыть рейс"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modal: React.CSSProperties = {
  background: "#fff", padding: 24, borderRadius: 8, width: "100%", maxWidth: 400,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
};
const input: React.CSSProperties = {
  width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14,
};
const btnSecondary: React.CSSProperties = {
  padding: "8px 16px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14,
};