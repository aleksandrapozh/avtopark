import { z } from "zod";

export const USER_ROLES = ["admin", "dispatcher", "mechanic", "accountant"] as const;

export const userCreateSchema = z.object({
  login: z.string().min(3, "Минимум 3 символа").max(50).trim(),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  lastName: z.string().min(2, "Минимум 2 символа").max(50).trim(),
  firstName: z.string().min(2, "Минимум 2 символа").max(50).trim(),
  middleName: z.string().max(50).trim().nullable().optional(),
  role: z.enum(USER_ROLES),
  email: z.string().email("Некорректный email"),
  isActive: z.coerce.number().int().min(0).max(1).default(1),
});

// При обновлении пароль необязателен (если пустой — значит не меняем)
export const userUpdateSchema = userCreateSchema.partial();

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;