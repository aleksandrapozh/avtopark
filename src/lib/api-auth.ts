import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasAccess, isRole, type Section } from "@/lib/permissions";

type GuardResult =
  | { ok: true; userId: number; role: string }
  | { ok: false; response: NextResponse };

// Проверка для API: пользователь должен быть авторизован,
// а если указан section — иметь доступ к этому разделу.
export async function guard(section?: Section): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Не авторизован" }, { status: 401 }),
    };
  }

  const role = session.user.role;
  if (!isRole(role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Некорректная роль" }, { status: 403 }),
    };
  }

  if (section && !hasAccess(role, section)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Доступ запрещён" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.user.userId, role };
}