import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HealthPage } from "@/components/common/HealthPage";
import { RequireRole } from "@/components/common/RequireRole";

const POSPage = lazy(async () => import("@/modules/pos/POSPage").then((module) => ({ default: module.POSPage })));
const OperationsPage = lazy(async () => import("@/modules/pos/OperationsPage").then((module) => ({ default: module.OperationsPage })));
const AdminMenuPage = lazy(async () => import("@/modules/admin/AdminMenuPage").then((module) => ({ default: module.AdminMenuPage })));
const DailyReportsPage = lazy(async () => import("@/modules/reports/DailyReportsPage").then((module) => ({ default: module.DailyReportsPage })));
const ShopSettingsPage = lazy(async () => import("@/modules/settings/ShopSettingsPage").then((module) => ({ default: module.ShopSettingsPage })));
const SaasDashboardPage = lazy(async () => import("@/modules/super-admin/SaasDashboardPage").then((module) => ({ default: module.SaasDashboardPage })));
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

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/pos" replace />} />
        <Route
          path="/pos"
          element={
            <Suspense fallback={<RouteFallback />}>
              <POSPage />
            </Suspense>
          }
        />
        <Route
          path="/pos/operations"
          element={
            <Suspense fallback={<RouteFallback />}>
              <OperationsPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AdminMenuPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireRole allowedRoles={["shop_admin", "super_admin"]}>
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
            <Suspense fallback={<RouteFallback />}>
              <DailyReportsPage />
            </Suspense>
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
            <RequireRole allowedRoles={["super_admin", "shop_admin"]}>
              <Suspense fallback={<RouteFallback />}>
                <FutureModulesPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route path="/health" element={<HealthPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/pos" replace />} />
    </Routes>
  );
}
