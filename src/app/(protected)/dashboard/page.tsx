"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

type DashboardData = {
  stats: {
    totalVehicles: number; vehiclesOnTrip: number; totalDrivers: number;
    activeWaybills: number; unpaidFinesCount: number; unpaidFinesSum: number;
    lowStockParts: number;
  };
  charts: {
    vehicleStatusData: { name: string; value: number }[];
    fuelChartData: { month: string; cost: number }[];
  };
};

const COLORS = ["#166534", "#2563eb", "#d97706", "#b91c1c", "#6b7280"];

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => http.get<DashboardData>("/api/dashboard"),
  });

  if (isLoading) return <p>Загрузка аналитики...</p>;

  if (error) return <p style={{ color: "crimson" }}>Ошибка загрузки: {(error as Error).message}</p>;

  if (!data) return <p>Нет данных</p>;

  // Объявляем переменные только ОДИН раз
  const { stats, charts } = data;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Панель управления</h1>
        <p style={{ color: "#6b7280", marginTop: 8 }}>Аналитическая сводка по автопарку на сегодня.</p>
      </div>

      {/* КАРТОЧКИ (СТАТИСТИКА) */}
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Всего автомобилей</div>
          <div style={numberStyle}>{stats.totalVehicles}</div>
          <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 500 }}>В рейсе: {stats.vehiclesOnTrip}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Открытых путевых листов</div>
          <div style={numberStyle}>{stats.activeWaybills}</div>
          <div style={{ fontSize: 13, color: "#d97706", fontWeight: 500 }}>Машины в настоящее время в рейсах</div>
        </div>

        {(role === "admin" || role === "accountant") && (
          <div style={{ ...cardStyle, borderLeft: "4px solid #b91c1c" }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Неоплаченные штрафы</div>
            <div style={{ ...numberStyle, color: "#b91c1c" }}>{stats.unpaidFinesSum.toFixed(2)} BYN</div>
            <Link href="/fines" style={{ fontSize: 13, color: "#b91c1c", textDecoration: "underline" }}>Всего штрафов: {stats.unpaidFinesCount} (перейти)</Link>
          </div>
        )}
      </div>

      {/* ГРАФИКИ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20, marginTop: 20 }}>

        {/* Круговая диаграмма */}
        <div style={chartCardStyle}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16, color: "#1f2937" }}>Статусы автопарка</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={charts.vehicleStatusData}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {charts.vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Столбчатая диаграмма */}
        <div style={chartCardStyle}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16, color: "#1f2937" }}>Расходы на ГСМ (BYN)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={charts.fuelChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

// Стили
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 };
const cardStyle: React.CSSProperties = { background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column" };
const numberStyle: React.CSSProperties = { fontSize: 32, fontWeight: 700, color: "#1f2937", margin: "8px 0" };
const chartCardStyle: React.CSSProperties = { background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" };