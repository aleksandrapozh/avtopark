"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDrivers, useDeleteDriver, useUpdateDriver } from "@/hooks/useDrivers";
import { DRIVER_STATUS_LABELS } from "@/lib/validators/driver";

export default function DriversPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useDrivers();
  const del = useDeleteDriver();
  const update = useUpdateDriver();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const canEdit = role === "admin" || role === "dispatcher";
  const canDelete = role === "admin";

  // --- АНАЛИТИКА ---
  const totalDrivers = data?.length || 0;
  const activeDrivers = data?.filter(d => d.status === "active").length || 0;
  // Водители в отпуске или на больничном
  const inactiveDrivers = data?.filter(d => d.status === "vacation" || d.status === "sick").length || 0;

  // --- ФИЛЬТРАЦИЯ ---
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(d => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${d.lastName} ${d.firstName} ${d.middleName || ""}`.toLowerCase();
        return fullName.includes(q) || d.licenseNumber.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data, searchQuery, statusFilter]);

  // --- ДЕЙСТВИЯ ---
  function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить водителя ${name}?`)) return;
    del.mutate(id, { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления") });
  }

  function handleStatusChange(id: number, newStatus: string) {
    update.mutate(
      { id, data: { status: newStatus as any } },
      { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка смены статуса") }
    );
  }

  // Функция для генерации аватара
  function getAvatar(name: string) {
    const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    // Простой хеш для выбора цвета
    const charCode = name.charCodeAt(0) || 65;
    const colors = ["#354975", "#166534", "#d97706", "#b91c1c", "#6b7280"];
    const color = colors[charCode % colors.length];
    
    return (
      <div style={{ 
        width: 36, height: 36, borderRadius: "50%", background: color, color: "#fff", 
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 
      }}>
        {initials}
      </div>
    );
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  return (
    <div>
      {/* Шапка */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Водители</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Управление штатом водителей предприятия</p>
        </div>
        {canEdit && <Link href="/drivers/new" style={btnPrimary}>+ Добавить водителя</Link>}
      </div>

      {/* ВИДЖЕТЫ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ ...widgetCard, borderLeft: "4px solid #354975" }}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Всего водителей</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1e293b", marginTop: 8 }}>{totalDrivers}</div>
        </div>
        <div style={{ ...widgetCard, borderLeft: "4px solid #166534" }}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Активные (Готовы к рейсу)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#166534", marginTop: 8 }}>{activeDrivers}</div>
        </div>
        <div style={{ ...widgetCard, borderLeft: "4px solid #d97706" }}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Отпуск / Больничный</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#d97706", marginTop: 8 }}>{inactiveDrivers}</div>
        </div>
      </div>

      {/* ПАНЕЛЬ ПОИСКА И ФИЛЬТРОВ */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <input 
          type="text" 
          placeholder="Поиск по ФИО или номеру прав..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, outline: "none" }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, outline: "none", background: "#fff" }}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="vacation">В отпуске</option>
          <option value="sick">На больничном</option>
          <option value="fired">Уволенные</option>
        </select>
      </div>

      {/* ТАБЛИЦА */}
      {filteredData.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Водитель</th>
              <th>Удостоверение</th>
              <th>Телефон</th>
              <th>Статус</th>
              {(canEdit || canDelete) && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d) => {
              const fullName = [d.lastName, d.firstName, d.middleName].filter(Boolean).join(" ");
              return (
                <tr key={d.driverId}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {getAvatar(fullName)}
                      <span style={{ fontWeight: 500, color: "#1e293b" }}>{fullName}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{d.licenseNumber}</td>
                  <td>{d.phone}</td>
                  <td>
                    {canEdit ? (
                      // Быстрая смена статуса
                      <select 
                        value={d.status} 
                        onChange={(e) => handleStatusChange(d.driverId, e.target.value)}
                        style={{ 
                          padding: "4px 8px", borderRadius: 6, border: "none", fontWeight: 600, fontSize: 12, outline: "none", cursor: "pointer",
                          background: d.status === "active" ? "#dcfce7" : d.status === "vacation" ? "#dbeafe" : d.status === "sick" ? "#fef3c7" : "#f1f5f9",
                          color: d.status === "active" ? "#166534" : d.status === "vacation" ? "#1e40af" : d.status === "sick" ? "#92400e" : "#475569"
                        }}
                      >
                        <option value="active">Активен</option>
                        <option value="vacation">В отпуске</option>
                        <option value="sick">На больничном</option>
                        <option value="fired">Уволен</option>
                      </select>
                    ) : (
                      <span style={statusBadge(d.status)}>{DRIVER_STATUS_LABELS[d.status] ?? d.status}</span>
                    )}
                  </td>
                  {(canEdit || canDelete) && (
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                        {canEdit && <Link href={`/drivers/${d.driverId}/edit`} style={btnBlue}>Изменить</Link>}
                        {canDelete && <button onClick={() => handleDelete(d.driverId, fullName)} style={btnRed}>Удалить</button>}
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
const actionBtnBase: React.CSSProperties = { padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none", display: "inline-block" };
const btnBlue: React.CSSProperties = { ...actionBtnBase, background: "#354975" };
const btnRed: React.CSSProperties = { ...actionBtnBase, background: "#d57272" };

function statusBadge(status: string): React.CSSProperties {
  const base: React.CSSProperties = { display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 };
  if (status === "active") return { ...base, background: "#dcfce7", color: "#166534" };
  if (status === "vacation") return { ...base, background: "#dbeafe", color: "#1e40af" };
  if (status === "sick") return { ...base, background: "#fef3c7", color: "#92400e" };
  return { ...base, background: "#f1f5f9", color: "#475569" };
}