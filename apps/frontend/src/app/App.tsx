import { AppRoutes } from "@/routes/AppRoutes";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastViewport } from "@/components/common/ToastViewport";
import { SessionSecurityManager } from "@/components/common/SessionSecurityManager";

export function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <SessionSecurityManager />
      <ToastViewport />
    </ErrorBoundary>
  );
}
