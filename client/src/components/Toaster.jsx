import React from "react";
import { useToast } from "../toast/ToastContext";

export default function Toaster() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="toaster-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-bar ${t.variant || "success"}`}>
          <div className="msg">{t.message}</div>
          <button className="x" aria-label="close" onClick={() => removeToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
