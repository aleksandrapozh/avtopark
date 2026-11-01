import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { supplierService } from "@/services/supplier.service";
import { supplierUpdateSchema } from "@/lib/validators/supplier";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const g = await guard("suppliers");
  if (!g.ok) return g.response;

  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  const item = await supplierService.byId(n);
  if (!item) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const g = await guard("suppliers");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  try {
    const body = await req.json();
    const data = supplierUpdateSchema.parse(body);
    const updated = await supplierService.update(n, data);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("не найден")) return NextResponse.json({ error: msg }, { status: 404 });
    if (msg.includes("Duplicate entry")) {
      return NextResponse.json({ error: "Поставщик с таким УНП уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const g = await guard("suppliers");
  if (!g.ok) return g.response;

  if (g.role !== "admin") {
    return NextResponse.json({ error: "Только администратор может удалять поставщиков" }, { status: 403 });
  }

  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  try {
    await supplierService.remove(n);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg.includes("не найден") ? 404 : 409 });
  }
}