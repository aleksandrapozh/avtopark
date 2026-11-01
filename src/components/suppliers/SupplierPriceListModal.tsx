"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { SupplierDTO } from "@/hooks/useSuppliers";

type Props = { supplier: SupplierDTO; onClose: () => void; };

export function SupplierPriceListModal({ supplier, onClose }: Props) {
  // Загружаем текущий прайс этого поставщика
  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", supplier.supplierId],
    queryFn: () => http.get<any[]>(`/api/offers?supplierId=${supplier.supplierId}`),
  });

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Прайс-лист: {supplier.supplierName}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
          Список поставляемых запчастей и текущие цены.
        </p>

        {/* Таблица прайса */}
        {isLoading ? <p>Загрузка...</p> : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Запчасть</th>
                <th>Цена (BYN)</th>
                <th>Наличие (шт)</th>
              </tr>
            </thead>
            <tbody>
              {offers?.map((o: any) => (
                <tr key={o.offerId}>
                  <td>{o.part?.partName}</td>
                  <td style={{ fontWeight: 600 }}>{Number(o.price).toFixed(2)}</td>
                  <td style={{ color: o.quantity === 0 ? "#d57272" : "#166534", fontWeight: 600 }}>{o.quantity}</td>
                </tr>
              ))}
              {offers?.length === 0 && <tr><td colSpan={3} style={{textAlign: "center", padding: 20}}>Прайс-лист пуст.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Стили
const overlay: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px", zIndex: 1000 };
const modal: React.CSSProperties = { background: "#fff", padding: 24, borderRadius: 8, width: "100%", maxWidth: 650, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", margin: "auto" };