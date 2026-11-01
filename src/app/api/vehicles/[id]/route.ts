import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { vehicleService } from "@/services/vehicle.service";
import { vehicleUpdateSchema } from "@/lib/validators/vehicle";
import { ZodError } from "zod";

// В Next.js 15+ params — Promise, поэтому await
type Params = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// GET /api/vehicles/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const g = await guard("vehicles");
  if (!g.ok) return g.response;

  const { id } = await params;
  const n = parseId(id);
  if (n === null) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  const item = await vehicleService.byId(n);
  if (!item) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }
  return NextResponse.json(item);
}

// PATCH /api/vehicles/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const g = await guard("vehicles");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "dispatcher") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { id } = await params;
  const n = parseId(id);
  if (n === null) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = vehicleUpdateSchema.parse(body);
    const updated = await vehicleService.update(n, data);
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Некорректные данные", issues: e.issues },
        { status: 400 },
      );
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("не найдено")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes("Duplicate entry")) {
      return NextResponse.json(
        { error: "Такой госномер или VIN уже зарегистрирован" },
        { status: 409 },
      );
    }
    console.error("[vehicles PATCH]", e);
    return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
  }
}

// DELETE /api/vehicles/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const g = await guard("vehicles");
  if (!g.ok) return g.response;

  if (g.role !== "admin") {
    return NextResponse.json({ error: "Только администратор может удалять ТС" }, { status: 403 });
  }

  const { id } = await params;
  const n = parseId(id);
  if (n === null) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  try {
    await vehicleService.remove(n);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("не найдено")) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}