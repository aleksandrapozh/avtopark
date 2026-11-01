"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useVehicles, useDeleteVehicle } from "@/hooks/useVehicles";
import { VEHICLE_STATUS_LABELS } from "@/lib/validators/vehicle";

export default function VehiclesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useVehicles();
  const del = useDeleteVehicle();

  const canEdit = role === "admin" || role === "dispatcher";
  const canDelete = role === "admin";

  // Распределяем машины по колонкам
  const available = data?.filter(v => v.status === "available") || [];
  const onTrip = data?.filter(v => v.status === "on_trip") || [];
  const inRepair = data?.filter(v => v.status === "maintenance" || v.status === "repair") || [];

  function handleDelete(id: number, label: string) {
    if (!confirm(`Удалить транспортное средство ${label}?`)) return;
    del.mutate(id, {
      onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления"),
    });
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Транспортные средства</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Управление автопарком</p>
        </div>
        {canEdit && (
          <Link href="/vehicles/new" style={btnPrimary}>+ Добавить ТС</Link>
        )}
      </div>

      {/* КАНБАН ДОСКА */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "start" }}>
        
        {/* КОЛОНКА 1: ГОТОВЫ */}
        <div style={columnStyle}>
          <div style={columnHeader}>
            <span>Готовы к рейсу</span>
            <span style={countBadge("#166534", "#dcfce7")}>{available.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {available.map(v => (
              <VehicleCard key={v.vehicleId} vehicle={v} canEdit={canEdit} canDelete={canDelete} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* КОЛОНКА 2: В РЕЙСЕ */}
        <div style={columnStyle}>
          <div style={columnHeader}>
            <span>В рейсе</span>
            <span style={countBadge("#1e40af", "#dbeafe")}>{onTrip.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {onTrip.map(v => (
              <VehicleCard key={v.vehicleId} vehicle={v} canEdit={canEdit} canDelete={canDelete} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* КОЛОНКА 3: В РЕМОНТЕ */}
        <div style={columnStyle}>
          <div style={columnHeader}>
            <span>На ТО / В ремонте</span>
            <span style={countBadge("#92400e", "#fef3c7")}>{inRepair.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {inRepair.map(v => (
              <VehicleCard key={v.vehicleId} vehicle={v} canEdit={canEdit} canDelete={canDelete} onDelete={handleDelete} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Компонент карточки машины
function VehicleCard({ vehicle, canEdit, canDelete, onDelete }: any) {
  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 4 }}>
        {vehicle.licensePlate}
      </div>
      <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
        {vehicle.brandModel} ({vehicle.year})
      </div>
      <div style={{ fontSize: 12, color: "#64748b", display: "flex", justifyContent: "space-between" }}>
        <span>Пробег: {vehicle.mileage.toLocaleString("ru-RU")} км</span>
        <span>VIN: {vehicle.vin.slice(-4)}</span>
      </div>
      
      {(canEdit || canDelete) && (
        <div style={{ display: "flex", gap: 12, borderTop: "1px solid #e2e8f0", marginTop: 12, paddingTop: 12 }}>
          {canEdit && <Link href={`/vehicles/${vehicle.vehicleId}/edit`} style={linkStyle}>Изменить</Link>}
          {canDelete && <button onClick={() => onDelete(vehicle.vehicleId, vehicle.licensePlate)} style={{ ...linkStyle, color: "#b91c1c" }}>Удалить</button>}
        </div>
      )}
    </div>
  );
}

// Стили
const btnPrimary: React.CSSProperties = { padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14, fontWeight: 500 };
const linkStyle: React.CSSProperties = { background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "none", fontWeight: 500 };

const columnStyle: React.CSSProperties = { background: "#f1f5f9", padding: 16, borderRadius: 8, minHeight: "300px", border: "1px solid #e2e8f0" };
const columnHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, fontWeight: 600, fontSize: 15, color: "#334155" };
const cardStyle: React.CSSProperties = { background: "#ffffff", padding: 16, borderRadius: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };

function countBadge(color: string, bg: string): React.CSSProperties {
  return { background: bg, color: color, padding: "2px 8px", borderRadius: 12, fontSize: 13, fontWeight: 700 };
}