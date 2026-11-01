import { getDataSource, Driver } from "@/lib/data-source";
import type { DriverCreateInput, DriverUpdateInput } from "@/lib/validators/driver";

export const driverService = {
  async list(): Promise<Driver[]> {
    const ds = await getDataSource();
    return ds.getRepository(Driver).find({
      order: { lastName: "ASC", firstName: "ASC" },
    });
  },

  async byId(id: number): Promise<Driver | null> {
    const ds = await getDataSource();
    return ds.getRepository(Driver).findOne({ where: { driverId: id } });
  },

  async create(input: DriverCreateInput): Promise<Driver> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Driver);
    // Приводим middleName к null, если пустая строка
    const middleName = input.middleName?.trim() || null;
    return repo.save(repo.create({ ...input, middleName }));
  },

  async update(id: number, input: DriverUpdateInput): Promise<Driver> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Driver);
    const existing = await repo.findOne({ where: { driverId: id } });
    if (!existing) throw new Error("Водитель не найден");

    const patch: Partial<Driver> = { ...input };
    if (input.middleName !== undefined) {
      patch.middleName = input.middleName?.trim() || null;
    }
    repo.merge(existing, patch);
    return repo.save(existing);
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Driver);
    const existing = await repo.findOne({ where: { driverId: id } });
    if (!existing) throw new Error("Водитель не найден");
    try {
      await repo.remove(existing);
    } catch {
      throw new Error(
        "Нельзя удалить: к водителю привязаны путевые листы или заправки",
      );
    }
  },
};