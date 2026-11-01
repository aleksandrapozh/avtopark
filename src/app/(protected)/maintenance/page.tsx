"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMaintenanceList, useDeleteMaintenance, useUpdateMaintenanceStatus } from "@/hooks/useMaintenance";
import { MAINTENANCE_STATUS_LABELS } from "@/lib/validators/maintenance";

export default function MaintenancePage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useMaintenanceList();
  const del = useDeleteMaintenance();
  const updateStatus = useUpdateMaintenanceStatus();

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const canEdit = role === "admin" || role === "mechanic";

  // Разделяем ремонты
  const activeRepairs = data?.filter(m => m.status === "in_progress") || [];
  const historyRepairs = data?.filter(m => m.status === "completed") || [];

  // Считаем общую стоимость ремонтов
  const totalCost = data?.reduce((sum, m) => sum + Number(m.totalCost), 0) || 0;

  function handleDelete(id: number) {
    if (!confirm("Удалить запись? Запчасти вернутся на склад.")) return;
    del.mutate(id, { onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления") });
  }

  function handleComplete(id: number) {
    if (!confirm("Завершить ремонт? Машина вернется в автопарк.")) return;
    updateStatus.mutate({ id, status: "completed" }, { onError: (e) => alert(e.message) });
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  const displayData = activeTab === "active" ? activeRepairs : historyRepairs;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Ремонты и ТО</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Управление техническим состоянием автопарка</p>
        </div>
        {canEdit && <Link href="/maintenance/new" style={btnPrimary}>+ Провести ремонт</Link>}
      </div>

      {/* ВИДЖЕТЫ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ ...widgetCard, borderLeft: "4px solid #d97706" }}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Сейчас в ремонте</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#d97706", marginTop: 8 }}>{activeRepairs.length}</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Автомобилей ожидают выезда</div>
        </div>

        <div style={widgetCard}>
          <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Общие затраты на ремонты</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1e293b", marginTop: 8 }}>{totalCost.toFixed(2)} BYN</div>
        </div>
      </div>

      {/* ВКЛАДКИ */}
      <div style={{ display: "flex", gap: 24, borderBottom: "2px solid #e2e8f0", marginBottom: 16 }}>
        <button 
          onClick={() => setActiveTab("active")} 
          style={tabStyle(activeTab === "active")}
        >
          В работе ({activeRepairs.length})
        </button>
        <button 
          onClick={() => setActiveTab("history")} 
          style={tabStyle(activeTab === "history")}
        >
          История ремонтов ({historyRepairs.length})
        </button>
      </div>

      {/* ТАБЛИЦА */}
      {displayData.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Автомобиль</th>
              <th>Вид работ</th>
              <th>Запчасть</th>
              <th>Стоимость</th>
              {canEdit && <th style={{ textAlign: "right" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {displayData.map((m) => (
              <tr key={m.maintenanceId}>
                <td>{m.maintenanceDate}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{m.vehicle?.licensePlate ?? m.vehicleId}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{m.vehicle?.brandModel}</div>
                </td>
                <td>{m.workType}</td>
                <td>
                  <div>{m.part?.partName ?? m.partId}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{m.partsQuantity} шт.</div>
                </td>
                <td style={{ fontWeight: 600 }}>{Number(m.totalCost).toFixed(2)}</td>
                {canEdit && (
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                      
                      {/* Если ремонт в работе - показываем зеленую кнопку "Завершить" */}
                      {activeTab === "active" && (
                        <button onClick={() => handleComplete(m.maintenanceId)} style={btnGreen}>Завершить</button>
                      )}
                      
                      <button onClick={() => handleDelete(m.maintenanceId)} style={btnRed}>Удалить</button>
                      
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          {activeTab === "active" ? "Все ремонты завершены. Отличная работа!" : "История ремонтов пуста."}
        </div>
      )}
    </div>
  );
}

// Стили
const btnPrimary: React.CSSProperties = { padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14, fontWeight: 500 };
const widgetCard: React.CSSProperties = { background: "#fff", padding: "20px", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };

const tabStyle = (isActive: boolean): React.CSSProperties => ({
  background: "none",
  border: "none",
  padding: "10px 0",
  fontSize: 15,
  fontWeight: isActive ? 600 : 500,
  color: isActive ? "#2563eb" : "#64748b",
  borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
  cursor: "pointer",
  marginBottom: -2,
  transition: "all 0.2s",
});

// Твои новые цвета для кнопок в таблице
const actionBtnBase: React.CSSProperties = {
  padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none", display: "inline-block"
};
const btnGreen: React.CSSProperties = { ...actionBtnBase, background: "#166534" };
const btnRed: React.CSSProperties = { ...actionBtnBase, background: "#d57272" };