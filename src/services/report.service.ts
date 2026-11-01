import { getDataSource, Vehicle, Waybill, Refueling, Maintenance, Fine } from "@/lib/data-source";

export const reportService = {
  // Собираем сводную информацию по каждой машине
  async generateFleetSummary() {
    const ds = await getDataSource();
    
    const vehicles = await ds.getRepository(Vehicle).find({ order: { licensePlate: "ASC" } });
    const waybills = await ds.getRepository(Waybill).find();
    const refuelings = await ds.getRepository(Refueling).find();
    const maintenances = await ds.getRepository(Maintenance).find();
    const fines = await ds.getRepository(Fine).find();

    return vehicles.map(v => {
      // Считаем пройденный километраж (только по закрытым путевым листам)
      const vWaybills = waybills.filter(w => w.vehicleId === v.vehicleId && w.status === "closed");
      const totalMileage = vWaybills.reduce((sum, w) => sum + ((w.endMileage ?? 0) - w.startMileage), 0);

      // Считаем затраты на топливо
      const vRefuelings = refuelings.filter(r => r.vehicleId === v.vehicleId);
      const fuelCost = vRefuelings.reduce((sum, r) => sum + Number(r.totalCost), 0);

      // Считаем затраты на ремонты
      const vMaintenances = maintenances.filter(m => m.vehicleId === v.vehicleId);
      const repairCost = vMaintenances.reduce((sum, m) => sum + Number(m.totalCost), 0);

      // Считаем штрафы
      const vFines = fines.filter(f => f.vehicleId === v.vehicleId);
      const finesCost = vFines.reduce((sum, f) => sum + Number(f.amount), 0);

      return {
        licensePlate: v.licensePlate,
        brandModel: v.brandModel,
        totalMileage,
        fuelCost,
        repairCost,
        finesCost,
        totalCost: fuelCost + repairCost + finesCost, // Совокупная стоимость владения (ТСО)
      };
    });
  }
};