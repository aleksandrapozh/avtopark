// Роли в системе — соответствуют полю `role` таблицы users
export type Role = "admin" | "dispatcher" | "mechanic" | "accountant";

// Разделы приложения — ключи, которые используются в проверках
export type Section =
  | "dashboard"
  | "vehicles"
  | "drivers"
  | "waybills"
  | "refuelings"
  | "fines"
  | "maintenance"
  | "parts"
  | "suppliers"
  | "reports"
  | "users";

// Карта: роль → какие разделы ей доступны.
// admin видит всё, остальные — только свои области.
export const ROLE_SECTIONS: Record<Role, Section[]> = {
  admin: [
    "dashboard",
    "vehicles",
    "drivers",
    "waybills",
    "refuelings",
    "fines",
    "maintenance",
    "parts",
    "suppliers",
    "reports",
    "users",
  ],
  dispatcher: ["dashboard", "vehicles", "drivers", "waybills"],
  mechanic: ["dashboard", "vehicles", "maintenance", "parts", "suppliers"],
  accountant: ["dashboard", "vehicles", "refuelings", "fines", "reports"],
};

// Связь: URL-префикс → раздел.
// Используется в proxy.ts, чтобы понять, какой раздел запрашивает пользователь.
export const PATH_TO_SECTION: { prefix: string; section: Section }[] = [
  { prefix: "/dashboard", section: "dashboard" },
  { prefix: "/vehicles", section: "vehicles" },
  { prefix: "/drivers", section: "drivers" },
  { prefix: "/waybills", section: "waybills" },
  { prefix: "/refuelings", section: "refuelings" },
  { prefix: "/fines", section: "fines" },
  { prefix: "/maintenance", section: "maintenance" },
  { prefix: "/parts", section: "parts" },
  { prefix: "/suppliers", section: "suppliers" },
  { prefix: "/reports", section: "reports" },
  { prefix: "/users", section: "users" },
];

// Утилиты ────────────────────────────────────────────────

export function isRole(value: unknown): value is Role {
  return (
    value === "admin" ||
    value === "dispatcher" ||
    value === "mechanic" ||
    value === "accountant"
  );
}

export function hasAccess(role: Role, section: Section): boolean {
  return ROLE_SECTIONS[role]?.includes(section) ?? false;
}

// Определяем раздел по URL. Если URL не совпадает ни с одним префиксом — null.
export function sectionFromPath(pathname: string): Section | null {
  for (const { prefix, section } of PATH_TO_SECTION) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return section;
    }
  }
  return null;
}

// Красивые названия ролей — пригодятся в UI
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Администратор",
  dispatcher: "Диспетчер",
  mechanic: "Механик",
  accountant: "Бухгалтер",
};