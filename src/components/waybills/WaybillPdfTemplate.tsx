"use client";

import { forwardRef } from "react";
import QRCode from "react-qr-code";
import type { WaybillDTO } from "@/hooks/useWaybills";

type Props = {
  waybill: WaybillDTO;
};

export const WaybillPdfTemplate = forwardRef<HTMLDivElement, Props>(
  ({ waybill }, ref) => {
    const qrData = JSON.stringify({
      type: "WAYBILL",
      id: waybill.waybillId,
      number: waybill.waybillNumber,
      vehicle: waybill.vehicle?.licensePlate,
      driver: waybill.driver ? `${waybill.driver.lastName} ${waybill.driver.firstName}` : "",
      date: waybill.issueDate,
    });

    const driverName = waybill.driver
      ? `${waybill.driver.lastName} ${waybill.driver.firstName} ${waybill.driver.middleName || ""}`.trim()
      : "—";

    return (
      <div
        ref={ref}
        style={{
          width: "794px", // А4 в пикселях
          minHeight: "1123px",
          padding: "40px",
          backgroundColor: "#ffffff", // Жестко белый фон
          color: "#000000",           // Жестко черный текст
          fontFamily: "'Times New Roman', Times, serif",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,    // Поверх всех элементов
          opacity: 0.01,    // Почти прозрачный (html2canvas его "увидит")
          pointerEvents: "none", // Чтобы не мешал кликать по сайту
          boxSizing: "border-box",
        }}
      >
        {/* Шапка */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>ООО «АвтоПарк»</h1>
            <p style={{ margin: "4px 0", fontSize: 12 }}>УНП: 100000000</p>
            <p style={{ margin: "4px 0", fontSize: 12 }}>г. Минск, ул. Транспортная, 1</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>ПУТЕВОЙ ЛИСТ</h2>
            <p style={{ margin: "4px 0", fontSize: 16, fontWeight: "bold" }}>№ {waybill.waybillNumber}</p>
            <p style={{ margin: "4px 0", fontSize: 14 }}>от {new Date(waybill.issueDate).toLocaleDateString("ru-RU")}</p>
          </div>
        </div>

        {/* Информация о ТС и водителе */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 14 }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: 8, width: "30%", fontWeight: "bold" }}>Транспортное средство</td>
              <td style={{ border: "1px solid #000", padding: 8 }}>
                {waybill.vehicle?.brandModel || "—"} (Госномер: {waybill.vehicle?.licensePlate || "—"})
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>Водитель</td>
              <td style={{ border: "1px solid #000", padding: 8 }}>{driverName}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: 8, fontWeight: "bold" }}>Удостоверение</td>
              <td style={{ border: "1px solid #000", padding: 8 }}>{waybill.driver?.licenseNumber || "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* Показатели */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30, fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #000", padding: 8 }}>Показатель</th>
              <th style={{ border: "1px solid #000", padding: 8 }}>При выезде</th>
              <th style={{ border: "1px solid #000", padding: 8 }}>При возвращении</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: 8 }}>Показания одометра (км)</td>
              <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>{waybill.startMileage}</td>
              <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>{waybill.endMileage || "—"}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #000", padding: 8 }}>Выдано топлива (л)</td>
              <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>{Number(waybill.fuelIssued).toFixed(2)}</td>
              <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>—</td>
            </tr>
          </tbody>
        </table>

        {/* Подписи и QR-код */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 50 }}>
          <div style={{ fontSize: 14 }}>
            <p style={{ marginBottom: 30 }}>Водитель: _____________________ / {driverName} /</p>
            <p>Диспетчер: _____________________ / {waybill.user ? `${waybill.user.lastName} ${waybill.user.firstName}` : "______________"} /</p>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <QRCode value={qrData} size={100} />
            <p style={{ fontSize: 10, marginTop: 4 }}>Сканируйте для проверки</p>
          </div>
        </div>
      </div>
    );
  }
);

WaybillPdfTemplate.displayName = "WaybillPdfTemplate";