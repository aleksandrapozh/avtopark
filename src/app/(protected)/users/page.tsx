"use client";

import Link from "next/link";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { ROLE_LABELS } from "@/lib/permissions";

export default function UsersPage() {
  const { data, isLoading, error } = useUsers();
  const del = useDeleteUser();

  function handleDelete(id: number, login: string) {
    if (!confirm(`Удалить пользователя "${login}"?`)) return;
    del.mutate(id, {
      onError: (e) => alert(e instanceof Error ? e.message : "Ошибка удаления"),
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Пользователи</h1>
        <Link href="/users/new" style={btnPrimary}>+ Добавить сотрудника</Link>
      </div>

      {isLoading && <p>Загрузка...</p>}
      {error && <p style={{ color: "crimson" }}>Ошибка: {(error as Error).message}</p>}

      {data && data.length > 0 && (
        <table style={table}>
          <thead>
            <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
              <th style={th}>ФИО</th>
              <th style={th}>Логин</th>
              <th style={th}>Роль</th>
              <th style={th}>Статус</th>
              <th style={th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => {
              const fullName = [u.lastName, u.firstName, u.middleName].filter(Boolean).join(" ");
              return (
                <tr key={u.userId} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={td}>{fullName}</td>
                  <td style={{ ...td, fontFamily: "monospace" }}>{u.login}</td>
                  <td style={td}>{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}</td>
                  <td style={td}>
                    <span style={{ 
                      padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                      background: u.isActive ? "#dcfce7" : "#fee2e2",
                      color: u.isActive ? "#166534" : "#991b1b"
                    }}>
                      {u.isActive ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                  <td style={td}>
                    <Link href={`/users/${u.userId}/edit`} style={{ marginRight: 12, color: "#2563eb", textDecoration: "none" }}>
                      Изменить
                    </Link>
                    <button onClick={() => handleDelete(u.userId, u.login)} disabled={del.isPending} style={btnDanger}>
                      Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
const th: React.CSSProperties = { padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#374151" };
const td: React.CSSProperties = { padding: "10px 12px", fontSize: 14 };
const btnPrimary: React.CSSProperties = { padding: "8px 16px", background: "#2563eb", color: "#fff", borderRadius: 4, textDecoration: "none", fontSize: 14 };
const btnDanger: React.CSSProperties = { background: "transparent", border: "none", color: "#b91c1c", cursor: "pointer", padding: 0, fontSize: 14 };