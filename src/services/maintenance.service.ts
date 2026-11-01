import { getDataSource, Maintenance, Part, Vehicle } from "@/lib/data-source";
import type { MaintenanceCreateInput, MaintenanceUpdateInput } from "@/lib/validators/maintenance";

export const maintenanceService = {
  async list(): Promise<Maintenance[]> {
    const ds = await getDataSource();
    return ds.getRepository(Maintenance).find({
      relations: { vehicle: true, part: true },
      order: { maintenanceDate: "DESC", maintenanceId: "DESC" },
    });
  },

  async create(input: MaintenanceCreateInput): Promise<Maintenance> {
    const ds = await getDataSource();
    const maintRepo = ds.getRepository(Maintenance);
    const partRepo = ds.getRepository(Part);
    const vehicleRepo = ds.getRepository(Vehicle);

    const part = await partRepo.findOne({ where: { partId: input.partId } });
    if (!part) throw new Error("Запчасть не найдена");
    if (part.quantity < input.partsQuantity) {
      throw new Error(`Недостаточно запчастей на складе (остаток: ${part.quantity})`);
    }

    // Списываем запчасти
    part.quantity -= input.partsQuantity;
    await partRepo.save(part);

    // Переводим машину в статус "В ремонте"
    const vehicle = await vehicleRepo.findOne({ where: { vehicleId: input.vehicleId } });
    if (vehicle) {
      vehicle.status = "repair";
      await vehicleRepo.save(vehicle);
    }

    const entity = maintRepo.create({
      vehicleId: input.vehicleId,
      partId: input.partId,
      maintenanceDate: input.maintenanceDate,
      workType: input.workType,
      partsQuantity: input.partsQuantity,
      totalCost: String(input.totalCost),
      mechanicNotes: input.mechanicNotes || null,
      status: input.status,
    });

    return maintRepo.save(entity);
  },

  async updateStatus(id: number, status: string): Promise<Maintenance> {
    const ds = await getDataSource();
    const maintRepo = ds.getRepository(Maintenance);
    const vehicleRepo = ds.getRepository(Vehicle);

    const existing = await maintRepo.findOne({ where: { maintenanceId: id } });
    if (!existing) throw new Error("Ремонт не найден");

    existing.status = status;
    await maintRepo.save(existing);

    // Если ремонт завершен — возвращаем машину в строй
    if (status === "completed") {
      const vehicle = await vehicleRepo.findOne({ where: { vehicleId: existing.vehicleId } });
      if (vehicle) {
        vehicle.status = "available";
        await vehicleRepo.save(vehicle);
      }
    }

    return existing;
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Maintenance);
    const existing = await repo.findOne({ where: { maintenanceId: id } });
    if (!existing) throw new Error("Ремонт не найден");
    
    // Возвращаем запчасти на склад
    const part = await ds.getRepository(Part).findOne({ where: { partId: existing.partId } });
    if (part) {
      part.quantity += existing.partsQuantity;
      await ds.getRepository(Part).save(part);
    }
    
    await repo.remove(existing);
  },
};