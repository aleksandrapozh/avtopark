import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { vehicleService } from "@/services/vehicle.service";
import { vehicleCreateSchema } from "@/lib/validators/vehicle";
import { ZodError } from "zod";

// GET /api/vehicles — список всех ТС
export async function GET() {
  const g = await guard("vehicles");
  if (!g.ok) return g.response;

  try {
    const items = await vehicleService.list();
    return NextResponse.json(items);
  } catch (e) {
    console.error("[vehicles GET]", e);
    return NextResponse.json(
      { error: "Не удалось получить список" },
      { status: 500 },
    );
  }
}

// POST /api/vehicles — создать новое ТС
export async function POST(req: NextRequest) {
  const g = await guard("vehicles");
  if (!g.ok) return g.response;

  // Только admin и dispatcher могут создавать ТС.
  // mechanic видит раздел, но менять парк не должен.
  if (g.role !== "admin" && g.role !== "dispatcher") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = vehicleCreateSchema.parse(body);
    const created = await vehicleService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Некорректные данные", issues: e.issues },
        { status: 400 },
      );
    }
    // Ловим UNIQUE-нарушение по license_plate или vin
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Duplicate entry")) {
      return NextResponse.json(
        { error: "Такой госномер или VIN уже зарегистрирован" },
        { status: 409 },
      );
    }
    console.error("[vehicles POST]", e);
    return NextResponse.json({ error: "Не удалось создать" }, { status: 500 });
  }
}