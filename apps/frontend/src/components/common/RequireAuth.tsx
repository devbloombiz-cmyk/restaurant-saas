import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactElement } from "react";
import { getSession } from "@/services/authService";
import { useAppStore } from "@/store/appStore";

export function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const hydrateSession = useAppStore((state) => state.hydrateSession);
  const resetSession = useAppStore((state) => state.resetSession);
  const [checkingSession, setCheckingSession] = useState(true);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession(): Promise<void> {
      if (!token) {
        if (isMounted) {
          setCheckingSession(false);
        }
        return;
      }

      try {
        const session = await getSession();

        if (isMounted) {
          hydrateSession(session);
        }
      } catch {
        if (isMounted) {
          resetSession();
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [token, hydrateSession, resetSession]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (checkingSession) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Validating session...</div>;
  }

  return children;
}
