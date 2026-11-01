import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as bcrypt from "bcryptjs";
import { AppDataSource, User } from "@/lib/data-source";

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const testUsers = [
    { login: "dispatcher1", password: "test123", role: "dispatcher", lastName: "Иванов", firstName: "Пётр" },
    { login: "mechanic1",   password: "test123", role: "mechanic",   lastName: "Сидоров", firstName: "Олег" },
    { login: "accountant1", password: "test123", role: "accountant", lastName: "Кузнецова", firstName: "Анна" },
  ];

  for (const u of testUsers) {
    const exists = await repo.findOne({ where: { login: u.login } });
    if (exists) {
      console.log(`Пользователь "${u.login}" уже существует — пропускаем.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await repo.save(
      repo.create({
        login: u.login,
        passwordHash,
        lastName: u.lastName,
        firstName: u.firstName,
        middleName: null,
        role: u.role,
        email: `${u.login}@example.com`,
        isActive: 1,
      }),
    );
    console.log(`Создан: ${u.login} (${u.role})`);
  }

  await AppDataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});