"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { useRefuelings, useDeleteRefueling } from "@/hooks/useRefuelings";

export default function RefuelingsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useRefuelings();
  const del = useDeleteRefueling();

  const [searchQuery, setSearchQuery] = useState("");

  const canEdit = role === "admin" || role === "dispatcher" || role === "accountant";
  const canDelete = role === "admin" || role === "accountant";

  // --- АНАЛИТИКА ДЛЯ ВИДЖЕТОВ ---
  const currentMonthData = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    return data.filter(r => {
      const d = new Date(r.refuelingDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [data]);

  const monthlyCost = currentMonthData.reduce((sum, r) => sum + Number(r.totalCost), 0);
  const totalRefuelings = data?.length || 0;

  // --- ДАННЫЕ ДЛЯ ГРАФИКА (Расходы по дням за месяц) ---
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    currentMonthData.forEach(r => {
      const day = new Date(r.refuelingDate).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
      grouped[day] = (grouped[day] || 0) + Number(r.totalCost);
    });
    
    return Object.keys(grouped).map(day => ({
      day,
      cost: grouped[day]
    })).sort((a, b) => a.day.localeCompare(b.day)); // Сортируем по дням
  }, [currentMonthData]);

  // --- ФИЛЬТРАЦИЯ ТАБЛИЦЫ ---
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;
    
    const q = searchQuery.toLowerCase();
    return data.filter(r => {
      const matchPlate = r.vehicle?.licensePlate.toLowerCase().includes(q);
      const matchDriver = r.driver ? `${r.driver.lastName} ${r.driver.firstName}`.toLowerCase().includes(q) : false;
      return matchPlate || matchDriver;
    });
  }, [data, searchQuery]);

  function handleDelete(id: number) {
    if (!confirm("Удалить запись о заправке?")) return;
    del.mutate(id, { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления") });
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  return (
    <div>
      {/* Шапка */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Заправки (ГСМ)</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Учет расхода топлива и финансовых затрат</p>
        </div>
        {canEdit && <Link href="/refuelings/new" style={btnPrimary}>+ Добавить заправку</Link>}
      </div>

      {/* ВИДЖЕТЫ И ГРАФИК */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
        
        {/* Левая колонка: Виджеты */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...widgetCard, borderLeft: "4px solid #2563eb" }}>
            <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Расходы за этот месяц</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1e293b", marginTop: 8 }}>{monthlyCost.toFixed(2)} BYN</div>
          </div>
          
          <div style={widgetCard}>
            <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Всего заправок</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1e293b", marginTop: 8 }}>{totalRefuelings}</div>
          </div>
        </div>

        {/* Правая колонка: График */}
        <div style={widgetCard}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>График расходов по дням</div>
          <div style={{ width: "100%", height: 180 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f3f4f6" }} formatter={(value) => [`${Number(value).toFixed(2)} BYN`, "Расход"]} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                Нет данных за этот месяц
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ПАНЕЛЬ ПОИСКА */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <input 
          type="text" 
          placeholder="Поиск по госномеру или водителю..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, outline: "none" }}
        />
      </div>

      {/* ТАБЛИЦА */}
      {filteredData.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Дата / Время</th>
              <th>Автомобиль</th>
              <th>Водитель</th>
              <th>Топливо</th>
              <th>Объем, л</th>
              <th>Сумма, BYN</th>
              {canDelete && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((r) => {
              const date = new Date(r.refuelingDate).toLocaleString("ru-RU", {
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
              });
              return (
                <tr key={r.refuelingId}>
                  <td>{date}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.vehicle?.licensePlate ?? r.vehicleId}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{r.vehicle?.brandModel}</div>
                  </td>
                  <td>{r.driver?.lastName} {r.driver?.firstName}</td>
                  <td>{r.fuelType}</td>
                  <td>{Number(r.fuelAmount).toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>{Number(r.totalCost).toFixed(2)}</td>
                  {canDelete && (
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                        
                        {/* Используем твои новые цвета */}
                        {canEdit && (
                          <Link href={`/refuelings/${r.refuelingId}/edit`} style={btnBlue}>Изменить</Link>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(r.refuelingId)} style={btnRed}>Удалить</button>
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

// Твои новые цвета для кнопок в таблице
const actionBtnBase: React.CSSProperties = {
  padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none", display: "inline-block"
};
const btnBlue: React.CSSProperties = { ...actionBtnBase, background: "#354975" };
const btnRed: React.CSSProperties = { ...actionBtnBase, background: "#d57272" };