import { z } from "zod";

export const partCreateSchema = z.object({
  supplierId: z.coerce.number().int().positive("Выберите поставщика"),
  categoryId: z.coerce.number().int().positive("Выберите категорию").nullable().optional(),
  partNumber: z.string().min(1, "Укажите артикул").max(50).trim(),
  partName: z.string().min(2, "Минимум 2 символа").max(150).trim(),
  quantity: z.coerce.number().int().min(0, "Количество не может быть отрицательным").default(0),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  unit: z.string().default("шт"),
  packSize: z.coerce.number().int().min(1, "Размер комплекта минимум 1").default(1),
});

export const partUpdateSchema = partCreateSchema.partial();

export type PartCreateInput = z.infer<typeof partCreateSchema>;
export type PartUpdateInput = z.infer<typeof partUpdateSchema>;