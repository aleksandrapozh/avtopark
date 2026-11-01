import { getDataSource, User } from "@/lib/data-source";
import type { UserCreateInput, UserUpdateInput } from "@/lib/validators/user";
import * as bcrypt from "bcryptjs";

export const userService = {
  async list(): Promise<User[]> {
    const ds = await getDataSource();
    const users = await ds.getRepository(User).find({
      order: { lastName: "ASC", firstName: "ASC" },
    });
    
    // БЕЗОПАСНОСТЬ: удаляем хеши паролей перед отправкой на клиент
    users.forEach(u => { delete (u as any).passwordHash; });
    return users;
  },

  async byId(id: number): Promise<User | null> {
    const ds = await getDataSource();
    const user = await ds.getRepository(User).findOne({ where: { userId: id } });
    if (user) delete (user as any).passwordHash;
    return user;
  },

  async create(input: UserCreateInput): Promise<User> {
    const ds = await getDataSource();
    const repo = ds.getRepository(User);
    
    // Хешируем пароль (10 раундов соли)
    const passwordHash = await bcrypt.hash(input.password, 10);
    
    const entity = repo.create({
      login: input.login,
      passwordHash,
      lastName: input.lastName,
      firstName: input.firstName,
      middleName: input.middleName || null,
      role: input.role,
      email: input.email,
      isActive: input.isActive,
    });
    
    const saved = await repo.save(entity);
    delete (saved as any).passwordHash; // Не возвращаем хеш
    return saved;
  },

  async update(id: number, input: UserUpdateInput): Promise<User> {
    const ds = await getDataSource();
    const repo = ds.getRepository(User);
    const existing = await repo.findOne({ where: { userId: id } });
    
    if (!existing) throw new Error("Пользователь не найден");

    const patch: Partial<User> = { ...input } as any;
    
    // Если передан новый пароль — хешируем его
    if (input.password) {
      patch.passwordHash = await bcrypt.hash(input.password, 10);
    }
    // Удаляем сырой пароль, чтобы TypeORM случайно его не сохранил
    delete (patch as any).password;

    if (input.middleName !== undefined) {
      patch.middleName = input.middleName?.trim() || null;
    }
    
    repo.merge(existing, patch);
    const saved = await repo.save(existing);
    delete (saved as any).passwordHash;
    return saved;
  },

  async remove(id: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(User);
    const existing = await repo.findOne({ where: { userId: id } });
    
    if (!existing) throw new Error("Пользователь не найден");
    
    try {
      await repo.remove(existing);
    } catch {
      throw new Error("Нельзя удалить: к пользователю привязаны путевые листы");
    }
  },
};