import { z } from "zod";

export const DRIVER_STATUSES = ["active", "vacation", "sick", "fired"] as const;

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  vacation: "В отпуске",
  sick: "На больничном",
  fired: "Уволен",
};

export const driverCreateSchema = z.object({
  lastName: z.string().min(2, "Минимум 2 символа").max(50).trim(),
  firstName: z.string().min(2, "Минимум 2 символа").max(50).trim(),
  middleName: z.string().max(50).trim().nullable().optional(),
  licenseNumber: z
    .string()
    .min(4, "Минимум 4 символа (например, AB123456)")
    .max(50, "Максимум 50 символов")
    .trim(),
  phone: z
    .string()
    .min(10, "Минимум 10 символов")
    .max(20, "Максимум 20 символов")
    .trim()
    .regex(/^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/, "Формат: +375 (XX) XXX-XX-XX"),
  status: z.enum(DRIVER_STATUSES).default("active"),
});

export const driverUpdateSchema = driverCreateSchema.partial();

export type DriverCreateInput = z.infer<typeof driverCreateSchema>;
export type DriverUpdateInput = z.infer<typeof driverUpdateSchema>;