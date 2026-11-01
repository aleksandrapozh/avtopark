"use client";

import { useState } from "react";
import { useAdjustStock, type PartDTO } from "@/hooks/useParts";

type Props = {
  part: PartDTO;
  onClose: () => void;
};

export function StockAdjustmentModal({ part, onClose }: Props) {
  const [type, setType] = useState<"in" | "write_off">("in");
  const [amount, setAmount] = useState<number | "">("");
  const [supplierId, setSupplierId] = useState<number>(0);
  const [price, setPrice] = useState<number | "">("");
  const [reason, setReason] = useState("Истек срок годности");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const adjust = useAdjustStock();

  // Вычисляем сумму
  const totalSum = (amount !== "" && price !== "") ? Number(amount) * Number(price) : 0;

  function handleSupplierChange(id: number) {
    setSupplierId(id);
    const offer = part.offers?.find(o => o.supplierId === id);
    if (offer) setPrice(Number(offer.price)); // Подставляем цену поставщика
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (amount === "" || amount <= 0) return setError("Введите количество больше нуля");
    if (type === "in" && supplierId === 0) return setError("Выберите поставщика");
    if (type === "in" && price === "") return setError("Укажите цену");

    adjust.mutate(
      { 
        partId: part.partId, 
        type, 
        quantity: amount, 
        supplierId: type === "in" ? supplierId : undefined,
        price: type === "in" ? price : undefined,
        reason: type === "write_off" ? reason : undefined, 
        comment: comment || undefined 
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err instanceof Error ? err.message : "Ошибка"),
      }
    );
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ marginTop: 0, fontSize: 20 }}>Оформление документа</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
          <strong>{part.partName}</strong> <br/>
          На нашем складе: <strong>{part.quantity} {part.unit}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button type="button" onClick={() => setType("in")} style={type === "in" ? btnTabActive : btnTab}>Приход (Закупка)</button>
            <button type="button" onClick={() => setType("write_off")} style={type === "write_off" ? btnTabActive : btnTab}>Списание</button>
          </div>

          {type === "in" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Поставщик</label>
                <select value={supplierId} onChange={(e) => handleSupplierChange(Number(e.target.value))} required style={input}>
                  <option value={0} disabled>— Выберите поставщика —</option>
                  {part.offers?.map(o => (
                    // Блокируем выбор, если у поставщика 0 на складе
                    <option key={o.supplierId} value={o.supplierId} disabled={o.quantity === 0}>
                      {o.supplier?.supplierName} (в наличии: {o.quantity} шт., цена: {Number(o.price).toFixed(2)} BYN)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Забрать у поставщика</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1} required style={input} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Цена за ед. (BYN)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0.01} step="0.01" required style={input} />
                </div>
              </div>

              {totalSum > 0 && (
                <div style={{ background: "#eff6ff", padding: "12px", borderRadius: 6, marginBottom: 16, textAlign: "right", fontSize: 16 }}>
                  Итого к оплате: <strong style={{ color: "#1d4ed8" }}>{totalSum.toFixed(2)} BYN</strong>
                </div>
              )}
            </>
          )}

          {type === "write_off" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Списать с нашего склада</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1} required style={input} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Причина</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} style={input}>
                  <option>Истек срок годности</option>
                  <option>Порча / Брак</option>
                  <option>Устаревание</option>
                  <option>Естественная убыль</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Комментарий</label>
                <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} style={input} />
              </div>
            </>
          )}

          {error && <div style={{ color: "#d57272", fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={btnGray}>Отмена</button>
            <button type="submit" style={btnGreen} disabled={adjust.isPending}>
              {adjust.isPending ? "Сохранение..." : "Применить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modal: React.CSSProperties = { background: "#fff", padding: 24, borderRadius: 8, width: "100%", maxWidth: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#334155" };
const input: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" };
const btnTab: React.CSSProperties = { flex: 1, padding: "10px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", fontSize: 14, color: "#64748b", fontWeight: 500 };
const btnTabActive: React.CSSProperties = { ...btnTab, background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8", fontWeight: 600 };
const actionBtnBase: React.CSSProperties = { padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#fff" };
const btnGreen: React.CSSProperties = { ...actionBtnBase, background: "#166534" };
const btnGray: React.CSSProperties = { ...actionBtnBase, background: "#e2e8f0", color: "#334155" };