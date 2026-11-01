"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSuppliers, useDeleteSupplier } from "@/hooks/useSuppliers";
import { SupplierPriceListModal } from "@/components/suppliers/SupplierPriceListModal";
import type { SupplierDTO } from "@/hooks/useSuppliers";

export default function SuppliersPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useSuppliers();
  const del = useDeleteSupplier();
  const [priceListSupplier, setPriceListSupplier] = useState<SupplierDTO | null>(null);

  const canEdit = role === "admin" || role === "mechanic";
  const canDelete = role === "admin";

  function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить поставщика "${name}"?`)) return;
    del.mutate(id, { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления") });
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Поставщики</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Управление контрагентами и их прайс-листами</p>
        </div>
        {canEdit && <Link href="/suppliers/new" style={btnPrimary}>+ Добавить поставщика</Link>}
      </div>

      {data && data.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>УНП</th>
              <th>Телефон</th>
              <th>Позиций в прайсе</th>
              {(canEdit || canDelete) && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.supplierId}>
                <td style={{ fontWeight: 500 }}>{s.supplierName}</td>
                <td style={{ fontFamily: "monospace" }}>{s.inn}</td>
                <td>{s.phone}</td>
                <td>
                  <span style={{ fontWeight: 600, color: "#354975" }}>
                    {(s as any).offers?.length || 0} видов
                  </span>
                </td>
                {(canEdit || canDelete) && (
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                      <button onClick={() => setPriceListSupplier(s)} style={btnGreen}>Прайс-лист</button>
                      {canEdit && <Link href={`/suppliers/${s.supplierId}/edit`} style={btnBlue}>Изменить</Link>}
                      {canDelete && <button onClick={() => handleDelete(s.supplierId, s.supplierName)} style={btnRed}>Удалить</button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#64748b" }}>Поставщиков пока нет.</p>
      )}

      {priceListSupplier && (
        <SupplierPriceListModal supplier={priceListSupplier} onClose={() => setPriceListSupplier(null)} />
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = { padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14, fontWeight: 500 };
const actionBtnBase: React.CSSProperties = { padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none", display: "inline-block" };
const btnGreen: React.CSSProperties = { ...actionBtnBase, background: "#166534" };
const btnBlue: React.CSSProperties = { ...actionBtnBase, background: "#354975" };
const btnRed: React.CSSProperties = { ...actionBtnBase, background: "#d57272" };