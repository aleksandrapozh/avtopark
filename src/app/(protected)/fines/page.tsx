"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useFines, useDeleteFine, useUpdateFine } from "@/hooks/useFines";
import { FINE_STATUS_LABELS } from "@/lib/validators/fine";

export default function FinesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useFines();
  const del = useDeleteFine();
  const update = useUpdateFine();

  const [topPeriod, setTopPeriod] = useState<"month" | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("all");

  const canEdit = role === "admin" || role === "accountant";
  const canDelete = role === "admin";

  const unpaidFines = data?.filter(f => f.status === "unpaid") || [];
  const unpaidSum = unpaidFines.reduce((sum, f) => sum + Number(f.amount), 0);

  const topViolators = useMemo(() => {
    if (!data) return [];
    let filteredFines = data.filter(f => f.driver !== null && f.driver !== undefined);

    if (topPeriod === "month") {
      const now = new Date();
      filteredFines = filteredFines.filter(f => {
        const d = new Date(f.violationDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    const grouped = filteredFines.reduce((acc, fine) => {
      const driver = fine.driver!;
      if (!acc[driver.driverId]) {
        acc[driver.driverId] = { name: `${driver.lastName} ${driver.firstName}`, count: 0, sum: 0 };
      }
      acc[driver.driverId].count += 1;
      acc[driver.driverId].sum += Number(fine.amount);
      return acc;
    }, {} as Record<number, { name: string; count: number; sum: number }>);

    return Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [data, topPeriod]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(f => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchPlate = f.vehicle?.licensePlate.toLowerCase().includes(q);
        const matchArticle = f.articleNumber.toLowerCase().includes(q);
        const matchDriver = f.driver ? `${f.driver.lastName} ${f.driver.firstName}`.toLowerCase().includes(q) : false;
        if (!matchPlate && !matchArticle && !matchDriver) return false;
      }
      return true;
    });
  }, [data, statusFilter, searchQuery]);

  function handlePay(id: number) {
    update.mutate(
      { id, data: { status: "paid" } },
      { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка оплаты") }
    );
  }

  function handleDelete(id: number) {
    if (!confirm("Удалить штраф?")) return;
    del.mutate(id, { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления") });
  }

  function isRecidivist(driverId?: number) {
    if (!driverId || !data) return false;
    return data.filter(f => f.driver?.driverId === driverId).length > 1;
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Штрафы ГИБДД (ГАИ)</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Учет нарушений и определение водителей</p>
        </div>
        {canEdit && <Link href="/fines/new" style={btnPrimary}>+ Добавить штраф</Link>}
      </div>

      {/* ВИДЖЕТЫ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
        <div style={{ ...widgetCard, borderLeft: "4px solid #b91c1c" }}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Неоплаченные штрафы</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#b91c1c", marginTop: 8 }}>{unpaidSum.toFixed(2)} BYN</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Всего неоплачено: {unpaidFines.length} шт.</div>
        </div>

        <div style={widgetCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Топ нарушителей</div>
            <select 
              value={topPeriod} 
              onChange={(e) => setTopPeriod(e.target.value as "month" | "all")}
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13, outline: "none" }}
            >
              <option value="all">За все время</option>
              <option value="month">За этот месяц</option>
            </select>
          </div>
          
          {topViolators.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 14 }}>Нарушителей за выбранный период не найдено.</div>
          ) : (
            <div style={{ display: "flex", gap: 24 }}>
              {topViolators.map((v, i) => (
                <div key={i} style={{ flex: 1, borderLeft: i > 0 ? "1px solid #e2e8f0" : "none", paddingLeft: i > 0 ? 16 : 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{v.name}</div>
                  <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 4 }}>{v.count} штраф(а) на {v.sum.toFixed(2)} BYN</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ПАНЕЛЬ ФИЛЬТРОВ */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <input 
          type="text" 
          placeholder="Поиск по машине, статье или водителю..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStatusFilter("all")} style={filterBtn(statusFilter === "all")}>Все</button>
          <button onClick={() => setStatusFilter("unpaid")} style={filterBtn(statusFilter === "unpaid")}>Неоплаченные</button>
          <button onClick={() => setStatusFilter("paid")} style={filterBtn(statusFilter === "paid")}>Оплаченные</button>
        </div>
      </div>

      {/* ТАБЛИЦА */}
      {filteredData.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Дата нарушения</th>
              <th>Автомобиль</th>
              <th>Водитель (по путевому листу)</th>
              <th>Статья</th>
              <th>Сумма</th>
              <th>Статус</th>
              {(canEdit || canDelete) && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((f) => {
              const date = new Date(f.violationDate).toLocaleString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
              });
              return (
                <tr key={f.fineId}>
                  <td>{date}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{f.vehicle?.licensePlate ?? f.vehicleId}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{f.vehicle?.brandModel}</div>
                  </td>
                  <td>
                    {f.driver ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>{f.driver.lastName} {f.driver.firstName}</span>
                        {isRecidivist(f.driver.driverId) && (
                          <span style={{ fontSize: 10, background: "#fee2e2", color: "#991b1b", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>РЕЦИДИВИСТ</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Не установлен</span>
                    )}
                  </td>
                  <td>{f.articleNumber}</td>
                  <td style={{ fontWeight: 600 }}>{Number(f.amount).toFixed(2)}</td>
                  <td>
                    <span style={statusBadge(f.status)}>{FINE_STATUS_LABELS[f.status] ?? f.status}</span>
                  </td>
                  {(canEdit || canDelete) && (
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                        
                        {/* Главное действие: Зеленое */}
                        {canEdit && f.status === "unpaid" && (
                          <button onClick={() => handlePay(f.fineId)} style={btnGreen}>Оплатить</button>
                        )}

                        {/* Второстепенное действие: Синее (голубое) */}
                        {canEdit && (
                          <Link href={`/fines/${f.fineId}/edit`} style={btnBlue}>Изменить</Link>
                        )}

                        {/* Опасное действие: Красное */}
                        {canDelete && (
                          <button onClick={() => handleDelete(f.fineId)} style={btnRed}>Удалить</button>
                        )}
                        
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
  );
}

// Стили
const btnPrimary: React.CSSProperties = { padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14, fontWeight: 500 };
const widgetCard: React.CSSProperties = { background: "#fff", padding: "20px", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };

// Базовый стиль для кнопок в таблице
const actionBtnBase: React.CSSProperties = {
  padding: "6px 12px", 
  border: "none", 
  borderRadius: 4, 
  cursor: "pointer", 
  fontSize: 13, 
  fontWeight: 500,
  color: "#fff",
  textDecoration: "none",
  display: "inline-block"
};

// Цветные вариации кнопок
const btnGreen: React.CSSProperties = { ...actionBtnBase, background: "#166534" };
const btnBlue: React.CSSProperties = { ...actionBtnBase, background: "#354975" };
const btnRed: React.CSSProperties = { ...actionBtnBase, background: "#d57272" };


const filterBtn = (isActive: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  background: isActive ? "#e2e8f0" : "transparent",
  color: isActive ? "#1e293b" : "#64748b",
  border: "1px solid",
  borderColor: isActive ? "#cbd5e1" : "transparent",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  transition: "all 0.2s"
});

function statusBadge(status: string): React.CSSProperties {
  const base: React.CSSProperties = { display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 };
  if (status === "unpaid") return { ...base, background: "#fee2e2", color: "#991b1b" };
  if (status === "paid") return { ...base, background: "#dcfce7", color: "#166534" };
  if (status === "appealed") return { ...base, background: "#fef3c7", color: "#92400e" };
  return base;
}