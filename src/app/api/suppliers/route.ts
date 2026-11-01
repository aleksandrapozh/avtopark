import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { supplierService } from "@/services/supplier.service";
import { supplierCreateSchema } from "@/lib/validators/supplier";
import { ZodError } from "zod";

export async function GET() {
  const g = await guard("suppliers");
  if (!g.ok) return g.response;

  try {
    const items = await supplierService.list();
    return NextResponse.json(items);
  } catch (e) {
    console.error("[suppliers GET] ОШИБКА:", e); // <--- Добавили лог
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("suppliers");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = supplierCreateSchema.parse(body);
    const created = await supplierService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Duplicate entry")) {
      return NextResponse.json({ error: "Поставщик с таким УНП уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: "Не удалось создать" }, { status: 500 });
  }
}