import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAppStore } from "@/store/appStore";
import { useToastStore } from "@/store/toastStore";
import { SessionTimeoutModal } from "@/components/common/SessionTimeoutModal";
import { isTokenNearExpiry } from "@/utils/token";

const SESSION_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export function SessionSecurityManager() {
  const resetSession = useAppStore((state) => state.resetSession);
  const pushToast = useToastStore((state) => state.pushToast);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const accessToken = useMemo(() => localStorage.getItem("accessToken"), []);

  function performLogout(): void {
    resetSession();
    localStorage.removeItem("refreshToken");
    setShowTimeoutModal(false);
    pushToast({ type: "info", message: "You have been logged out." });
  }

  async function refreshSession(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      performLogout();
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
      const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
      const nextAccessToken = response.data?.data?.accessToken as string | undefined;
      const nextRefreshToken = response.data?.data?.refreshToken as string | undefined;

      if (!nextAccessToken || !nextRefreshToken) {
        performLogout();
        return;
      }

      localStorage.setItem("accessToken", nextAccessToken);
      localStorage.setItem("refreshToken", nextRefreshToken);
      setShowTimeoutModal(false);
      pushToast({ type: "success", message: "Session refreshed." });
    } catch {
      performLogout();
    }
  }

  useEffect(() => {
    function trackActivity(): void {
      lastActivityRef.current = Date.now();
    }

    const events = ["mousemove", "keydown", "click", "scroll"] as const;
    events.forEach((event) => window.addEventListener(event, trackActivity));

    const interval = window.setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= SESSION_IDLE_TIMEOUT_MS) {
        performLogout();
        return;
      }

      if (isTokenNearExpiry(token, 90)) {
        setShowTimeoutModal(true);
      }
    }, 15_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, trackActivity));
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (accessToken && isTokenNearExpiry(accessToken, 90)) {
      setShowTimeoutModal(true);
    }
  }, [accessToken]);

  return <SessionTimeoutModal visible={showTimeoutModal} onStaySignedIn={() => void refreshSession()} onLogout={performLogout} />;
}
