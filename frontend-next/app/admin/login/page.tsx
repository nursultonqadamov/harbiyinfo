"use client";

import { useActionState } from "react";
import { login } from "@/lib/admin/actions";
import styles from "@/components/admin/admin.module.css";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 style={{ fontSize: 20, marginBottom: 24 }}>Admin panelga kirish</h1>
        <form action={action} className={styles.form}>
          <div className={styles.formRow}>
            <label htmlFor="username">Login</label>
            <input id="username" name="username" type="text" required autoComplete="username" />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="password">Parol</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state?.error && <p className={styles.errorText}>{state.error}</p>}
          <button type="submit" disabled={pending} className={styles.submitButton}>
            {pending ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
