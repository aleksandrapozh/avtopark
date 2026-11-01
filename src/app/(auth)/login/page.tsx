"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./login.module.css"; // Подключаем наши стили

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      login,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Неверный логин или пароль");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className={styles.container}>
      
      {/* ЛЕВАЯ ПОЛОВИНА (БРЕНДИНГ) */}
      <div className={styles.leftSide}>
        <div className={styles.leftContent}>
          {/* Иконка грузовика */}
          <svg className={styles.logoIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          
          <h1 className={styles.title}>Автопарк</h1>
          <p className={styles.subtitle}>
            Автоматизация учета транспортных средств предприятия
          </p>
        </div>
      </div>

      {/* ПРАВАЯ ПОЛОВИНА (ФОРМА) */}
      <div className={styles.rightSide}>
        <div className={styles.formWrapper}>
          <h2 className={styles.formTitle}>Вход в систему</h2>
          <p className={styles.formSubtitle}>Введите свои данные для доступа к панели управления</p>

          <form onSubmit={onSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="login">Логин</label>
              <input
                id="login"
                type="text"
                className={styles.input}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">Пароль</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Проверка..." : "Войти"}
            </button>
          </form>
          
          <div style={{ marginTop: 30, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
            © {new Date().getFullYear()} Система учета автопарка
          </div>
        </div>
      </div>

    </div>
  );
}