import { useEffect } from "react";
import { useToastStore } from "@/store/toastStore";

function toastClass(type: "success" | "error" | "info"): string {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (type === "error") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  return "border-sky-200 bg-sky-50 text-sky-900";
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 2800));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow ${toastClass(toast.type)}`}
          role="status"
        >
          {toast.message}
        </article>
      ))}
    </div>
  );
}
