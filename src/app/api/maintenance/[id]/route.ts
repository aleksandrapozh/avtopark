import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { maintenanceService } from "@/services/maintenance.service";
import { maintenanceUpdateSchema } from "@/lib/validators/maintenance";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const g = await guard("maintenance");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  try {
    const body = await req.json();
    const data = maintenanceUpdateSchema.parse(body);
    
    if (data.status) {
      const updated = await maintenanceService.updateStatus(n, data.status);
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const g = await guard("maintenance");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "mechanic") return NextResponse.json({ error: "Нет прав" }, { status: 403 });

  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  try {
    await maintenanceService.remove(n);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg.includes("не найден") ? 404 : 500 });
  }
}