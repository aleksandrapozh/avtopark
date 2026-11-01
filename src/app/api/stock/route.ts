import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/api-auth";
import { stockService } from "@/services/stock.service";

export async function POST(req: NextRequest) {
  const g = await guard("parts");
  if (!g.ok) return g.response;
  if (g.role !== "admin" && g.role !== "mechanic") {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updatedPart = await stockService.adjustStock({
      ...body,
      userId: g.userId,
    });
    return NextResponse.json(updatedPart);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  const g = await guard("parts");
  if (!g.ok) return g.response;
  const items = await stockService.getMovements();
  return NextResponse.json(items);
}