import { NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { reportService } from "@/services/report.service";
import ExcelJS from "exceljs";

export async function GET() {
  const g = await guard("reports");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "accountant") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const data = await reportService.generateFleetSummary();

    // Создаем книгу Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Сводка по автопарку");

    // Задаем колонки
    sheet.columns = [
      { header: "Госномер", key: "licensePlate", width: 15 },
      { header: "Марка и модель", key: "brandModel", width: 25 },
      { header: "Пробег по путевым листам (км)", key: "totalMileage", width: 25 },
      { header: "Затраты на ГСМ (руб.)", key: "fuelCost", width: 20 },
      { header: "Затраты на ремонт (руб.)", key: "repairCost", width: 20 },
      { header: "Штрафы (руб.)", key: "finesCost", width: 20 },
      { header: "Итого ТСО (руб.)", key: "totalCost", width: 20 },
    ];

    // Стилизуем заголовок
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };

    // Добавляем данные
    data.forEach(row => sheet.addRow(row));

    // Генерируем буфер файла
    const buffer = await workbook.xlsx.writeBuffer();

    // Возвращаем файл клиенту
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="fleet_report_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (e) {
    console.error("[reports GET]", e);
    return NextResponse.json({ error: "Ошибка генерации отчета" }, { status: 500 });
  }
}