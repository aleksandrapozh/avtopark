import { getDataSource, Part } from "@/lib/data-source";
import type { PartCreateInput, PartUpdateInput } from "@/lib/validators/part";

export const partService = {
  async list(): Promise<Part[]> {
    const ds = await getDataSource();
    return ds.getRepository(Part).find({
      relations: { category: true, offers: { supplier: true } },
      order: { partName: "ASC" },
    });
  },

  async byId(id: number): Promise<Part | null> {
    const ds = await getDataSource();
    return ds.getRepository(Part).findOne({
      where: { partId: id },
      relations: { category: true, offers: { supplier: true } },
    });
  },

  async create(input: PartCreateInput): Promise<Part> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Part);
    
    const entity = repo.create({
      categoryId: input.categoryId || null,
      partNumber: input.partNumber,
      partName: input.partName,
      unit: input.unit,
      packSize: input.packSize,
    });
    
    return repo.save(entity);
  },

  async update(id: number, input: PartUpdateInput): Promise<Part> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Part);
    const existing = await repo.findOne({ where: { partId: id } });
    
    if (!existing) throw new Error("Запчасть не найдена");

    const patch: Partial<Part> = { ...input };
    repo.merge(existing, patch);
    return repo.save(existing);
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Part);
    const existing = await repo.findOne({ where: { partId: id } });
    
    if (!existing) throw new Error("Запчасть не найдена");
    
    try {
      await repo.remove(existing);
    } catch {
      throw new Error("Нельзя удалить: запчасть используется в ремонтах");
    }
  },
};