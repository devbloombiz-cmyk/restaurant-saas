import { useDailyReportQuery } from "@/hooks/useReportQueries";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/Skeleton";

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

export function DailyReportsPage() {
  const { data, isLoading } = useDailyReportQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <section>
      <header className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Daily Report</h1>
        <p className="text-sm text-slate-500">Operational overview for today.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ReportCard label="Total Orders" value={String(data?.totalOrders ?? 0)} />
        <ReportCard label="Total Sales" value={formatCurrency(data?.totalSales ?? 0)} />
        <ReportCard label="Cash" value={formatCurrency(data?.cashTotal ?? 0)} />
        <ReportCard label="Card" value={formatCurrency(data?.cardTotal ?? 0)} />
        <ReportCard label="Pending" value={formatCurrency(data?.pendingTotal ?? 0)} />
      </div>
    </section>
  );
}
