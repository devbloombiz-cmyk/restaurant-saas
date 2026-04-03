import { useSystemDiagnosticsQuery, useSystemHealthQuery, useSystemMetricsQuery } from "@/hooks/useSystemQueries";

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

export function SystemDiagnosticsPage() {
  const { data: health } = useSystemHealthQuery();
  const { data: metrics } = useSystemMetricsQuery();
  const { data: diagnostics } = useSystemDiagnosticsQuery();

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">Diagnostics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Enterprise runtime visibility for support and rapid failure detection.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="System Health" value={health?.status ?? "loading"} />
        <MetricCard label="API Speed" value={`${metrics?.apiResponseTimeMs ?? 0} ms`} />
        <MetricCard label="DB Latency" value={`${metrics?.dbLatencyMs ?? 0} ms`} />
        <MetricCard label="Memory RSS" value={`${Math.round((metrics?.memoryUsage?.rss ?? 0) / (1024 * 1024))} MB`} />
        <MetricCard label="Server Status" value={`PID ${diagnostics?.pid ?? "-"}`} />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Diagnostics Payload</h2>
        <pre className="mt-3 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
          {JSON.stringify(diagnostics ?? {}, null, 2)}
        </pre>
      </article>
    </section>
  );
}
