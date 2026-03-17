"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";

interface ToastMessage {
  id: number;
  text: string;
}

let toastId = 0;
let addToastFn: ((text: string) => void) | null = null;

export function showToast(text: string) {
  addToastFn?.(text);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 border-[3px] border-[rgb(var(--foreground))] bg-[rgb(var(--primary))] px-4 py-2.5 text-sm font-bold text-[rgb(var(--primary-foreground))] shadow-[var(--shadow-sm)] animate-slide-up rounded-lg"
        >
          <Icon icon="solar:check-circle-bold" width={16} />
          <span>{toast.text}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-1 rounded p-0.5 hover:opacity-70"
          >
            <Icon icon="solar:close-circle-bold" width={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
