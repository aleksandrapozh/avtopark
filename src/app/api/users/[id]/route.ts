import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { userService } from "@/services/user.service";
import { userUpdateSchema } from "@/lib/validators/user";
import { ZodError } from "zod";

type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const g = await guard("users");
  if (!g.ok) return g.response;
  if (g.role !== "admin") return NextResponse.json({ error: "Только для администратора" }, { status: 403 });

  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  const item = await userService.byId(n);
  if (!item) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const g = await guard("users");
  if (!g.ok) return g.response;
  if (g.role !== "admin") return NextResponse.json({ error: "Только для администратора" }, { status: 403 });

  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  try {
    const body = await req.json();
    const data = userUpdateSchema.parse(body);
    const updated = await userService.update(n, data);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const g = await guard("users");
  if (!g.ok) return g.response;
  if (g.role !== "admin") return NextResponse.json({ error: "Только для администратора" }, { status: 403 });

  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });

  try {
    await userService.remove(n);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg.includes("не найден") ? 404 : 409 });
  }
}