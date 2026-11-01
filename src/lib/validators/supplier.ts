import { z } from "zod";

export const supplierCreateSchema = z.object({
  supplierName: z.string().min(2, "Минимум 2 символа").max(150).trim(),
  inn: z
    .string()
    .regex(/^\d{9}$/, "УНП должен состоять ровно из 9 цифр")
    .trim(),
  phone: z
    .string()
    .min(10, "Минимум 10 символов")
    .max(20, "Максимум 20 символов")
    .trim()
    .regex(/^\+375\s?\(?\d{2}\)?\s?\d{3}-?\d{2}-?\d{2}$/, "Формат: +375 (XX) XXX-XX-XX"),
  email: z
    .string()
    .email("Некорректный email")
    .optional()
    .or(z.literal("")), // Разрешаем пустую строку
  address: z.string().min(5, "Минимум 5 символов").max(255).trim(),
});

export const supplierUpdateSchema = supplierCreateSchema.partial();

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;