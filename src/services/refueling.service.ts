import { getDataSource, Refueling } from "@/lib/data-source";
import type { RefuelingCreateInput } from "@/lib/validators/refueling";

export const refuelingService = {
  async list(): Promise<Refueling[]> {
    const ds = await getDataSource();
    return ds.getRepository(Refueling).find({
      relations: { vehicle: true, driver: true },
      order: { refuelingDate: "DESC" },
    });
  },

  async create(input: RefuelingCreateInput): Promise<Refueling> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Refueling);
    
    // В TypeORM поля decimal (fuelAmount, pricePerLiter, totalCost) 
    // ожидают строку, поэтому приводим типы
    const entity = repo.create({
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      refuelingDate: new Date(input.refuelingDate),
      fuelType: input.fuelType,
      fuelAmount: String(input.fuelAmount),
      pricePerLiter: String(input.pricePerLiter),
      totalCost: String(input.totalCost),
    });
    
    return repo.save(entity);
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Refueling);
    const existing = await repo.findOne({ where: { refuelingId: id } });
    if (!existing) throw new Error("Заправка не найдена");
    await repo.remove(existing);
  },
};