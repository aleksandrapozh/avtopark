"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  hasAccess,
  isRole,
  ROLE_LABELS,
  type Section,
} from "@/lib/permissions";

type NavItem = { section: Section; href: string; label: string };

// Пункты меню — порядок отображения сверху вниз
const NAV_ITEMS: NavItem[] = [
  { section: "dashboard", href: "/dashboard", label: "Панель управления" },
  { section: "vehicles", href: "/vehicles", label: "Транспортные средства" },
  { section: "drivers", href: "/drivers", label: "Водители" },
  { section: "waybills", href: "/waybills", label: "Путевые листы" },
  { section: "refuelings", href: "/refuelings", label: "Заправки (ГСМ)" },
  { section: "fines", href: "/fines", label: "Штрафы" },
  { section: "maintenance", href: "/maintenance", label: "Ремонты и ТО" },
  { section: "suppliers", href: "/suppliers", label: "Поставщики" },
  { section: "parts", href: "/parts", label: "Запчасти" },
  { section: "reports", href: "/reports", label: "Отчёты" },
  { section: "users", href: "/users", label: "Пользователи" },
];

type Props = {
  role: string;
  userName: string;
};

export function Sidebar({ role, userName }: Props) {
  const pathname = usePathname();

  // Если роль неизвестна — показываем только dashboard
  const visibleItems = isRole(role)
    ? NAV_ITEMS.filter((i) => hasAccess(role, i.section))
    : [];

  const roleLabel = isRole(role) ? ROLE_LABELS[role] : role;

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "#1f2937",
        color: "#f9fafb",
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 16px 16px", borderBottom: "1px solid #374151" }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>Автопарк</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{userName}</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{roleLabel}</div>
      </div>

      <nav style={{ flex: 1, padding: "12px 0" }}>
        {visibleItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 16px",
                color: active ? "#fff" : "#d1d5db",
                background: active ? "#374151" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                borderLeft: active ? "3px solid #60a5fa" : "3px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid #374151" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "#b91c1c",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}