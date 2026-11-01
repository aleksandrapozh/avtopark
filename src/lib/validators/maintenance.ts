import { z } from "zod";

export const MAINTENANCE_STATUSES = ["in_progress", "completed"] as const;
export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  in_progress: "В работе",
  completed: "Завершен",
};

export const maintenanceCreateSchema = z.object({
  vehicleId: z.coerce.number().int().positive("Выберите автомобиль"),
  partId: z.coerce.number().int().positive("Выберите запчасть"),
  maintenanceDate: z.string().min(1, "Укажите дату"),
  workType: z.string().min(2, "Опишите вид работ").max(100).trim(),
  partsQuantity: z.coerce.number().int().positive("Количество должно быть больше 0"),
  totalCost: z.coerce.number().min(0, "Стоимость не может быть отрицательной"),
  mechanicNotes: z.string().max(1000).trim().optional(),
  status: z.enum(MAINTENANCE_STATUSES).default("in_progress"),
});

export const maintenanceUpdateSchema = maintenanceCreateSchema.partial();

export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>;
export type MaintenanceUpdateInput = z.infer<typeof maintenanceUpdateSchema>;