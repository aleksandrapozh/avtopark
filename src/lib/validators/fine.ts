import { z } from "zod";

export const FINE_STATUSES = ["unpaid", "paid", "appealed"] as const;

export const FINE_STATUS_LABELS: Record<string, string> = {
  unpaid: "Не оплачен",
  paid: "Оплачен",
  appealed: "Обжалуется",
};

export const fineCreateSchema = z.object({
  vehicleId: z.coerce.number().int().positive("Выберите автомобиль"),
  violationDate: z.string().min(1, "Укажите дату и время"),
  amount: z.coerce.number().positive("Сумма должна быть больше 0"),
  articleNumber: z.string().min(1, "Укажите статью КоАП").trim(),
  status: z.enum(FINE_STATUSES).default("unpaid"),
});

export const fineUpdateSchema = fineCreateSchema.partial();

export type FineCreateInput = z.infer<typeof fineCreateSchema>;
export type FineUpdateInput = z.infer<typeof fineUpdateSchema>;