import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { driverService } from "@/services/driver.service";
import { driverCreateSchema } from "@/lib/validators/driver";
import { ZodError } from "zod";

export async function GET() {
  const g = await guard("drivers");
  if (!g.ok) return g.response;
  const items = await driverService.list();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const g = await guard("drivers");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "dispatcher") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = driverCreateSchema.parse(body);
    const created = await driverService.create(data);
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
      return NextResponse.json(
        { error: "Водитель с таким номером удостоверения уже существует" },
        { status: 409 },
      );
    }
    console.error("[drivers POST]", e);
    return NextResponse.json({ error: "Не удалось создать" }, { status: 500 });
  }
}