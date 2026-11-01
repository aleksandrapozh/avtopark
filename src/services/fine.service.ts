import { getDataSource, Fine } from "@/lib/data-source";
import type { FineCreateInput, FineUpdateInput } from "@/lib/validators/fine";

export const fineService = {
  // Получаем список с подтянутой информацией о машине
  async list(): Promise<Fine[]> {
    const ds = await getDataSource();
    return ds.getRepository(Fine).find({
      relations: { vehicle: true },
      order: { violationDate: "DESC" },
    });
  },

  async byId(id: number): Promise<Fine | null> {
    const ds = await getDataSource();
    return ds.getRepository(Fine).findOne({
      where: { fineId: id },
      relations: { vehicle: true },
    });
  },

  async create(input: FineCreateInput): Promise<Fine> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Fine);
    
    const entity = repo.create({
      vehicleId: input.vehicleId,
      violationDate: new Date(input.violationDate),
      amount: String(input.amount), // TypeORM требует decimal строкой
      articleNumber: input.articleNumber,
      status: input.status,
    });
    
    return repo.save(entity);
  },

  async update(id: number, input: FineUpdateInput): Promise<Fine> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Fine);
    
    const existing = await repo.findOne({ where: { fineId: id } });
    if (!existing) throw new Error("Штраф не найден");

    // Готовим объект для обновления, аккуратно обрабатывая дату и сумму
    const patch: Partial<Fine> = { ...input } as any;
    if (input.violationDate) patch.violationDate = new Date(input.violationDate);
    if (input.amount) patch.amount = String(input.amount);
    
    repo.merge(existing, patch);
    return repo.save(existing);
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Fine);
    const existing = await repo.findOne({ where: { fineId: id } });
    if (!existing) throw new Error("Штраф не найден");
    await repo.remove(existing);
  },
};