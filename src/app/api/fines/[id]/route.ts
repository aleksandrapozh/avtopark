import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { fineService } from "@/services/fine.service";
import { fineUpdateSchema } from "@/lib/validators/fine";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /api/fines/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const g = await guard("fines");
  if (!g.ok) return g.response;

  const { id } = await params;
  const n = parseId(id);
  if (n === null) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  const item = await fineService.byId(n);
  if (!item) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(item);
}

// PATCH /api/fines/:id (например, для отметки об оплате)
export async function PATCH(req: NextRequest, { params }: Params) {
  const g = await guard("fines");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "accountant") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { id } = await params;
  const n = parseId(id);
  if (n === null) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = fineUpdateSchema.parse(body);
    const updated = await fineService.update(n, data);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("не найден")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
}

// DELETE /api/fines/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const g = await guard("fines");
  if (!g.ok) return g.response;

  if (g.role !== "admin") {
    return NextResponse.json({ error: "Только администратор может удалять штрафы" }, { status: 403 });
  }

  const { id } = await params;
  const n = parseId(id);
  if (n === null) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  try {
    await fineService.remove(n);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.includes("не найден") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}