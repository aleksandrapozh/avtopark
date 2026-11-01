import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { waybillService } from "@/services/waybill.service";
import { waybillCloseSchema } from "@/lib/validators/waybill";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const g = await guard("waybills");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "dispatcher") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = waybillCloseSchema.parse(body);
    const updated = await waybillService.close(n, data);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    // Ошибки бизнес-логики (меньше пробег, уже закрыт)
    if (msg.includes("не может быть меньше") || msg.includes("уже закрыт")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    if (msg.includes("не найден")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    console.error("[waybills close]", e);
    return NextResponse.json({ error: "Не удалось закрыть лист" }, { status: 500 });
  }
}