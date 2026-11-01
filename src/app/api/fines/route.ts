import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { fineService } from "@/services/fine.service";
import { fineCreateSchema } from "@/lib/validators/fine";
import { ZodError } from "zod";
import { getDataSource, Fine, Waybill } from "@/lib/data-source";

export async function GET() {
  const g = await guard("fines");
  if (!g.ok) return g.response;

  try {
    const ds = await getDataSource();
    // Загружаем штрафы и путевые листы
    const fines = await ds.getRepository(Fine).find({
      relations: { vehicle: true },
      order: { violationDate: "DESC" },
    });

    const waybills = await ds.getRepository(Waybill).find({
      relations: { driver: true },
    });

    // Обогащаем каждый штраф данными о водителе
    const enrichedFines = fines.map((fine) => {
      // Переводим дату нарушения в формат YYYY-MM-DD
      const fineDate = new Date(fine.violationDate).toISOString().split("T")[0];

      // Ищем путевой лист, который был выписан на эту машину в этот день
      const matchedWaybill = waybills.find((w) => {
        const issueDate = new Date(w.issueDate).toISOString().split("T")[0];
        return w.vehicleId === fine.vehicleId && issueDate === fineDate;
      });

      return {
        ...fine,
        driver: matchedWaybill?.driver || null, // Водитель или null, если не нашли
      };
    });

    return NextResponse.json(enrichedFines);
  } catch (e) {
    console.error("[fines GET]", e);
    return NextResponse.json({ error: "Ошибка получения списка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("fines");
  if (!g.ok) return g.response;

  if (g.role !== "admin" && g.role !== "accountant") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = fineCreateSchema.parse(body);
    const created = await fineService.create(data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Некорректные данные", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Не удалось создать штраф" }, { status: 500 });
  }
}