import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { maintenanceService } from "@/services/maintenance.service";
import { maintenanceCreateSchema } from "@/lib/validators/maintenance";
import { ZodError } from "zod";

export async function GET() {
  const g = await guard("maintenance");
  if (!g.ok) return g.response;

  try {
    const items = await maintenanceService.list();
    return NextResponse.json(items);
  } catch (e) {
    console.error("[maintenance GET] КРИТИЧЕСКАЯ ОШИБКА:", e); // <--- ТЕПЕРЬ МЫ УВИДИМ ОШИБКУ
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("maintenance");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = maintenanceCreateSchema.parse(body);
    const created = await maintenanceService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Недостаточно запчастей")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("[maintenance POST]", e);
    return NextResponse.json({ error: "Не удалось создать ремонт" }, { status: 500 });
  }
}