import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { waybillService } from "@/services/waybill.service";
import { waybillCreateSchema } from "@/lib/validators/waybill";
import { ZodError } from "zod";

// GET /api/waybills
export async function GET() {
  const g = await guard("waybills");
  if (!g.ok) return g.response;

  try {
    const items = await waybillService.list();
    return NextResponse.json(items);
  } catch (e) {
    console.error("[waybills GET]", e);
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

// POST /api/waybills
export async function POST(req: NextRequest) {
  const g = await guard("waybills");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "dispatcher") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = waybillCreateSchema.parse(body);
    
    // Передаём userId из сессии, чтобы знать, кто выписал лист
    const created = await waybillService.create(data, g.userId);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Некорректные данные", issues: e.issues },
        { status: 400 },
      );
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Duplicate entry")) {
      return NextResponse.json({ error: "Путевой лист с таким номером уже существует" }, { status: 409 });
    }
    // Ошибки бизнес-логики (машина уже в рейсе)
    if (msg.includes("уже находится в рейсе")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("[waybills POST]", e);
    return NextResponse.json({ error: "Не удалось создать" }, { status: 500 });
  }
}