const modules = [
  "inventory",
  "table-management",
  "kitchen-display",
  "delivery",
  "loyalty",
  "analytics",
  "subscription-billing"
];

export function FutureModulesPage() {
  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">Future Modules Scaffold</h1>
        <p className="mt-1 text-sm text-slate-500">Placeholder routes are ready for phased enterprise expansion.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((moduleName) => (
          <article key={moduleName} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{moduleName}</p>
            <p className="mt-1 text-xs text-slate-500">Scaffold status: ready</p>
          </article>
        ))}
      </div>
    </section>
  );
}
