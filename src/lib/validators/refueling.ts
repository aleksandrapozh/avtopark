import { z } from "zod";

export const FUEL_TYPES = ["АИ-92", "АИ-95", "АИ-98", "ДТ", "Газ"] as const;

export const refuelingCreateSchema = z.object({
  vehicleId: z.coerce.number().int().positive("Выберите автомобиль"),
  driverId: z.coerce.number().int().positive("Выберите водителя"),
  refuelingDate: z.string().min(1, "Укажите дату и время"),
  fuelType: z.enum(FUEL_TYPES),
  fuelAmount: z.coerce.number().positive("Объем должен быть больше 0"),
  pricePerLiter: z.coerce.number().positive("Цена должна быть больше 0"),
  totalCost: z.coerce.number().positive("Сумма должна быть больше 0"),
});

export type RefuelingCreateInput = z.infer<typeof refuelingCreateSchema>;