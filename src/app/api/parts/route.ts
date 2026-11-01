import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { partService } from "@/services/part.service";
import { partCreateSchema } from "@/lib/validators/part";
import { ZodError } from "zod";

export async function GET() {
  const g = await guard("parts");
  if (!g.ok) return g.response;

  try {
    const items = await partService.list();
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("parts");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = partCreateSchema.parse(body);
    const created = await partService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    console.error("[parts POST]", e);
    return NextResponse.json({ error: "Не удалось создать запчасть" }, { status: 500 });
  }
}