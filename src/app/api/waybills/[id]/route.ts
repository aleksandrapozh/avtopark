import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { waybillService } from "@/services/waybill.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const g = await guard("waybills");
  if (!g.ok) return g.response;

  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  const item = await waybillService.byId(n);
  if (!item) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(item);
}