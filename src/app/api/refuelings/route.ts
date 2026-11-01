import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { getDataSource, Refueling } from "@/lib/data-source";
import { refuelingCreateSchema } from "@/lib/validators/refueling";
import { ZodError } from "zod";

export async function GET() {
  const g = await guard("refuelings");
  if (!g.ok) return g.response;

  try {
    const ds = await getDataSource();
    const items = await ds.getRepository(Refueling).find({
      relations: { vehicle: true, driver: true }, // <--- ОБЯЗАТЕЛЬНО ДЛЯ ТАБЛИЦЫ
      order: { refuelingDate: "DESC" },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("[refuelings GET]", e);
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("refuelings");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "dispatcher" && g.role !== "accountant") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = refuelingCreateSchema.parse(body);
    const ds = await getDataSource();
    const repo = ds.getRepository(Refueling);
    
    const entity = repo.create({
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      refuelingDate: new Date(data.refuelingDate),
      fuelType: data.fuelType,
      fuelAmount: String(data.fuelAmount),
      pricePerLiter: String(data.pricePerLiter),
      totalCost: String(data.totalCost),
    });
    
    const saved = await repo.save(entity);
    return NextResponse.json(saved, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }
}