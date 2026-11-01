import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { userService } from "@/services/user.service";
import { userCreateSchema } from "@/lib/validators/user";
import { ZodError } from "zod";

export async function GET() {
  const g = await guard("users"); // Проверка, что раздел доступен роли
  if (!g.ok) return g.response;
  if (g.role !== "admin") return NextResponse.json({ error: "Только для администратора" }, { status: 403 });

  try {
    const items = await userService.list();
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("users");
  if (!g.ok) return g.response;
  if (g.role !== "admin") return NextResponse.json({ error: "Только для администратора" }, { status: 403 });

  try {
    const body = await req.json();
    const data = userCreateSchema.parse(body);
    const created = await userService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Duplicate entry")) {
      return NextResponse.json({ error: "Пользователь с таким логином уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: "Не удалось создать" }, { status: 500 });
  }
}