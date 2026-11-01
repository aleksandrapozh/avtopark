import { NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { getDataSource, Vehicle, Driver, Waybill, Fine, Part, Refueling } from "@/lib/data-source";

export async function GET() {
  const g = await guard("dashboard");
  if (!g.ok) return g.response;

  try {
    const ds = await getDataSource();
    
    // 1. Получаем базовую статистику
    const [
      totalVehicles,
      vehiclesOnTrip,
      totalDrivers,
      activeWaybills,
      unpaidFinesCount,
    ] = await Promise.all([
      ds.getRepository(Vehicle).count(),
      ds.getRepository(Vehicle).count({ where: { status: "on_trip" } }),
      ds.getRepository(Driver).count({ where: { status: "active" } }),
      ds.getRepository(Waybill).count({ where: { status: "open" } }),
      ds.getRepository(Fine).count({ where: { status: "unpaid" } }),
    ]);

    const unpaidFinesResult = await ds.query(
      `SELECT SUM(amount) as total FROM fines WHERE status = 'unpaid'`
    );
    const unpaidFinesSum = Number(unpaidFinesResult[0]?.total || 0);

    // 2. Считаем "Запчасти на исходе" (суммируем остатки со всех складов поставщиков)
    const parts = await ds.getRepository(Part).find({ relations: { offers: true } });
    const lowStockParts = parts.filter(p => {
      const totalQty = p.offers?.reduce((sum, o) => sum + o.quantity, 0) || 0;
      return totalQty <= 3;
    }).length;

    // 3. Данные для Круговой диаграммы (Статусы машин)
    const vehicles = await ds.getRepository(Vehicle).find();
    const statusCounts: Record<string, number> = {};
    vehicles.forEach(v => {
      statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
    });
    
    const statusLabels: Record<string, string> = {
      available: "Готовы", on_trip: "В рейсе", maintenance: "На ТО", repair: "В ремонте", archived: "Архив"
    };
    const vehicleStatusData = Object.keys(statusCounts).map(key => ({
      name: statusLabels[key] || key,
      value: statusCounts[key]
    }));

    // 4. Данные для Столбчатой диаграммы (Расходы на топливо по месяцам)
    const refuelings = await ds.getRepository(Refueling).find();
    const fuelByMonth: Record<string, number> = {};
    refuelings.forEach(r => {
      const d = new Date(r.refuelingDate);
      const monthKey = d.toLocaleString("ru-RU", { month: "short", year: "numeric" });
      fuelByMonth[monthKey] = (fuelByMonth[monthKey] || 0) + Number(r.totalCost);
    });

    const fuelChartData = Object.keys(fuelByMonth).map(key => ({
      month: key,
      cost: fuelByMonth[key]
    })).reverse();

    return NextResponse.json({
      stats: {
        totalVehicles, vehiclesOnTrip, totalDrivers, activeWaybills,
        unpaidFinesCount, unpaidFinesSum, lowStockParts,
      },
      charts: {
        vehicleStatusData,
        fuelChartData
      }
    });
  } catch (e) {
    console.error("[dashboard GET] Ошибка:", e);
    return NextResponse.json({ error: "Ошибка получения статистики" }, { status: 500 });
  }
}