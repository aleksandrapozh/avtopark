import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import * as bcrypt from "bcryptjs";
import { AppDataSource, User } from "@/lib/data-source";

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const login = process.env.ADMIN_LOGIN ?? "admin";
  const exists = await repo.findOne({ where: { login } });

  if (exists) {
    console.log(`Администратор "${login}" уже существует — пропускаем.`);
  } else {
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD ?? "Admin123!",
      10,
    );
    const admin = repo.create({
      login,
      passwordHash,
      lastName: "Администратор",
      firstName: "Системный",
      middleName: null,
      role: "admin",
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      isActive: 1,
    });
    await repo.save(admin);
    console.log(`Создан администратор: логин="${login}"`);
  }

  await AppDataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});