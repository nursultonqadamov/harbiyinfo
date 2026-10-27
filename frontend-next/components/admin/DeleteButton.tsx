"use client";

import styles from "./admin.module.css";

export default function DeleteButton({
  action,
  confirmText = "Rostdan ham o'chirilsinmi?",
  children = "O'chirish",
}: {
  action: () => void;
  confirmText?: string;
  children?: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className={styles.deleteAction}>
        {children}
      </button>
    </form>
  );
}
