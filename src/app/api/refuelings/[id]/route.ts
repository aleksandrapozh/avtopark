import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { refuelingService } from "@/services/refueling.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const g = await guard("refuelings");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "accountant") {
    return NextResponse.json({ error: "Только администратор или бухгалтер могут удалять записи" }, { status: 403 });
  }

  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  try {
    await refuelingService.remove(n);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg.includes("не найдена") ? 404 : 500 });
  }
}