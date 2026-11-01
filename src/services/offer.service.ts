import { getDataSource, SupplierOffer } from "@/lib/data-source";

export const offerService = {
  // Получить все предложения для конкретной запчасти
  async getOffersByPart(partId: number): Promise<SupplierOffer[]> {
    const ds = await getDataSource();
    return ds.getRepository(SupplierOffer).find({
      where: { partId },
      relations: { supplier: true },
      order: { price: "ASC" },
    });
  },

  // Добавить или обновить цену поставщика
  async upsertOffer(data: { supplierId: number; partId: number; price: number; quantity: number }) {
    const ds = await getDataSource();
    const repo = ds.getRepository(SupplierOffer);
    
    let offer = await repo.findOne({ 
      where: { supplierId: data.supplierId, partId: data.partId } 
    });

    if (offer) {
      offer.price = String(data.price);
      offer.quantity = data.quantity;
    } else {
      offer = repo.create({
        supplierId: data.supplierId,
        partId: data.partId,
        price: String(data.price),
        quantity: data.quantity,
      });
    }
    return repo.save(offer);
  },

  // Удалить предложение
  async removeOffer(offerId: number) {
    const ds = await getDataSource();
    const repo = ds.getRepository(SupplierOffer);
    await repo.delete(offerId);
  }
};