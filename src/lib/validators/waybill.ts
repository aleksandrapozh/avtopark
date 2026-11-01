import { z } from "zod";

export const WAYBILL_STATUSES = ["open", "closed"] as const;

export const WAYBILL_STATUS_LABELS: Record<string, string> = {
  open: "В рейсе (открыт)",
  closed: "Закрыт",
};

// Схема для СОЗДАНИЯ (когда диспетчер выписывает лист)
export const waybillCreateSchema = z.object({
  vehicleId: z.coerce.number().int().positive("Выберите автомобиль"),
  driverId: z.coerce.number().int().positive("Выберите водителя"),
  waybillNumber: z.string().min(3, "Минимум 3 символа").max(50).trim(),
  issueDate: z.string().min(1, "Укажите дату"),
  startMileage: z.coerce.number().int().min(0, "Пробег не может быть отрицательным"),
  fuelIssued: z.coerce.number().min(0, "Не может быть отрицательным").default(0),
});

// Схема для ЗАКРЫТИЯ (когда машина вернулась)
export const waybillCloseSchema = z.object({
  endMileage: z.coerce.number().int().min(0, "Пробег не может быть отрицательным"),
}).refine((data) => true); // Дополнительные проверки (например, end > start) сделаем в сервисе

export type WaybillCreateInput = z.infer<typeof waybillCreateSchema>;
export type WaybillCloseInput = z.infer<typeof waybillCloseSchema>;