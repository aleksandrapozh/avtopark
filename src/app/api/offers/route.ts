import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { offerService } from "@/services/offer.service";
import { getDataSource, SupplierOffer } from "@/lib/data-source";

export async function GET(req: NextRequest) {
  const g = await guard("parts");
  if (!g.ok) return g.response;

  const supplierId = req.nextUrl.searchParams.get("supplierId");
  if (!supplierId) return NextResponse.json({ error: "Не указан supplierId" }, { status: 400 });

  try {
    const ds = await getDataSource();
    const offers = await ds.getRepository(SupplierOffer).find({
      where: { supplierId: Number(supplierId) },
      relations: { part: true },
      order: { part: { partName: "ASC" } },
    });
    return NextResponse.json(offers);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка получения прайса" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const g = await guard("parts");
  if (!g.ok) return g.response;
  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const saved = await offerService.upsertOffer(body);
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}