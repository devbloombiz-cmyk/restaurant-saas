export function SessionTimeoutModal({
  visible,
  onStaySignedIn,
  onLogout
}: {
  visible: boolean;
  onStaySignedIn: () => void;
  onLogout: () => void;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h2 className="text-base font-semibold text-slate-900">Session Timeout Warning</h2>
        <p className="mt-2 text-sm text-slate-600">Your session is about to expire. Stay signed in or logout safely.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={onLogout}>
            Logout
          </button>
          <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={onStaySignedIn}>
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
}
