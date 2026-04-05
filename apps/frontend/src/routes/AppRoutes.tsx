import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HealthPage } from "@/components/common/HealthPage";
import { RequireRole } from "@/components/common/RequireRole";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAppStore } from "@/store/appStore";

const POSPage = lazy(async () => import("@/modules/pos/POSPage").then((module) => ({ default: module.POSPage })));
const AdminMenuPage = lazy(async () => import("@/modules/admin/AdminMenuPage").then((module) => ({ default: module.AdminMenuPage })));
const DailyReportsPage = lazy(async () => import("@/modules/reports/DailyReportsPage").then((module) => ({ default: module.DailyReportsPage })));
const ShopSettingsPage = lazy(async () => import("@/modules/settings/ShopSettingsPage").then((module) => ({ default: module.ShopSettingsPage })));
const SaasDashboardPage = lazy(async () => import("@/modules/super-admin/SaasDashboardPage").then((module) => ({ default: module.SaasDashboardPage })));
const SuperAdminOnboardingPage = lazy(
  async () => import("@/modules/super-admin/SuperAdminOnboardingPage").then((module) => ({ default: module.SuperAdminOnboardingPage }))
);
const LoginPage = lazy(async () => import("@/modules/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const SystemDiagnosticsPage = lazy(
  async () => import("@/modules/admin/SystemDiagnosticsPage").then((module) => ({ default: module.SystemDiagnosticsPage }))
);
const BackupManagementPage = lazy(
  async () => import("@/modules/admin/BackupManagementPage").then((module) => ({ default: module.BackupManagementPage }))
);
const FutureModulesPage = lazy(async () => import("@/modules/future/FutureModulesPage").then((module) => ({ default: module.FutureModulesPage })));

function RouteFallback() {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading module...</div>;
}

function RoleHomeRedirect() {
  const currentRole = useAppStore((state) => state.currentRole);
  const hasToken = Boolean(localStorage.getItem("accessToken"));

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole === "super_admin") {
    return <Navigate to="/super-admin/onboard" replace />;
  }

  if (currentRole === "shop_admin") {
    return <Navigate to="/admin/menu" replace />;
  }

  return <Navigate to="/pos" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<RouteFallback />}>
            <LoginPage />
          </Suspense>
        }
      />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route
          path="/pos"
          element={
            <RequireRole allowedRoles={["cashier"]}>
              <Suspense fallback={<RouteFallback />}>
                <POSPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route path="/pos/operations" element={<Navigate to="/pos" replace />} />
        <Route
          path="/admin/menu"
          element={
            <RequireRole allowedRoles={["shop_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <AdminMenuPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireRole allowedRoles={["shop_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <ShopSettingsPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/admin/diagnostics"
          element={
            <RequireRole allowedRoles={["shop_admin", "super_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <SystemDiagnosticsPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/admin/backup"
          element={
            <RequireRole allowedRoles={["shop_admin", "super_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <BackupManagementPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/reports/daily"
          element={
            <RequireRole allowedRoles={["shop_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <DailyReportsPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/onboard"
          element={
            <RequireRole allowedRoles={["super_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <SuperAdminOnboardingPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/saas/dashboard"
          element={
            <RequireRole allowedRoles={["super_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <SaasDashboardPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/future/modules"
          element={
            <RequireRole allowedRoles={["super_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <FutureModulesPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route path="/health" element={<HealthPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
