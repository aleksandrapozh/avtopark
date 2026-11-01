"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ReportsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const [loading, setLoading] = useState(false);

  // Доступ к отчетам есть только у админа и бухгалтера
  if (role !== "admin" && role !== "accountant") {
    return (
      <div style={{ padding: 20, color: "crimson" }}>
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав для просмотра этого раздела.</p>
      </div>
    );
  }

  function handleDownload() {
    setLoading(true);
    // Просто открываем ссылку на API в новой вкладке — браузер сам начнет скачивание
    window.location.href = "/api/reports";
    // Через пару секунд возвращаем кнопку в исходное состояние
    setTimeout(() => setLoading(false), 2000);
  }

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 24 }}>Аналитические отчеты</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        
        {/* Карточка с отчетом */}
        <div style={card}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>📊</div>
          <h2 style={{ fontSize: 18, margin: "0 0 8px 0" }}>Сводный отчет по автопарку</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20, lineHeight: 1.5 }}>
            Содержит информацию о пробеге каждого ТС, затратах на топливо (ГСМ), 
            ремонты и штрафы. В последней колонке рассчитывается совокупная 
            стоимость владения (ТСО) каждой единицы техники.
          </p>
          <button 
            onClick={handleDownload} 
            disabled={loading}
            style={btnPrimary}
          >
            {loading ? "Формирование..." : "Скачать в Excel"}
          </button>
        </div>

      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  borderRadius: 8,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  border: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  background: "#166534", // Зеленый цвет, ассоциируется с Excel
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  marginTop: "auto",
};