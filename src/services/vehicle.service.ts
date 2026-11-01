import { getDataSource, Vehicle } from "@/lib/data-source";
import type { VehicleCreateInput, VehicleUpdateInput } from "@/lib/validators/vehicle";

export const vehicleService = {
  // Список с сортировкой по номеру
  async list(): Promise<Vehicle[]> {
    const ds = await getDataSource();
    return ds.getRepository(Vehicle).find({
      order: { licensePlate: "ASC" },
    });
  },

  // Одна машина по ID (null, если нет)
  async byId(id: number): Promise<Vehicle | null> {
    const ds = await getDataSource();
    return ds.getRepository(Vehicle).findOne({ where: { vehicleId: id } });
  },

  // Создание
  async create(input: VehicleCreateInput): Promise<Vehicle> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Vehicle);
    const entity = repo.create(input as Partial<Vehicle>);
    return repo.save(entity);
  },

  // Обновление
  async update(id: number, input: VehicleUpdateInput): Promise<Vehicle> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Vehicle);
    const existing = await repo.findOne({ where: { vehicleId: id } });
    if (!existing) {
      throw new Error("Транспортное средство не найдено");
    }
    repo.merge(existing, input as Partial<Vehicle>);
    return repo.save(existing);
  },

  // Удаление. Бросаем осмысленную ошибку, если машина привязана
  // к путевым листам / заправкам / ремонтам (RESTRICT на FK).
  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Vehicle);
    const existing = await repo.findOne({ where: { vehicleId: id } });
    if (!existing) {
      throw new Error("Транспортное средство не найдено");
    }
    try {
      await repo.remove(existing);
    } catch {
      throw new Error(
        "Нельзя удалить: к автомобилю привязаны путевые листы, заправки или ремонты",
      );
    }
  },
};