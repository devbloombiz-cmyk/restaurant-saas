import { Outlet } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { OfflineBanner } from "@/components/common/OfflineBanner";

export function MainLayout() {
  return (
    <div className="min-h-screen text-slate-900">
      <main className="mx-auto flex w-full max-w-[90rem] flex-col p-4 md:p-6">
        <OfflineBanner />
        <TopNav />
        <Outlet />
      </main>
    </div>
  );
}
