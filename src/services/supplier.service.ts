import { getDataSource, Supplier } from "@/lib/data-source";
import type { SupplierCreateInput, SupplierUpdateInput } from "@/lib/validators/supplier";

export const supplierService = {
  async list(): Promise<Supplier[]> {
    const ds = await getDataSource();
    return ds.getRepository(Supplier).find({
      relations: { offers: true }, // Подтягиваем количество предложений
      order: { supplierName: "ASC" },
    });
  },

  async byId(id: number): Promise<Supplier | null> {
    const ds = await getDataSource();
    return ds.getRepository(Supplier).findOne({
      where: { supplierId: id },
      relations: { offers: { part: true } }, // Для карточки поставщика
    });
  },

  async create(input: SupplierCreateInput): Promise<Supplier> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Supplier);
    const email = input.email?.trim() || null;
    return repo.save(repo.create({ ...input, email }));
  },

  async update(id: number, input: SupplierUpdateInput): Promise<Supplier> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Supplier);
    const existing = await repo.findOne({ where: { supplierId: id } });
    if (!existing) throw new Error("Поставщик не найден");

    const patch: Partial<Supplier> = { ...input };
    if (input.email !== undefined) patch.email = input.email?.trim() || null;
    
    repo.merge(existing, patch);
    return repo.save(existing);
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Supplier);
    const existing = await repo.findOne({ where: { supplierId: id } });
    if (!existing) throw new Error("Поставщик не найден");
    await repo.remove(existing);
  },
};