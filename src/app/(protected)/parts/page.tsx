"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useParts, useCategories, useMovements, useDeletePart } from "@/hooks/useParts";
import { StockAdjustmentModal } from "@/components/parts/StockAdjustmentModal";
import type { PartDTO } from "@/hooks/useParts";

export default function PartsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data: parts, isLoading: loadParts } = useParts();
  const { data: categories, isLoading: loadCats } = useCategories();
  const { data: movements, isLoading: loadMoves } = useMovements();
  const del = useDeletePart();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"stock" | "history">("stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [adjustmentPart, setAdjustmentPart] = useState<PartDTO | null>(null);

  const canEdit = role === "admin" || role === "mechanic";

  // Фильтрация по категории и поиску
  const filteredParts = useMemo(() => {
    if (!parts) return [];
    return parts.filter(p => {
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.partName.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q);
      }
      return true;
    });
  }, [parts, selectedCategory, searchQuery]);

  // Расчет ОБЩЕЙ СТОИМОСТИ нашего склада
  const totalValue = useMemo(() => {
    if (!parts) return 0;
    return parts.reduce((sum, p) => sum + (p.quantity * Number(p.price)), 0);
  }, [parts]);

  // РАЗДЕЛЯЕМ ДВИЖЕНИЯ НА ЗАКУПКИ И СПИСАНИЯ
  const incomingMovements = movements?.filter(m => m.type === "in") || [];
  const outgoingMovements = movements?.filter(m => m.type !== "in") || [];

  function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить запчасть "${name}"?`)) return;
    del.mutate(id, { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления") });
  }

  if (loadParts || loadCats) return <p>Загрузка склада...</p>;

  return (
    <div>
      {/* Шапка */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Склад запчастей</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>
            Общая стоимость запасов: <strong style={{color: "#1e293b"}}>{totalValue.toFixed(2)} BYN</strong>
          </p>
        </div>
      </div>

      {/* ВКЛАДКИ */}
      <div style={{ display: "flex", gap: 24, borderBottom: "2px solid #e2e8f0", marginBottom: 16 }}>
        <button onClick={() => setActiveTab("stock")} style={tabStyle(activeTab === "stock")}>
          Текущие остатки
        </button>
        <button onClick={() => setActiveTab("history")} style={tabStyle(activeTab === "history")}>
          Журнал операций
        </button>
      </div>

      {activeTab === "stock" ? (
        <div style={{ display: "flex", gap: 24 }}>
          
          {/* ЛЕВАЯ ПАНЕЛЬ (КАТЕГОРИИ) */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div 
                onClick={() => setSelectedCategory(null)}
                style={catItemStyle(selectedCategory === null)}
              >
                Все категории
              </div>
              {categories?.map(c => (
                <div 
                  key={c.categoryId} 
                  onClick={() => setSelectedCategory(c.categoryId)}
                  style={catItemStyle(selectedCategory === c.categoryId)}
                >
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* ПРАВАЯ ПАНЕЛЬ (ТАБЛИЦА ОСТАТКОВ) */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <input 
                type="text" 
                placeholder="Поиск по названию или артикулу..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, outline: "none" }}
              />
            </div>

            {filteredParts.length > 0 ? (
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Артикул</th>
                    <th>Название</th>
                    <th>Наш остаток</th>
                    <th>Себестоимость, BYN</th>
                    {canEdit && <th style={{ textAlign: "right" }}>Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((p) => {
                    const packs = Math.floor(p.quantity / p.packSize);
                    const remainder = p.quantity % p.packSize;
                    const isLowStock = p.quantity <= (p.packSize * 2);

                    return (
                      <tr key={p.partId}>
                        <td style={{ fontFamily: "monospace", fontSize: 13 }}>{p.partNumber}</td>
                        <td style={{ fontWeight: 500 }}>{p.partName}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: isLowStock ? "#d57272" : "#166534" }}>
                            {packs > 0 ? `${packs} компл. ` : ""}
                            {remainder > 0 ? `(${remainder} ${p.unit})` : ""}
                            {packs === 0 && remainder === 0 ? `0 ${p.unit}` : ""}
                          </span>
                        </td>
                        <td>
                          {Number(p.price) > 0 ? (
                            <span style={{ fontWeight: 600 }}>{Number(p.price).toFixed(2)} BYN</span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
                          )}
                        </td>
                        {canEdit && (
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                              <button onClick={() => setAdjustmentPart(p)} style={btnGreen}>Закупка / Списание</button>
                              <button onClick={() => handleDelete(p.partId, p.partName)} style={btnRed}>Удалить</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#64748b", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                По вашему запросу ничего не найдено.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ЖУРНАЛ ОПЕРАЦИЙ (ДВЕ КОЛОНКИ) */
        <div>
          {loadMoves ? <p>Загрузка журнала...</p> : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              
              {/* ЛЕВАЯ КОЛОНКА: ЗАКУПКИ */}
              <div>
                <h3 style={{ fontSize: 18, color: "#166534", marginBottom: 12 }}>История закупок</h3>
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Запчасть</th>
                      <th>Кол-во</th>
                      <th>Поставщик</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingMovements.length > 0 ? incomingMovements.map(m => (
                      <tr key={m.movementId}>
                        <td style={{ fontSize: 13 }}>{new Date(m.createdAt).toLocaleString("ru-RU")}</td>
                        <td>{m.part.partName}</td>
                        <td style={{ fontWeight: 600 }}>{m.quantity} {m.part.unit}</td>
                        <td style={{ color: "#64748b" }}>{m.supplier?.supplierName || "—"}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: 20 }}>Закупок еще не было.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ПРАВАЯ КОЛОНКА: СПИСАНИЯ */}
              <div>
                <h3 style={{ fontSize: 18, color: "#d57272", marginBottom: 12 }}>История списаний</h3>
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Запчасть</th>
                      <th>Кол-во</th>
                      <th>Причина</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outgoingMovements.length > 0 ? outgoingMovements.map(m => (
                      <tr key={m.movementId}>
                        <td style={{ fontSize: 13 }}>{new Date(m.createdAt).toLocaleString("ru-RU")}</td>
                        <td>{m.part.partName}</td>
                        <td style={{ fontWeight: 600 }}>{m.quantity} {m.part.unit}</td>
                        <td style={{ color: "#64748b" }}>
                          {m.type === "repair" ? "На ремонт" : (m.reason || m.comment || "—")}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: 20 }}>Списаний еще не было.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО */}
      {adjustmentPart && (
        <StockAdjustmentModal part={adjustmentPart} onClose={() => setAdjustmentPart(null)} />
      )}
    </div>
  );
}

// Стили
const tabStyle = (isActive: boolean): React.CSSProperties => ({ 
  background: "none", border: "none", padding: "10px 0", fontSize: 15, fontWeight: isActive ? 600 : 500, 
  color: isActive ? "#2563eb" : "#64748b", borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent", 
  cursor: "pointer", marginBottom: -2, transition: "all 0.2s" 
});

const catItemStyle = (isActive: boolean): React.CSSProperties => ({ 
  padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: isActive ? 600 : 400, 
  color: isActive ? "#1e293b" : "#475569", background: isActive ? "#f1f5f9" : "transparent", 
  borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent", transition: "all 0.1s" 
});

const actionBtnBase: React.CSSProperties = { padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none", display: "inline-block" };
const btnGreen: React.CSSProperties = { ...actionBtnBase, background: "#166534" };
const btnRed: React.CSSProperties = { ...actionBtnBase, background: "#d57272" };