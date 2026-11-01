"use client";

import { useState } from "react";
import Link from "next/link";
import { useWaybills, type WaybillDTO } from "@/hooks/useWaybills";
import { WAYBILL_STATUS_LABELS } from "@/lib/validators/waybill";
import { CloseWaybillModal } from "@/components/waybills/CloseWaybillModal";

export default function WaybillsPage() {
  const { data, isLoading, error } = useWaybills();
  const [waybillToClose, setWaybillToClose] = useState<WaybillDTO | null>(null);

  // Разделяем листы на активные и архивные
  const activeWaybills = data?.filter((w) => w.status === "open") || [];
  const historyWaybills = data?.filter((w) => w.status === "closed") || [];

  // Функция генерации PDF (тот самый идеальный бланк с твоего скриншота)
  async function handleDownloadPdf(w: WaybillDTO) {
    try {
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
      
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      if ((pdfMake as any).vfs) {
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;
      }

      const driverName = w.driver 
        ? `${w.driver.lastName} ${w.driver.firstName} ${w.driver.middleName || ""}`.trim() 
        : "—";

      const docDefinition: any = {
        content: [
          {
            columns: [
              {
                text: [
                  { text: "ООО «АвтоПарк»\n", bold: true, fontSize: 16 },
                  "УНП: 100000000\n",
                  "г. Минск, ул. Транспортная, 1"
                ],
                width: "*"
              },
              {
                text: [
                  { text: "ПУТЕВОЙ ЛИСТ\n", bold: true, fontSize: 18 },
                  { text: `№ ${w.waybillNumber}\n`, bold: true, fontSize: 14 },
                  `от ${new Date(w.issueDate).toLocaleDateString("ru-RU")}`
                ],
                alignment: "right",
                width: "*"
              }
            ],
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              widths: ["30%", "*"],
              body: [
                [{ text: "Транспортное средство", bold: true }, `${w.vehicle?.brandModel || "—"} (Госномер: ${w.vehicle?.licensePlate || "—"})`],
                [{ text: "Водитель", bold: true }, driverName],
                [{ text: "Удостоверение", bold: true }, w.driver?.licenseNumber || "—"]
              ]
            },
            layout: "lightHorizontalLines",
            margin: [0, 0, 0, 20]
          },
          {
            table: {
              widths: ["*", "*", "*"],
              body: [
                [{ text: "Показатель", bold: true, fillColor: "#eeeeee" }, { text: "При выезде", bold: true, fillColor: "#eeeeee" }, { text: "При возвращении", bold: true, fillColor: "#eeeeee" }],
                ["Показания одометра (км)", w.startMileage.toString(), w.endMileage ? w.endMileage.toString() : "—"],
                ["Выдано топлива (л)", Number(w.fuelIssued).toFixed(2), "—"]
              ]
            },
            layout: "lightHorizontalLines",
            margin: [0, 0, 0, 40]
          },
          {
            columns: [
              {
                text: [
                  `Водитель: _____________________ / ${driverName} /\n\n`,
                  `Диспетчер: _____________________ / ${w.user ? `${w.user.lastName} ${w.user.firstName}` : "______________"} /`
                ],
                width: "*"
              }
            ]
          }
        ],
        defaultStyle: { font: "Roboto", fontSize: 11 }
      };

      pdfMake.createPdf(docDefinition).open();
    } catch (err) {
      alert("Ошибка при создании PDF");
    }
  }

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Путевые листы</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: 14 }}>Управление рейсами и архив документации</p>
        </div>
        <Link href="/waybills/new" style={btnPrimary}>+ Выписать лист</Link>
      </div>

      {/* КАНБАН: АКТИВНЫЕ РЕЙСЫ */}
      <h2 style={{ fontSize: 18, color: "#334155", marginBottom: 16 }}>На линии (Активные рейсы)</h2>
      {activeWaybills.length === 0 ? (
        <div style={{ padding: 30, background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", color: "#64748b", textAlign: "center", marginBottom: 40 }}>
          Все машины в гараже. Активных рейсов нет.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 40 }}>
          {activeWaybills.map((w) => (
            <div key={w.waybillId} style={kanbanCard}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>{w.vehicle?.licensePlate}</span>
                <span style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>В рейсе</span>
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><strong>Водитель:</strong> {w.driver?.lastName} {w.driver?.firstName}</div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}><strong>Марка:</strong> {w.vehicle?.brandModel}</div>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}><strong>Выдан:</strong> {w.issueDate} (Пробег: {w.startMileage} км)</div>

              <div style={{ display: "flex", gap: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                <button onClick={() => setWaybillToClose(w)} style={btnKanbanPrimary}>Закрыть рейс</button>
                <button onClick={() => handleDownloadPdf(w)} style={btnKanbanSecondary}>PDF</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ТАБЛИЦА: АРХИВ */}
      <h2 style={{ fontSize: 18, color: "#334155", marginBottom: 16 }}>Архив путевых листов</h2>
      {historyWaybills.length > 0 ? (
        <table className="erp-table">
          <thead>
            <tr>
              <th>Номер / Дата</th>
              <th>Автомобиль</th>
              <th>Водитель</th>
              <th>Пробег (Нач/Кон)</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {historyWaybills.map((w) => (
              <tr key={w.waybillId}>
                <td>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{w.waybillNumber}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{w.issueDate}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{w.vehicle?.licensePlate}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{w.vehicle?.brandModel}</div>
                </td>
                <td>{w.driver?.lastName} {w.driver?.firstName}</td>
                <td>{w.startMileage} / {w.endMileage}</td>
                <td>
                  <button onClick={() => handleDownloadPdf(w)} style={{ ...btnLink, color: "#b91c1c" }}>
                    Скачать PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#64748b" }}>Архив пуст.</p>
      )}

      {waybillToClose && (
        <CloseWaybillModal waybill={waybillToClose} onClose={() => setWaybillToClose(null)} />
      )}
    </div>
  );
}

// Стили
const btnPrimary: React.CSSProperties = { padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14, fontWeight: 500 };
const btnLink: React.CSSProperties = { background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, fontSize: 14, textDecoration: "none", fontWeight: 500 };
const kanbanCard: React.CSSProperties = { background: "#ffffff", padding: 20, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", borderTop: "4px solid #2563eb" };
const btnKanbanPrimary: React.CSSProperties = { flex: 1, padding: "8px 12px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 };
const btnKanbanSecondary: React.CSSProperties = { padding: "8px 12px", background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 500 };