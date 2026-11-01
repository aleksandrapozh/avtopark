import { getDataSource, Part, StockMovement, SupplierOffer } from "@/lib/data-source";

type StockAction = {
  partId: number;
  userId: number;
  supplierId?: number;
  type: "in" | "write_off";
  quantity: number;
  price?: number;
  reason?: string;
  comment?: string;
};

export const stockService = {
  async adjustStock(data: StockAction) {
    const ds = await getDataSource();
    const partRepo = ds.getRepository(Part);
    const moveRepo = ds.getRepository(StockMovement);
    const offerRepo = ds.getRepository(SupplierOffer);

    const part = await partRepo.findOne({ where: { partId: data.partId } });
    if (!part) throw new Error("Запчасть не найдена");

    if (data.type === "in") {
      if (!data.supplierId) throw new Error("Выберите поставщика");
      if (data.price === undefined) throw new Error("Укажите цену закупки");
      
      const offer = await offerRepo.findOne({ 
        where: { partId: data.partId, supplierId: data.supplierId } 
      });

      if (!offer) throw new Error("У этого поставщика нет такой запчасти в прайсе");
      if (offer.quantity < data.quantity) {
        throw new Error(`У поставщика недостаточно товара (есть: ${offer.quantity} шт.)`);
      }

      // ЗАБИРАЕМ У ПОСТАВЩИКА
      offer.quantity -= data.quantity;
      await offerRepo.save(offer);

      // ДОБАВЛЯЕМ НА НАШ СКЛАД
      part.quantity += data.quantity;
      part.price = String(data.price); // Обновляем нашу закупочную цену
      await partRepo.save(part);

    } else if (data.type === "write_off") {
      // СПИСЫВАЕМ С НАШЕГО СКЛАДА
      if (part.quantity < data.quantity) {
        throw new Error(`На нашем складе недостаточно товара (есть: ${part.quantity} шт.)`);
      }
      part.quantity -= data.quantity;
      await partRepo.save(part);
    }

    // Записываем в журнал
    const movement = moveRepo.create({
      partId: data.partId,
      userId: data.userId,
      supplierId: data.supplierId || null,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason || null,
      comment: data.comment || null,
    });
    await moveRepo.save(movement);

    return part;
  },

  async getMovements() {
    const ds = await getDataSource();
    return ds.getRepository(StockMovement).find({
      relations: { part: true, user: true, supplier: true },
      order: { createdAt: "DESC" },
    });
  }
};