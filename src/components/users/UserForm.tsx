"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HttpError } from "@/lib/http";
import { USER_ROLES, type UserCreateInput } from "@/lib/validators/user";
import { ROLE_LABELS } from "@/lib/permissions";
import type { UserDTO } from "@/hooks/useUsers";

type Props = {
    initial?: UserDTO;
    onSubmit: (data: UserCreateInput) => Promise<unknown>;
    submitLabel: string;
};

export function UserForm({ initial, onSubmit, submitLabel }: Props) {
    const router = useRouter();
    const isEdit = !!initial;

    const [form, setForm] = useState<UserCreateInput & { password?: string }>({
        login: initial?.login ?? "",
        password: "", // При редактировании оставляем пустым
        lastName: initial?.lastName ?? "",
        firstName: initial?.firstName ?? "",
        middleName: initial?.middleName ?? "",
        role: (initial?.role as any) ?? "dispatcher",
        email: initial?.email ?? "",
        isActive: initial?.isActive ?? 1,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setServerError(null);

        // Если создаем нового, пароль обязателен
        if (!isEdit && (!form.password || form.password.length < 6)) {
            setErrors({ password: "Пароль должен быть не менее 6 символов" });
            return;
        }

        setLoading(true);

        try {
            // Явно указываем any, чтобы TypeScript разрешил удалить поле пароля
            const payload: any = { ...form };
            if (isEdit && !payload.password) {
                delete payload.password;
            }

            await onSubmit(payload as UserCreateInput);
            router.push("/users");
            router.refresh();
        } catch (err) {
            if (err instanceof HttpError && Array.isArray(err.issues)) {
                const map: Record<string, string> = {};
                for (const issue of err.issues as { path: (string | number)[]; message: string }[]) {
                    const key = String(issue.path[0]);
                    if (!map[key]) map[key] = issue.message;
                }
                setErrors(map);
            } else if (err instanceof HttpError) {
                setServerError(err.message);
            } else {
                setServerError("Не удалось сохранить");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
            {serverError && <div style={errorBox}>{serverError}</div>}

            <Field label="Логин" error={errors.login}>
                <input type="text" value={form.login} onChange={(e) => update("login", e.target.value)} required style={input} />
            </Field>

            <Field label={isEdit ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"} error={errors.password}>
                <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required={!isEdit}
                    placeholder={isEdit ? "••••••" : ""}
                    style={input}
                />
            </Field>

            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <Field label="Фамилия" error={errors.lastName}>
                        <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required style={input} />
                    </Field>
                </div>
                <div style={{ flex: 1 }}>
                    <Field label="Имя" error={errors.firstName}>
                        <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required style={input} />
                    </Field>
                </div>
            </div>

            <Field label="Отчество (необязательно)" error={errors.middleName}>
                <input type="text" value={form.middleName ?? ""} onChange={(e) => update("middleName", e.target.value)} style={input} />
            </Field>

            <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required style={input} />
            </Field>

            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <Field label="Роль" error={errors.role}>
                        <select value={form.role} onChange={(e) => update("role", e.target.value as any)} style={input}>
                            {USER_ROLES.map((r) => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                        </select>
                    </Field>
                </div>
                <div style={{ flex: 1 }}>
                    <Field label="Статус" error={errors.isActive}>
                        <select value={form.isActive} onChange={(e) => update("isActive", Number(e.target.value))} style={input}>
                            <option value={1}>Активен</option>
                            <option value={0}>Заблокирован</option>
                        </select>
                    </Field>
                </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                <button type="submit" disabled={loading} style={btnPrimary}>
                    {loading ? "Сохранение..." : submitLabel}
                </button>
                <button type="button" onClick={() => router.push("/users")} style={btnSecondary}>
                    Отмена
                </button>
            </div>
        </form>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4, color: "#374151" }}>{label}</label>
            {children}
            {error && <div style={{ color: "crimson", fontSize: 12, marginTop: 2 }}>{error}</div>}
        </div>
    );
}

const input: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, boxSizing: "border-box" };
const errorBox: React.CSSProperties = { padding: "10px 12px", background: "#fee2e2", color: "#991b1b", borderRadius: 4, marginBottom: 14, fontSize: 14 };
const btnPrimary: React.CSSProperties = { padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 };
const btnSecondary: React.CSSProperties = { padding: "10px 20px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14 };