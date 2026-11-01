import { NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { getDataSource, PartCategory } from "@/lib/data-source";

export async function GET() {
  const g = await guard("parts");
  if (!g.ok) return g.response;

  try {
    const ds = await getDataSource();
    const items = await ds.getRepository(PartCategory).find({ order: { name: "ASC" } });
    return NextResponse.json(items);
  } catch (e) {
    console.error("[categories GET] ОШИБКА:", e); // <--- Добавили лог
    return NextResponse.json({ error: "Ошибка получения категорий" }, { status: 500 });
  }
}