import { useMemo, useState } from "react";
import { useReportOverviewQuery } from "@/hooks/useReportQueries";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/Skeleton";

function ReportCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="app-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

export function DailyReportsPage() {
  const today = useMemo(() => new Date(), []);
  const defaultTo = today.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const defaultFrom = sevenDaysAgo.toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useReportOverviewQuery({
    from,
    to,
    page,
    limit,
    sortBy,
    sortOrder
  });

  const totalPages = Math.max(1, Math.ceil((data?.orders.total ?? 0) / (data?.orders.limit ?? limit)));

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
      <header className="mb-4 app-card p-4">
        <h1 className="text-lg font-semibold text-slate-900">Reports & Analytics</h1>
        <p className="text-sm text-slate-500">Date-wise performance, payment split, trend and detailed order table.</p>
      </header>

      <div className="app-card mb-4 grid grid-cols-1 gap-3 p-4 md:grid-cols-6">
        <label className="text-xs text-slate-600">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
            className="mt-1 w-full px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-600">
          To
          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
            className="mt-1 w-full px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-slate-600">
          Sort By
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
            className="mt-1 w-full px-2 py-2 text-sm"
          >
            <option value="createdAt">Created At</option>
            <option value="orderNumber">Order Number</option>
            <option value="total">Total</option>
            <option value="paymentMode">Payment Mode</option>
            <option value="status">Status</option>
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Sort Order
          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value as "asc" | "desc");
              setPage(1);
            }}
            className="mt-1 w-full px-2 py-2 text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Page Size
          <select
            value={String(limit)}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="mt-1 w-full px-2 py-2 text-sm"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
        <div className="text-xs text-slate-600">
          Range
          <p className="mt-1 rounded-xl border border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-800">
            {data ? `${new Date(data.range.from).toLocaleDateString()} - ${new Date(data.range.to).toLocaleDateString()}` : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <ReportCard label="Total Orders" value={String(data?.summary.totalOrders ?? 0)} />
        <ReportCard label="Total Sales" value={formatCurrency(data?.summary.totalSales ?? 0)} />
        <ReportCard label="Average Order" value={formatCurrency(data?.summary.avgOrderValue ?? 0)} />
        <ReportCard label="Cash" value={formatCurrency(data?.paymentBreakdown.find((x) => x.paymentMode === "cash")?.totalAmount ?? 0)} />
        <ReportCard label="Card" value={formatCurrency(data?.paymentBreakdown.find((x) => x.paymentMode === "card")?.totalAmount ?? 0)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="app-card p-4">
          <h2 className="text-base font-semibold text-slate-900">Payment Breakdown</h2>
          <div className="mt-3 space-y-2">
            {(data?.paymentBreakdown ?? []).map((row) => (
              <div key={row.paymentMode} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <span className="uppercase text-slate-600">{row.paymentMode}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(row.totalAmount)} ({row.totalOrders})</span>
              </div>
            ))}
          </div>
        </article>

        <article className="app-card p-4">
          <h2 className="text-base font-semibold text-slate-900">Trend by Day</h2>
          <div className="mt-3 space-y-2">
            {(data?.trend ?? []).map((row) => (
              <div key={row.date} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <span className="text-slate-600">{row.date}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(row.totalSales)} ({row.totalOrders})</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="app-card mt-4 p-4">
        <h2 className="text-base font-semibold text-slate-900">Orders Table</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {(data?.orders.items ?? []).map((order) => (
                <tr key={order._id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-900">{order.orderNumber}</td>
                  <td className="px-3 py-2 text-slate-700">{order.orderType}</td>
                  <td className="px-3 py-2 text-slate-700">{order.paymentMode}</td>
                  <td className="px-3 py-2 text-slate-900">{formatCurrency(order.total)}</td>
                  <td className="px-3 py-2 text-slate-700">{order.status}</td>
                  <td className="px-3 py-2 text-slate-700">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {(data?.orders.items ?? []).length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={6}>
                    No orders found for the selected date range.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-slate-600">
            Page {data?.orders.page ?? page} of {totalPages} | Total records: {data?.orders.total ?? 0}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="app-btn-ghost rounded-xl px-3 py-1 disabled:opacity-50"
              disabled={(data?.orders.page ?? page) <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="app-btn-ghost rounded-xl px-3 py-1 disabled:opacity-50"
              disabled={(data?.orders.page ?? page) >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
