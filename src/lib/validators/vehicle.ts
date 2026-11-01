import { z } from "zod";

export const VEHICLE_STATUSES = [
  "available",
  "on_trip",
  "maintenance",
  "repair",
  "archived",
] as const;

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  available: "Готов",
  on_trip: "В рейсе",
  maintenance: "На ТО",
  repair: "В ремонте",
  archived: "Архив",
};

export const vehicleCreateSchema = z.object({
  licensePlate: z
    .string()
    .min(4, "Минимум 4 символа")
    .max(20, "Максимум 20 символов")
    .trim()
    .refine(
      (val) => /^\d{4}\s?[A-ZА-Я]{2}-?[1-7]$/i.test(val),
      "Формат: 1234 АВ-7 (регион от 1 до 7)"
    ),
  brandModel: z.string().min(2, "Минимум 2 символа").max(100).trim(),
  vin: z
    .string()
    .length(17, "VIN должен содержать ровно 17 символов")
    .regex(/^[A-HJ-NPR-Z0-9]+$/i, "VIN содержит недопустимые символы")
    .trim(),
  // Используем z.coerce для автоматического преобразования строк в числа
  year: z.coerce
    .number({ error: "Укажите год" })
    .int("Год должен быть целым числом")
    .min(1950, "Слишком старый автомобиль")
    .max(new Date().getFullYear() + 1, "Год из будущего"),
  mileage: z.coerce
    .number({ error: "Укажите пробег" })
    .int("Пробег должен быть целым")
    .min(0, "Пробег не может быть отрицательным")
    .max(10_000_000, "Слишком большой пробег"),
  status: z.enum(VEHICLE_STATUSES).default("available"),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;