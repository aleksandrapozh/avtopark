import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  hasAccess,
  isRole,
  sectionFromPath,
} from "@/lib/permissions";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // 1. Публичные пути (страница логина и все внутренние auth-роуты)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Если пользователь уже залогинен и лезет на /login — отправляем на dashboard
  if (pathname.startsWith("/login")) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 2. Не залогинен — на страницу входа с callbackUrl
  if (!session?.user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 3. Залогинен, но роль неизвестна — на всякий случай выкидываем
  const role = session.user.role;
  if (!isRole(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. Проверяем доступ к разделу
  const section = sectionFromPath(pathname);
  if (section && !hasAccess(role, section)) {
    // Роль не имеет доступа — отправляем на её родной dashboard,
    // чтобы не пугать 403-й страницей. Можно поменять на /forbidden.
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/drivers/:path*",
    "/waybills/:path*",
    "/refuelings/:path*",
    "/fines/:path*",
    "/maintenance/:path*",
    "/parts/:path*",
    "/suppliers/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/login",
  ],
};