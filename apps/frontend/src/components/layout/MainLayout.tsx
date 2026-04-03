import { Outlet } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { SessionSetupCard } from "@/components/common/SessionSetupCard";
import { OfflineBanner } from "@/components/common/OfflineBanner";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col p-4 md:p-6">
        <OfflineBanner />
        <TopNav />
        <SessionSetupCard />
        <Outlet />
      </main>
    </div>
  );
}
